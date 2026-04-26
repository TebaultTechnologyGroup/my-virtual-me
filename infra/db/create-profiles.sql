CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    desired_salary NUMERIC,
    personal_interests TEXT[],
    is_discoverable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- user can view their own profile
CREATE POLICY "Users can view and edit own profile" 
ON profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = id);

-- recruiter can view the profile if is_discoverable is true
CREATE POLICY "Recruiters can view discoverable profiles" 
ON profiles 
FOR SELECT 
USING (is_discoverable = TRUE);