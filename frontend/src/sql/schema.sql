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

--2. PROFESSIONAL SUMMARRIES
CREATE TABLE IF NOT EXISTS professional_summaries (
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
  accomplishments TEXT[] DEFAULT '{}',
  awards TEXT[] DEFAULT '{}',
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

-- 5. USER SKILLS (Structured Inventory)
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL, -- e.g., 'rag'
   UNIQUE(user_id, skill)
);

-- 5a. SKILLS (Skills Inventory)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill TEXT NOT NULL, -- e.g., 'rag'
  UNIQUE(skill)
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
ALTER TABLE professional_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

---
-- CREATE POLICIES (Using Cognito 'sub' via auth.jwt())
---

-- Example Policy for Profiles (Apply similar logic to all tables)
CREATE POLICY "Users can only access their own profile" 
ON profiles FOR ALL 
USING (auth.jwt() ->> 'sub' = id);

-- Professional Summaries Policy
CREATE POLICY "Users can only access their own summaries" 
ON professional_summaries FOR ALL 
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


-- Create policy for authenticated users only
CREATE POLICY "Authenticated users can read and write skills" 
ON skills 
FOR ALL 
TO authenticated 
USING (auth.jwt() IS NOT NULL) 
WITH CHECK (auth.jwt() IS NOT NULL);

