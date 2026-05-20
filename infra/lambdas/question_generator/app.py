"""
question_generator/app.py

Lambda handler – generates interview questions for Virtual Me.

Depends on:
  • The "SupabaseLayer" Lambda Layer  (provides `supabase_client`)
  • IAM permissions for bedrock:InvokeModel on the configured model
  • Environment variables:
      SUPABASE_URL          – Supabase project URL
      SUPABASE_SERVICE_KEY  – Supabase service-role key
      QUESTION_MODEL_ID     – Bedrock model ID (default: Claude Haiku)
"""

from __future__ import annotations

import json
import logging
import os

import boto3

# supabase_client is provided by the Lambda Layer — not bundled in this zip.
from supabase_client import get_supabase

# ---------------------------------------------------------------------------
# Module-level initialisation (runs once per container — "warm" reuse)
# ---------------------------------------------------------------------------

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

BEDROCK_MODEL_ID = os.environ.get(
    "QUESTION_MODEL_ID",
    "us.anthropic.claude-haiku-4-5-20251001-v1:0"
)

# Boto3 clients are safe to create globally; they use the Lambda execution role.
bedrock = boto3.client("bedrock-runtime")
supabase = get_supabase()

# ---------------------------------------------------------------------------
# Repository helpers (thin wrappers around Supabase table queries)
# ---------------------------------------------------------------------------

def get_profile(user_id: str) -> dict:
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)   # profiles.id == auth.users.id (see create-profiles.sql)
        .maybe_single()
        .execute()
    )
    return result.data or {}


def get_job_history(user_id: str) -> list[dict]:
    result = (
        supabase.table("job_history")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return result.data or []


def get_skills(user_id: str) -> list[str]:
    result = (
        supabase.table("user_skills")
        .select("skill")
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        return []
    return [row.get("skill") for row in result.data if row.get("skill")]


# ---------------------------------------------------------------------------
# Payload builder
# ---------------------------------------------------------------------------

def build_user_payload(
    user_id: str,
    mode: str,
    target_jd: str | None,
    role_id: str | None,
) -> dict:
    """Aggregate all profile data into a single dict for the LLM prompt."""
    return {
        "profile": get_profile(user_id),
        "job_history": get_job_history(user_id),
        "skills": get_skills(user_id),
        "mode": mode,
        "target_job_description": target_jd,
        "target_role_id": role_id,
    }


# ---------------------------------------------------------------------------
# Bedrock invocation
# ---------------------------------------------------------------------------

def invoke_bedrock(system_prompt: str, user_content: str) -> str:
    """Call Bedrock and return the raw text response from the model."""
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": user_content}],
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.3,
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
# System prompt factory
# ---------------------------------------------------------------------------

def build_system_prompt(mode: str) -> str:
    base = (
        "You are a senior career transition consultant conducting a screening interview. "
        "Analyse the candidate's JSON profile and generate exactly 10 interview questions "
        "using this distribution:\n"
        "  • 30% Universal / Behavioral (applicable to any role)\n"
        "  • 40% Role-Specific (based on the candidate's actual job history and skills)\n"
        "  • 30% Gap-Analysis (skills the candidate appears to lack vs. senior expectations)\n\n"
        "Return ONLY a JSON array — no preamble, no markdown fences. "
        "Each element must have these exact keys:\n"
        '  "question"    – the interview question (string)\n'
        '  "intent"      – why a recruiter would ask this (string)\n'
        '  "context_tag" – one of: "universal", "technical", "leadership"\n\n'
    )

    if mode == "job_prep":
        base += (
            "A specific job description has been provided. Act as the hiring manager "
            "for that role. Weight your questions toward the skills and experience "
            "explicitly required in the job description."
        )
    else:
        base += (
            "No specific job description was provided (baseline mode). "
            "Generate broadly applicable screening questions."
        )

    return base


# ---------------------------------------------------------------------------
# Lambda handler
# ---------------------------------------------------------------------------

def lambda_handler(event: dict, context) -> dict:
    """
    Expected event payload:
    {
        "user_id": "uuid-string",          # required
        "mode": "baseline" | "job_prep",   # optional, default "baseline"
        "target_job_description": "..."    # optional, used in job_prep mode
        "target_role_id": "..."            # optional, target job role id 
    }
    """
    logger.info("Received event: %s", json.dumps(event))

    # --- Parse body (supports direct invocation OR API Gateway proxy events) ---
    if "body" in event and isinstance(event["body"], str):
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError:
            return _error(400, "Request body is not valid JSON.")
    else:
        body = event  # direct Lambda / test invocation

    user_id: str | None = body.get("user_id")
    mode: str = body.get("mode", "baseline")
    target_jd: str | None = body.get("target_job_description")
    role_id: str | None = body.get("target_role_id")

    if not user_id:
        return _error(400, "user_id is required.")

    if mode not in ("baseline", "job_prep"):
        return _error(400, f"Invalid mode '{mode}'. Must be 'baseline' or 'job_prep'.")

    # --- Fetch user data ---
    try:
        user_payload = build_user_payload(user_id, mode, target_jd, role_id)
    except Exception:
        logger.exception("Failed to fetch user data for user_id=%s", user_id)
        return _error(500, "Failed to retrieve user profile data.")

    # --- Call Bedrock ---
    try:
        raw_text = invoke_bedrock(
            system_prompt=build_system_prompt(mode),
            user_content=json.dumps(user_payload, ensure_ascii=False),
        )
    except Exception:
        logger.exception("Bedrock invocation failed")
        return _error(500, "Failed to generate questions from AI model.")

    # --- Parse model output ---
    try:
        # Strip accidental markdown fences the model sometimes emits
        clean = raw_text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        questions = json.loads(clean)
    except json.JSONDecodeError:
        logger.error("Model returned non-JSON output: %s", raw_text)
        return _error(502, "AI model returned an unexpected response format.")

    if not isinstance(questions, list):
        logger.error("Model output is not a list: %s", questions)
        return _error(502, "AI model returned an unexpected response format.")

    logger.info("Generated %d questions for user_id=%s", len(questions), user_id)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": json.dumps(questions),
    }



# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _error(status: int, message: str) -> dict:
    logger.warning("Returning %d: %s", status, message)
    return {
        "statusCode": status,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"error": message}),
    }