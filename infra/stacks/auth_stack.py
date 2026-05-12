from aws_cdk import (
    Stack,
    CfnOutput,
    RemovalPolicy,
    aws_cognito as cognito
)
from constructs import Construct

class AuthStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Corrected User Pool with valid AWS CDK v2 properties
        self.user_pool = cognito.UserPool(
            self, "VirtualMeUserPool",
            user_pool_name="my-virtual-me-users",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            # Corrected: auto_verify takes a list/struct of attributes
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            # Corrected: mutable/required attributes use StandardAttribute struct
            standard_attributes=cognito.StandardAttributes(
                fullname=cognito.StandardAttribute(required=True, mutable=True),
                email=cognito.StandardAttribute(required=True, mutable=False)
            ),
            # Corrected: password requirements mapping
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_uppercase=True,
                require_lowercase=True,
                require_digits=True,
                require_symbols=False
            ),
            # Prevents leaving orphaned Cognito pools during local dev iterations
            removal_policy=RemovalPolicy.DESTROY,
            # auto_delete_objects=True
        )

        # App Client configuration mapped for a standard React single-page app
        self.client = self.user_pool.add_client(
            "VirtualMeWebClient",
            auth_flows=cognito.AuthFlow(
                user_srp=True  # Required for standard Amplify Auth integrations
            ),
            # Essential for security: React apps cannot safely secure a client secret
            generate_secret=False 
        )

        # Exposed values needed to configure your React application environment variables
        CfnOutput(self, "UserPoolId", value=self.user_pool.user_pool_id)
        CfnOutput(self, "ClientId", value=self.client.user_pool_client_id)
