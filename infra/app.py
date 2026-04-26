#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.auth_stack import AuthStack

app = cdk.App()

# Create the instance of your stack
AuthStack(app, "VirtualMeAuthStack")

app.synth()