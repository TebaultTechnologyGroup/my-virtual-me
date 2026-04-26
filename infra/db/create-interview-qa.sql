CREATE TABLE interview_qa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE -- For the Recruiter view
);

-- Shared state for multi-agent orchestration
CREATE TABLE agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    session_status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed'
    context_data JSONB, -- Shared state passed between agents
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE interview_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;