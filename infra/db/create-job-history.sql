CREATE TABLE job_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL if current
    achievements TEXT[], -- Array of bullet points
    is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    graduation_date DATE
);

ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;