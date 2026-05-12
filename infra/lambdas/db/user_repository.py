from .supabase_client import supabase

def get_profile(user_id: str):
    result = supabase.table("profiles").select("*").eq("user_id", user_id).single().execute()
    return result.data or {}

def get_job_history(user_id: str):
    result = supabase.table("job_history").select("*").eq("user_id", user_id).execute()
    return result.data or []

def get_skills(user_id: str):
    result = supabase.table("skills").select("*").eq("user_id", user_id).execute()
    return [row["skill_name"] for row in result.data] if result.data else []
