"""
answer_reviewer/app.py

Lambda handler – Reviews user answers during training sessions.
Extracts structured STAR components or generates relevant conversational follow-up questions.

Depends on:
  • The "SupabaseLayer" Lambda Layer (provides `supabase_client`)
  • IAM permissions for bedrock:InvokeModel on the configured model
  • Environment variables:
      SUPABASE_URL_PARAM         – SSM path for Supabase URL
      SUPABASE_SERVICE_KEY_PARAM – SSM path for Supabase Service Key
      REVIEW_MODEL_ID            – Bedrock model ID
"""

from __future__ import annotations

import json
import logging
import os
import boto3

from supabase_client import get_supabase

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

BEDROCK_MODEL_ID = os.environ.get(
    "REVIEW_MODEL_ID",
    "us.anthropic.claude-haiku-4-5-20251001-v1:0"
)

bedrock = boto3.client("bedrock-runtime")
supabase = get_supabase()

# ---------------------------------------------------------------------------
# System Prompt Factory
# ---------------------------------------------------------------------------
def build_system_prompt(mode: str, job_description: str | None) -> str:
    base = (
        "You are an expert AI Interview Coach and Senior Recruiter evaluating candidate responses.\n"
        "Your task is to analyze the candidate's latest answer alongside their chat history, "
        "and determine if they have provided enough substantive context to construct a meaningful "
        "STAR (Situation, Task, Action, Result) or SAR card.\n\n"
        
        "CRITERIA FOR COMPLETION:\n"
        "To successfully output a STAR map, the user MUST have explicitly described:\n"
        "1. The business context or technical obstacle (Situation/Task).\n"
        "2. The concrete personal actions they performed (Action).\n"
        "3. A measurable or verifiable outcome, timeline, or impact (Result).\n\n"
        
        "EVALUATION PROTOCOL:\n"
        "- If the answer lacks clarity, details, or a defined outcome, DO NOT guess or generate fake facts. "
        "Instead, provide a conversational, highly targeted follow-up question digging into the missing component.\n"
        "- If they have shared enough details to map out the response, synthesize their input into clear, "
        "professional, executive-level phrases for Situation, Task, Action, and Result.\n\n"
        
        "RETURN ONLY a flat JSON object with NO markdown fences, preambles, or explanations. "
        "The object must follow one of these two strict structural variants:\n\n"
        
        "Variant A (If info is complete and ready for a STAR entry):\n"
        "{\n"
        '  "situation": "Executive summary of the situation (string)",\n'
        '  "task": "The specific objective or assignment (string, optional)",\n'
        '  "action": "The direct actions the candidate initiated and owned (string)",\n'
        '  "result": "The business impact or outcome with metrics if provided (string)"\n'
        "}\n\n"
        
        "Variant B (If more detail or clarity is needed):\n"
        "{\n"
        '  "follow_up": "A tailored question prompting the user for missing details or metrics (string)"\n'
        "}\n"
    )

    if mode == "job_prep" and job_description:
        base += (
            f"\nContext: The candidate is preparing for a specific role matching this job description:\n"
            f"\"\"\"{job_description}\"\"\"\n"
            f"Evaluate the quality and professional positioning of their actions against these target expectations."
        )
    return base

# ---------------------------------------------------------------------------
# Bedrock Invocation
# ---------------------------------------------------------------------------
def invoke_bedrock(system_prompt: str, user_content: str) -> str:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": user_content}],
            }
        ],
        "max_tokens": 1200,
        "temperature": 0.2,
    }
    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )
    payload = json.loads(response["body"].read())
    return payload.get("content", [{}])[0].get("text", "").strip()

# ---------------------------------------------------------------------------
# Lambda Entrypoint
# ---------------------------------------------------------------------------
def lambda_handler(event: dict, context) -> dict:
    logger.info("Received event: %s", json.dumps(event))

    # Support API Gateway parsing or direct payload testing
    if "body" in event and isinstance(event["body"], str):
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError:
            return _error(400, "Request body must be valid JSON.")
    else:
        body = event

    # Extract payloads expected by TrainingSession.tsx
    user_id: str | None = body.get("user_id")
    question: str | None = body.get("question")
    answer: str | None = body.get("answer")
    history: list = body.get("history", [])
    mode: str = body.get("mode", "baseline")
    job_description: str | None = body.get("job_description")

    if not user_id or not question or not answer:
        return _error(400, "Missing required parameters: user_id, question, and answer are mandatory.")

    # Package input payload for context matching
    llm_payload = {
        "interview_question": question,
        "latest_user_answer": answer,
        "conversation_history": history,
        "mode": mode
    }

    try:
        system_prompt = build_system_prompt(mode, job_description)
        raw_text = invoke_bedrock(system_prompt, json.dumps(llm_payload, ensure_ascii=False))
        
        # Guard against Markdown fences leaking into responses
        clean = raw_text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        review_result = json.loads(clean)
        
    except json.JSONDecodeError:
        logger.error("LLM failed to output standard JSON text structure: %s", raw_text)
        return _error(502, "Model generated an invalid text format.")
    except Exception:
        logger.exception("Internal analyzer processing error.")
        return _error(500, "Failed to analyze answer via AI model engine.")

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": json.dumps(review_result),
    }

def _error(status: int, message: str) -> dict:
    logger.warning("Returning error %d: %s", status, message)
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        "body": json.dumps({"error": message}),
    }