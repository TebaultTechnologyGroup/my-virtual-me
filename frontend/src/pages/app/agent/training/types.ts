// ─── Shared types for the Agent Training feature ─────────────────────────────
// Import these in TrainingStudio, TrainingInstructions, TrainingSession, etc.

export interface TargetRole {
    id: string;
    role_title: string;
    prof_summary?: string;
}

export type TrainingMode = "baseline" | "job_prep";

export type ContextTag = "universal" | "technical" | "leadership";

export interface Question {
    id: string;           // uuid – set client-side after generation
    question: string;
    intent?: string;
    context_tag: ContextTag;
}

export interface Message {
    id: string;           // uuid
    role: "ai" | "user";
    content: string;
    timestamp: Date;
}

export interface StarDraft {
    situation: string;
    task?: string;        // optional – SAR pattern omits task
    action: string;
    result: string;
}

// Shape that TrainingInstructions calls onStartTraining with
export interface StartTrainingParams {
    roleId: string;
    roleTitle: string;
    jobDescription: string | null;
}

// Shape passed down to TrainingSession
export interface SessionConfig {
    questions: Question[];
    mode: TrainingMode;
    roleTitle: string;
    jobDescription: string | null;
}