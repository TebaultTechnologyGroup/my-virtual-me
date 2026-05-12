import json
import os
import requests

# Initialize global clients outside the handler to leverage container reuse
# For example, catching an environment variable passed from CDK
ENV_NAME = os.environ.get("ENVIRONMENT", "production")

def lambda_handler(event, context):
    """
    AWS Lambda handler for generating questions.
    """
    try:
        # 1. Parse incoming body if sent from a React frontend POST request
        body = {}
        if event.get("body"):
            body = json.loads(event["body"])
            
        # 2. Add your business logic here
        topic = body.get("topic", "General Knowledge")
        generated_question = f"What is a key concept in {topic}?"
        
        # 3. Return API Gateway structured response with required CORS headers
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  # Required for React integration
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            "body": json.dumps({
                "status": "success",
                "env": ENV_NAME,
                "question": generated_question
            })
        }
        
    except Exception as e:
        print(f"Error generating question: {str(e)}") # Automatically routes to CloudWatch
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "Failed to generate question"})
        }