-- seed skills table with common skills (this can be expanded over time)
INSERT INTO skills (skill) VALUES
('ASP.NET'), ('AWS'), ('Account Accounting'), ('Account Management'), ('Account-Based Marketing (ABM)'), 
('Active Listening'), ('Adaptability'), ('Adobe Illustrator'), ('Adobe Photoshop'), ('Adobe XD'), 
('Affiliate Marketing'), ('Agile'), ('Analytical Thinking'), ('Android SDK'), ('Angular'), 
('Artificial Intelligence'), ('Asana'), ('Attention to Detail'), ('Auditing'), ('Automotive Sales'), 
('Azure'), ('B2B Sales'), ('B2C Sales'), ('Bash'), ('Bookkeeping'), 
('Bootstrap'), ('Brand Management'), ('Budgeting'), ('Business Acumen'), ('Business Analysis'), 
('Business Development'), ('Business Development Representative (BDR)'), ('C#'), ('C++'), ('CSS3'), 
('Change Management'), ('Channel Sales'), ('Closing Deals'), ('Closing Techniques'), ('Cold Calling'), 
('Communication'), ('Competitive Analysis'), ('Compliance'), ('Conflict Resolution'), ('Confluence'), 
('Consultative Selling'), ('Content Strategy'), ('Continuous Deployment'), ('Continuous Integration'), ('Contract Management'), 
('Contract Negotiation'), ('Corporate Governance'), ('Crisis Management'), ('Critical Thinking'), ('Cross-selling'), 
('Cryptography'), ('Customer Acquisition'), ('Customer Advocacy'), ('Customer Behavior Analysis'), ('Customer Discovery'), 
('Customer Relationship Management (CRM)'), ('Customer Retention'), ('Customer Satisfaction (CSAT)'), ('Customer Success'), ('Customer Support'), 
('Cybersecurity'), ('Data Analysis'), ('Data Governance'), ('Decision Making'), ('Deep Learning'), 
('Design Thinking'), ('DevOps'), ('Digital Sales Tools'), ('Direct Sales'), ('Django'), 
('Docker'), ('E-commerce'), ('ERP Systems'), ('Elasticsearch'), ('Emotional Intelligence'), 
('Empathy'), ('Employee Engagement'), ('Entrepreneurship'), ('Ethical Hacking'), ('Event Planning'), 
('Executive Coaching'), ('Express.js'), ('Field Sales'), ('Figma'), ('Financial Analysis'), 
('Firebase'), ('Firewalls'), ('Flask'), ('Flexibility'), ('Flutter'), 
('Forecasting'), ('Fundraising'), ('Git'), ('GitHub'), ('GitLab'), 
('Goal Oriented'), ('Google Cloud'), ('Grant Writing'), ('GraphQL'), ('Growth Hacking'), 
('HTML5'), ('Hadoop'), ('HubSpot'), ('Human Resources'), ('InVision'), 
('Incident Response'), ('Influencer Marketing'), ('Information Security'), ('Innovation Management'), ('Inside Sales'), 
('Insurance Sales'), ('Integrity'), ('Interpersonal Communication'), ('Interpersonal Skills'), ('Investor Relations'), 
('Java'), ('JavaScript'), ('Jenkins'), ('Jira'), ('Kanban'), 
('Key Account Management'), ('Kubernetes'), ('Laravel'), ('Lead Generation'), ('Lead Nurturing'), 
('Lead Scoring'), ('Leadership'), ('Lean Management'), ('Linux'), ('Machine Learning'), 
('Market Intelligence'), ('Market Penetration'), ('Market Research'), ('Marketing Strategy'), ('Matplotlib'), 
('Medical Sales'), ('Mentoring'), ('Microservices'), ('Microsoft Dynamics'), ('Microsoft Excel'), 
('Microsoft Office'), ('Microsoft Project'), ('Mobile Development'), ('Monday.com'), ('MongoDB'), 
('Multicultural Awareness'), ('MySQL'), ('Negotiation'), ('Negotiation Skills'), ('Net Promoter Score (NPS)'), 
('Network Security'), ('Networking'), ('NoSQL'), ('Node.js'), ('Non-profit Management'), 
('NumPy'), ('Objection Handling'), ('Operations Management'), ('Oracle Database'), ('Organizational Design'), 
('Outside Sales'), ('PHP'), ('Pandas'), ('Partnership Management'), ('Penetration Testing'), 
('Performance Management'), ('Persuasion'), ('Pipedrive'), ('Pipeline Forecasting'), ('Policy Development'), 
('PostgreSQL'), ('Power BI'), ('PowerShell'), ('Presentation Skills'), ('Pricing Strategy'), 
('Problem Solving'), ('Process Improvement'), ('Product Demos'), ('Product Lifecycle Management'), ('Product Management'), 
('Project Management'), ('Proposal Writing'), ('Prospecting'), ('Prototyping'), ('Public Relations'), 
('Public Speaking'), ('Public Speaking for Sales'), ('PyTorch'), ('Python'), ('Quality Assurance'), 
('QuickBooks'), ('Quota Attainment'), ('R Programming'), ('REST API'), ('React'), 
('React Native'), ('Real Estate Sales'), ('Recruiting'), ('Redis'), ('Redux'), 
('Referral Marketing'), ('Relationship Building'), ('Reliability'), ('Remote Selling'), ('Resilience'), 
('Resourcefulness'), ('Retail Sales'), ('Revenue Growth'), ('Risk Assessment'), ('Risk Management'), 
('Ruby'), ('SAP'), ('SASS'), ('SEM'), ('SEO'), 
('SQL'), ('SaaS Sales'), ('Sales Analysis'), ('Sales Development Representative (SDR)'), ('Sales Forecasting'), 
('Sales Funnel Optimization'), ('Sales Leadership'), ('Sales Management'), ('Sales Operations'), ('Sales Pipeline Management'), 
('Sales Presentations'), ('Sales Reporting'), ('Sales Strategy'), ('Sales Training'), ('Salesforce'), 
('Scikit-Learn'), ('Scrum'), ('Self-Motivation'), ('Self-Starter'), ('Shell Scripting'), 
('Six Sigma'), ('Sketch'), ('Social Media Marketing'), ('Social Selling'), ('Solution Selling'), 
('Spark'), ('Spring Boot'), ('Stakeholder Management'), ('Storytelling'), ('Strategic Planning'), 
('Strategic Selling'), ('Supply Chain Management'), ('Sustainability'), ('Swift'), ('System Administration'), 
('Systems Thinking'), ('Tableau'), ('Tailwind CSS'), ('Tax Preparation'), ('Teamwork'), 
('Technical Sales'), ('Telemarketing'), ('TensorFlow'), ('Terraform'), ('Territory Management'), 
('Territory Planning'), ('Time Management'), ('Time Management for Sales'), ('Trade Shows'), ('Training and Development'), 
('Trello'), ('TypeScript'), ('UI/UX Design'), ('Unit Testing'), ('Unix'), 
('Upselling'), ('VPN'), ('Vendor Management'), ('Venture Capital'), ('Verbal Communication'), 
('Volunteer Management'), ('Vue.js'), ('WebAssembly'), ('Work Ethic'), ('Written Communication'), 
('Zendesk'), ('Zoho CRM'), ('iOS Development'), ('jQuery');
