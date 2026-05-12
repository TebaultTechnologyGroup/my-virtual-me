"""
infra/stacks/backend_stack.py

Defines:
  • SupabaseLayer        – Lambda Layer: packages supabase-py so every function
                           can do `from supabase_client import get_supabase`
                           without bundling the library into each zip.
  • QuestionGeneratorFn  – First real Lambda; attaches the layer and receives
                           config via environment variables + SSM for secrets.
  • VirtualMeApi         – API Gateway wired to QuestionGeneratorFn.

SSM Parameter convention used in this stack:
  /virtual-me/<service>/<key-name>   e.g. /virtual-me/supabase/service-key

Adding a new Lambda later — three-step pattern:
  1. Create the Function and attach `supabase_layer`.
  2. Set SUPABASE_URL and SUPABASE_SERVICE_KEY_PARAM in `environment`.
  3. Call _grant_ssm(fn, SSM_SUPABASE_KEY_PARAM) and add Bedrock policy if needed.
"""

from aws_cdk import (
    Duration,
    Stack,
    aws_apigateway as apigw,
    aws_iam as iam,
    aws_lambda as _lambda,
)
from constructs import Construct

# ------------------------------------------------------------------
# SSM parameter paths — centralised here so every Lambda in this
# stack references the same name and there is one place to change.
# Create the actual parameter once via the AWS Console or CLI:
#   aws ssm put-parameter \
#     --name /virtual-me/supabase/service-key \
#     --value "<your-service-role-key>" \
#     --type SecureString \
#     --profile virtual-me
# ------------------------------------------------------------------
SSM_SUPABASE_KEY_PARAM = "/virtual-me/supabase/service-key"


class BackendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ------------------------------------------------------------------
        # Lambda Layer — Supabase client
        # ------------------------------------------------------------------
        # CDK bundles this layer by running pip inside the official Lambda
        # build image, then copying our supabase_client.py alongside the
        # installed packages.  Lambda prepends the layer's `python/` directory
        # to sys.path automatically, so `from supabase_client import get_supabase`
        # works in any function that attaches this layer.
        supabase_layer = _lambda.LayerVersion(
            self,
            "SupabaseLayer",
            layer_version_name="virtual-me-supabase",
            description="supabase-py + shared supabase_client.py helper",
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_14],
            code=_lambda.Code.from_asset(
                path="layers/supabase",
                bundling={
                    "image": _lambda.Runtime.PYTHON_3_14.bundling_image,
                    "command": [
                        "bash", "-c",
                        (
                            "pip install -r /asset-input/requirements.txt -t /asset-output/python "
                            "&& cp -r /asset-input/python/. /asset-output/python/"
                        ),
                    ],
                },
            ),
        )

        # ------------------------------------------------------------------
        # question_generator Lambda
        # ------------------------------------------------------------------
        question_lambda = _lambda.Function(
            self,
            "QuestionGeneratorHandler",
            function_name="virtual-me-question-generator",
            runtime=_lambda.Runtime.PYTHON_3_14,
            handler="app.lambda_handler",
            timeout=Duration.seconds(30),  # Bedrock calls can be slow
            memory_size=256,
            layers=[supabase_layer],
            environment={
                # ── Plain config (not secret — safe to store here) ──────────
                #
                # The Supabase project URL is not a secret; it identifies
                # which project to connect to but grants no access on its own.
                "SUPABASE_URL": "https://kuynbrmpfncmpgtcvvrd.supabase.co",
                #
                # The Bedrock model ID is just a selector string.
                "QUESTION_MODEL_ID": "anthropic.claude-haiku-4-5-20251001-v1:0",
                #
                # ── SSM pointer (not the secret itself) ─────────────────────
                #
                # We store only the SSM *parameter path* here, not the key
                # value.  At runtime, supabase_client.py calls ssm.get_parameter
                # with WithDecryption=True to fetch the actual SecureString.
                #
                # This means:
                #   • The secret never appears in CloudFormation templates,
                #     CDK assets, Lambda config pages, or CloudWatch logs.
                #   • Rotating the key only requires updating the SSM value —
                #     no CDK redeploy needed.
                #   • IAM controls exactly which functions can read which params
                #     (see _grant_ssm_read below).
                "SUPABASE_SERVICE_KEY_PARAM": SSM_SUPABASE_KEY_PARAM,
            },
            code=_lambda.Code.from_asset(
                path="lambdas/question_generator",
                # No pip bundling — the layer provides all dependencies.
            ),
        )

        # ── Grant SSM read access ────────────────────────────────────────────
        # add_to_role_policy attaches an inline policy statement directly to
        # the Lambda's auto-generated execution role.  We scope the resource
        # ARN to the exact parameter path rather than using a wildcard so that
        # this function cannot read any other parameters — least-privilege.
        #
        # self.region / self.account are CDK tokens resolved at deploy time,
        # so this ARN is always correct regardless of which AWS account or
        # region you deploy to.
        _grant_ssm_read(question_lambda, SSM_SUPABASE_KEY_PARAM, self.region, self.account)

        # ── Grant Bedrock access ─────────────────────────────────────────────
        # Scoped to only the Haiku model this function actually uses.
        # Swap the resource ARN for the Sonnet ARN on functions that need it.
        question_lambda.add_to_role_policy(
            iam.PolicyStatement(
                sid="AllowBedrockHaiku",
                actions=["bedrock:InvokeModel"],
                resources=[
                    f"arn:aws:bedrock:{self.region}::foundation-model/"
                    "anthropic.claude-haiku-4-5-20251001-v1:0"
                ],
            )
        )

        # ------------------------------------------------------------------
        # API Gateway
        # ------------------------------------------------------------------
        api = apigw.LambdaRestApi(
            self,
            "VirtualMeApi",
            rest_api_name="virtual-me-api",
            handler=question_lambda,
            proxy=False,
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS,
                allow_headers=["Content-Type", "Authorization"],
            ),
        )

        questions_resource = api.root.add_resource("questions")
        questions_resource.add_method("POST")

        # ------------------------------------------------------------------
        # Public references (consumed by other stacks or tests)
        # ------------------------------------------------------------------
        self.supabase_layer = supabase_layer
        self.question_lambda = question_lambda
        self.api = api


# ----------------------------------------------------------------------
# Module-level helper — reusable for every Lambda you add later
# ----------------------------------------------------------------------

def _grant_ssm_read(
    fn: _lambda.Function,
    param_path: str,
    region: str,
    account: str,
) -> None:
    """
    Add an inline policy that allows ``fn`` to call ssm:GetParameter on
    exactly one SecureString path — nothing more.

    Usage (for each new Lambda that needs a secret):
        _grant_ssm_read(my_lambda, "/virtual-me/some/secret", self.region, self.account)
    """
    fn.add_to_role_policy(
        iam.PolicyStatement(
            sid="AllowSSMRead" + param_path.replace("/", "").replace("-", ""),
            actions=["ssm:GetParameter"],
            # Parameter ARNs do not use a double-colon before the path.
            # Format: arn:aws:ssm:<region>:<account>:parameter/<path-without-leading-slash>
            resources=[
                f"arn:aws:ssm:{region}:{account}:parameter"
                f"{param_path}"   # param_path already has a leading /
            ],
        )
    )