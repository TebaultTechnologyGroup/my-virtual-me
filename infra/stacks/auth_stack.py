from aws_cdk import (
    aws_cognito as cognito,
    Stack,
    CfnOutput,
    RemovalPolicy
)
from constructs import Construct

class AuthStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # User Pool matching your Virtual Me spec [cite: 53]
        self.user_pool = cognito.UserPool(
    self, "VirtualMeUserPool",
    user_pool_name="my-virtual-me-users",
    self_sign_up_enabled=True, # Corrected
    sign_in_aliases=cognito.SignInAliases(email=True), # Corrected
    auto_verify=cognito.AutoVerifiedAttrs(email=True), # 'auto_verify' is snake_case; 'AutoVerifiedAttrs' is Pascal
    standard_attributes=cognito.StandardAttributes( # Corrected
        fullname=cognito.StandardAttribute(required=True, mutable=True),
        email=cognito.StandardAttribute(required=True, mutable=False)
    ),
    password_policy=cognito.PasswordPolicy( # Corrected
        min_length=8,
        require_uppercase=True,
        require_lowercase=True,
        require_digits=True
    ),
    removal_policy=RemovalPolicy.DESTROY # Corrected
)

        # App Client for the React frontend
        self.client = self.user_pool.add_client(
            "VirtualMeWebClient",
            auth_flows=cognito.AuthFlow(
                user_srp=True  # Secure Remote Password for custom UI login
            )
        )

        CfnOutput(self, "UserPoolId", value=self.user_pool.user_pool_id)
        CfnOutput(self, "ClientId", value=self.client.user_pool_client_id)