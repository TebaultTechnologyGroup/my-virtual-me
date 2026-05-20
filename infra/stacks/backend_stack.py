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
SSM_SUPABASE_KEY_PARAM = "/virtualme/supabase/service-key"  
SSM_SUPABASE_URL_PARAM = "/virtualme/supabase/url"


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
                "SUPABASE_URL_PARAM": SSM_SUPABASE_URL_PARAM,
                "SUPABASE_SERVICE_KEY_PARAM": SSM_SUPABASE_KEY_PARAM,
                "QUESTION_MODEL_ID": "us.anthropic.claude-haiku-4-5-20251001-v1:0",                                     
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
        _grant_ssm_read(question_lambda, SSM_SUPABASE_URL_PARAM, self.region, self.account)

        # ── Grant Bedrock access ─────────────────────────────────────────────
        # Scoped to only the Haiku model this function actually uses.
        # Swap the resource ARN for the Sonnet ARN on functions that need it.

        question_lambda.add_to_role_policy(
            iam.PolicyStatement(
                sid="AllowBedrockHaiku",
                actions=["bedrock:InvokeModel"],
                resources=[
                    # Wildcard region needed — cross-region inference profiles
                    # route internally across us-east-1, us-east-2, us-west-2
                    "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
                    f"arn:aws:bedrock:*:{self.account}:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0",
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
        )

        questions_resource = api.root.add_resource(
            "questions",
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=["POST", "OPTIONS"],
                allow_headers=["Content-Type", "Authorization"],
            ),
        )
        questions_resource.add_method(
            "POST",
            apigw.LambdaIntegration(question_lambda),
        )

        # ------------------------------------------------------------------
        # Public references (consumed by other stacks or tests)
        # ------------------------------------------------------------------
        self.supabase_layer = supabase_layer
        self.question_lambda = question_lambda
        self.api = api

         # ------------------------------------------------------------------
        # answer_reviewer Lambda
        # ------------------------------------------------------------------
        answer_reviewer_lambda = _lambda.Function(
            self,
            "AnswerReviewerHandler",
            function_name="virtual-me-answer-reviewer",
            runtime=_lambda.Runtime.PYTHON_3_14,
            handler="app.lambda_handler",
            timeout=Duration.seconds(30), # LLM reasoning passes may take time
            memory_size=256,
            layers=[supabase_layer],
            environment={
                "SUPABASE_URL_PARAM": SSM_SUPABASE_URL_PARAM,
                "SUPABASE_SERVICE_KEY_PARAM": SSM_SUPABASE_KEY_PARAM,
                "REVIEW_MODEL_ID": "us.anthropic.claude-haiku-4-5-20251001-v1:0",
            },
            code=_lambda.Code.from_asset(
                path="lambdas/answer_reviewer",
            ),
        )

        # Grant SSM parameter tree permissions using your module helper
        _grant_ssm_read(answer_reviewer_lambda, SSM_SUPABASE_KEY_PARAM, self.region, self.account)
        _grant_ssm_read(answer_reviewer_lambda, SSM_SUPABASE_URL_PARAM, self.region, self.account)

        # Grant target evaluation infrastructure access policies
        answer_reviewer_lambda.add_to_role_policy(
            iam.PolicyStatement(
                sid="AllowBedrockHaikuForReview",
                actions=["bedrock:InvokeModel"],
                resources=[
                    "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
                    f"arn:aws:bedrock:*:{self.account}:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0",
                ],
            )
        )

        # ------------------------------------------------------------------
        # API Gateway Route Addition
        # ------------------------------------------------------------------
        review_resource = api.root.add_resource(
            "review_answer",
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=["POST", "OPTIONS"],
                allow_headers=["Content-Type", "Authorization"],
            ),
        )
        review_resource.add_method(
            "POST",
            apigw.LambdaIntegration(answer_reviewer_lambda),
        )


# ----------------------------------------------------------------------
# Module-level helper — reusable for every Lambda you add later
# ----------------------------------------------------------------------

def _grant_ssm_read(
    fn: _lambda.Function,
    param_path: str,
    region: str,
    account: str,
    ) -> None:
    fn.add_to_role_policy(
        iam.PolicyStatement(
            sid="AllowSSMRead" + param_path.replace("/", "").replace("-", ""),
            actions=[
                "ssm:GetParameter",    # single
                "ssm:GetParameters",   # plural — used by get_parameters() batch call
            ],
            resources=[
                f"arn:aws:ssm:{region}:{account}:parameter{param_path}"
            ],
        )
    )