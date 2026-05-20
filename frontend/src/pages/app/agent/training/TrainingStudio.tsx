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
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null,
  );

  // ── Check for existing unanswered questions on mount ────────────────────
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const user = await getCurrentUser();

        //get the training session
        const { data: trainingSessionData, error: trainingSessionError } =
          await supabase
            .from("training_sessions")
            .select(`id, mode, job_description, target_roles(role_title)`)
            .eq("user_id", user.userId)
            .order("created_at", { ascending: true });

        if (trainingSessionError) throw trainingSessionError;

        // Guard: no session exists yet, nothing to restore
        if (!trainingSessionData || trainingSessionData.length === 0) {
          console.log("No existing training session found.");
          return;
        }

        const training_session_id = trainingSessionData[0].id;
        const mode = trainingSessionData[0].mode;
        const jobDescription =
          trainingSessionData[0].job_description ?? undefined;

        // the default type expects target_roles to be an array, so cast it to a single object
        const targetRole = trainingSessionData[0].target_roles
          ? (
              trainingSessionData[0].target_roles as unknown as {
                role_title: string;
              }
            ).role_title
          : "Undefined Role";

        const { data: existingQuestions, error } = await supabase
          .from("interview_qa")
          .select(
            `id,
            question,
            intent,
            situation,
            task,
            action,
            result,
            context_tag, 
            is_answered            
          `,
          )
          .eq("training_session_id", training_session_id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        console.log("Existing questions:", existingQuestions); // confirm shape

        if (existingQuestions && existingQuestions.length > 0) {
          const questions: Question[] = existingQuestions.map((q: any) => ({
            id: q.id,
            question: q.question,
            intent: q.intent,
            situation: q.situation,
            task: q.task,
            action: q.action,
            result: q.result,
            context_tag: q.context_tag,
            is_answered: q.is_answered,
          }));

          const answeredIds = new Set<string>(
            questions.filter((q) => q.is_answered).map((q) => q.id),
          );
          const firstUnansweredIndex = questions.findIndex(
            (q) => !q.is_answered,
          );

          setSessionConfig({
            questions,
            mode,
            jobDescription,
            targetRole,
            answeredIds,
            firstUnansweredIndex,
          });

          setPhase("session");
        }
      } catch (err) {
        console.error("Error checking for existing session:", err);
      }
    };
    checkExistingSession();
  }, []);

  // ── Start training: fetch questions from Lambda, then enter session ──────
  const handleStartTraining = async ({
    targetRoleId,
    targetRole,
    jobDescription,
  }: StartTrainingParams) => {
    setPhase("loading");

    try {
      const user = await getCurrentUser();
      const mode: TrainingMode = jobDescription ? "job_prep" : "baseline";

      // create a new training sessions
      const sessionToInsert = {
        user_id: user.userId,
        mode: mode,
        job_description: jobDescription,
        target_role_id: targetRoleId,
      };
      const { data: sessionData, error: sessionError } = await supabase
        .from("training_sessions")
        .insert(sessionToInsert)
        .select();

      if (sessionError) throw sessionError;

      const training_session_id = sessionData[0].id;

      // 1. Fetch questions from Lambda
      const raw = await apiFetch<RawQuestion[]>("/questions", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.userId,
          mode: mode,
          target_job_description: jobDescription,
          target_job_id: targetRoleId,
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
        training_session_id: training_session_id,
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
        situation: sq.situation,
        intent: sq.intent,
        task: sq.task,
        action: sq.action,
        result: sq.result,
        context_tag: sq.context_tag,
        target_role_id: sq.target_role_id,
        is_answered: sq.is_answered,
      }));

      const answeredIds = new Set<string>();
      const firstUnansweredIndex = 0;

      setSessionConfig({
        questions,
        mode,
        jobDescription,
        targetRole,
        answeredIds,
        firstUnansweredIndex,
      });

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
