-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- This is the Cognito 'sub'
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  linkedin_url TEXT,
  plan_name TEXT DEFAULT 'Free',
  hobbies TEXT,
  other_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NARRATIVE PILLARS
CREATE TABLE IF NOT EXISTS narrative_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB HISTORY
CREATE TABLE IF NOT EXISTS job_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  location TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_month TEXT,
  start_year TEXT,
  end_month TEXT,
  end_year TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. JOB DETAILS (Accomplishments and Awards)
CREATE TABLE IF NOT EXISTS job_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_history(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('accomplishment', 'award')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SKILLS (Structured Inventory)
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  skill_value TEXT NOT NULL, -- e.g., 'rag'
  skill_label TEXT NOT NULL, -- e.g., 'RAG (Retrieval-Augmented Generation)'
  UNIQUE(user_id, skill_value)
);

-- 6. EDUCATION
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT,
  start_month TEXT,
  start_year TEXT,
  end_month TEXT,
  end_year TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  gpa TEXT,
  clubs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INTERVIEW Q&A (STAR Method)
CREATE TABLE IF NOT EXISTS interview_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

---
-- ENABLE ROW LEVEL SECURITY (RLS)
---

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_qa ENABLE ROW LEVEL SECURITY;

---
-- CREATE POLICIES (Using Cognito 'sub' via auth.jwt())
---

-- Example Policy for Profiles (Apply similar logic to all tables)
CREATE POLICY "Users can only access their own profile" 
ON profiles FOR ALL 
USING (auth.jwt() ->> 'sub' = id);

-- Narrative Pillars Policy
CREATE POLICY "Users can only access their own pillars" 
ON narrative_pillars FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);

-- Job History Policy
CREATE POLICY "Users can only access their own jobs" 
ON job_history FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);

-- Job Details Policy
CREATE POLICY "Users can only access their own job details" 
ON job_details FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);

-- Skills Policy
CREATE POLICY "Users can only access their own skills" 
ON user_skills FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);

-- Education Policy
CREATE POLICY "Users can only access their own education" 
ON education FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);

-- Certifications Policy
CREATE POLICY "Users can only access their own certs" 
ON certifications FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);

-- Interview QA Policy
CREATE POLICY "Users can only access their own QA" 
ON interview_qa FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id);