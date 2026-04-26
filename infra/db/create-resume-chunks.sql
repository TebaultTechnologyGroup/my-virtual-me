CREATE TABLE resume_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- The actual text of the achievement or answer
    embedding VECTOR(1024), -- Matches Amazon Titan V2 (1024 dimensions)
    metadata JSONB, -- Store info like { "type": "job_history", "company": "LogicBay" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX ON resume_chunks USING hnsw (embedding vector_cosine_ops);

ALTER TABLE resume_chunks ENABLE ROW LEVEL SECURITY;