#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.auth_stack import AuthStack
from stacks.backend_stack import BackendStack

app = cdk.App()

# Create the instance of your stack
AuthStack(app, "AuthStack")

# Create backend stack
BackendStack(app, "VirtualMeBackendStack")

app.synth()