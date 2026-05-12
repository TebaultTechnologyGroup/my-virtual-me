from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw
)
from constructs import Construct


from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw
)
from constructs import Construct

class BackendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Updated Lambda Definition with Automagic Local Asset Bundling
        self.question_lambda = _lambda.Function(
            self, "QuestionGeneratorHandler",
            runtime=_lambda.Runtime.PYTHON_3_14, 
            handler="app.lambda_handler",
            code=_lambda.Code.from_asset(
                path="lambdas/question_generator",
                bundling={
                    "image": _lambda.Runtime.PYTHON_3_14.bundling_image,
                    "command": [
                        "bash", "-c",
                        "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output"
                    ]
                }
            )
        )

        # Rest of your API Gateway code remains unchanged...
        api = apigw.LambdaRestApi(
            self, "VirtualMeApi",
            handler=self.question_lambda,
            proxy=False,
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS
            )
        )
        questions_resource = api.root.add_resource("questions")
        questions_resource.add_method("POST")


