import { useState, useEffect } from "react";
import { getCurrentUser } from "@aws-amplify/auth";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api_client";
import TrainingInstructions from "./components/TrainingInstructions";
import TrainingSession from "./components/TrainingSession";
import GeneratingQuestions from "./components/GeneratingQuestions";
import type {
  Question,
  SessionConfig,
  StartTrainingParams,
  TrainingMode,
} from "./types";
import { supabase } from "@/lib/supabase-client";

// ─── Phase ───────────────────────────────────────────────────────────────────
type Phase = "instructions" | "loading" | "session";

// ─── Raw shape returned by the Lambda ────────────────────────────────────────
interface RawQuestion {
  question: string;
  intent?: string;
  context_tag: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TrainingStudio() {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null,
  );

  // ── Check for existing unanswered questions on mount ────────────────────
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        setCheckingExisting(true);
        const user = await getCurrentUser();

        // Fetch questions that don't have a linked answer/response yet
        // This assumes an 'is_answered' boolean or a join with an 'answers' table
        const { data: existingQuestions, error } = await supabase
          .from("interview_qa")
          .select(
            `
            id, 
            question,
            situation,
            task,
            action,
            result,
            context_tag, 
            target_role_id,
            is_answered,
            target_roles (
              role_title
            )
          `,
          )
          .eq("user_id", user.userId)
          .eq("is_answered", false)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (existingQuestions && existingQuestions.length > 0) {
          const questions: Question[] = existingQuestions.map((q: any) => ({
            id: q.id,
            question: q.question,
            situation: q.situation,
            task: q.task,
            action: q.action,
            result: q.result,
            context_tag: q.context_tag,
            target_role_id: q.target_role_id,
            is_answered: q.is_answered,
            role_title: q.role_title,
          }));

          setSessionConfig({
            questions,
            mode: "baseline", // existingQuestions[0].mode as TrainingMode,
            roleTitle:
              existingQuestions[0].target_roles[0].role_title || "Resumed Role",
            jobDescription: null, // Usually stored elsewhere or not needed for resume
          });
          setPhase("session");
        }
      } catch (err) {
        console.error("Error checking for existing session:", err);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingSession();
  }, []);

  // ── Start training: fetch questions from Lambda, then enter session ──────
  const handleStartTraining = async ({
    roleId,
    roleTitle,
    jobDescription,
  }: StartTrainingParams) => {
    setPhase("loading");

    try {
      const user = await getCurrentUser();
      const mode: TrainingMode = jobDescription ? "job_prep" : "baseline";

      // 1. Fetch questions from Lambda
      const raw = await apiFetch<RawQuestion[]>("/questions", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.userId,
          mode,
          ...(jobDescription && { target_job_description: jobDescription }),
        }),
      });

      if (!raw || raw.length === 0) {
        throw new Error("No questions returned from the server.");
      }

      // 2. Prepare data for Supabase and local state
      const questionsToInsert = raw.map((q) => ({
        user_id: user.userId,
        question: q.question,
        intent: q.intent,
        context_tag: q.context_tag ?? "universal",
      }));

      // 3. Save to Supabase
      const { data: savedData, error: dbError } = await supabase
        .from("interview_qa")
        .insert(questionsToInsert)
        .select();

      if (dbError) throw dbError;

      // 4. Map saved data (including DB-generated IDs) to your local state
      const questions: Question[] = savedData.map((sq: any) => ({
        id: sq.id, // Use the actual DB UUID
        question: sq.question,
        intent: sq.intent,
        context_tag: sq.context_tag as Question["context_tag"],
      }));

      setSessionConfig({ questions, mode, roleTitle, jobDescription });
      setPhase("session");
    } catch (err) {
      console.error("Failed to generate or save questions:", err);
      toast.error("Could not prepare your training session. Please try again.");
      setPhase("instructions");
    }
  };

  // ── Allow the session to restart from scratch ────────────────────────────
  const handleRestartTraining = () => {
    setSessionConfig(null);
    setPhase("instructions");
  };

  // ── Render the correct phase ─────────────────────────────────────────────
  if (phase === "loading") {
    return <GeneratingQuestions />;
  }

  if (phase === "session" && sessionConfig) {
    return (
      <TrainingSession
        config={sessionConfig}
        onRestart={handleRestartTraining}
      />
    );
  }

  // Default: instructions
  return <TrainingInstructions onStartTraining={handleStartTraining} />;
}
