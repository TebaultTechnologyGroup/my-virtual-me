import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@aws-amplify/auth";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  BriefcaseBusiness,
  Target,
  RotateCcw,
  PartyPopper,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase-client";
import { apiFetch } from "@/lib/api_client";
import QuestionPanel from "./QuestionPanel";
import ChatPanel from "./ChatPanel";
import StarCard from "./StarCard";
import type { Message, SessionConfig, StarDraft } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface TrainingSessionProps {
  config: SessionConfig;
  onRestart: () => void;
}

// ─── Raw shape the answer-reviewer lambda returns ─────────────────────────────
interface RawStarResponse {
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  // The lambda may return follow-up questions instead of a STAR object
  follow_up?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TrainingSession({
  config,
  onRestart,
}: TrainingSessionProps) {
  const navigate = useNavigate();
  const {
    questions,
    mode,
    jobDescription,
    targetRole,
    answeredIds,
    firstUnansweredIndex,
  } = config;

  // ── Per-question chat state ──────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(firstUnansweredIndex);
  const [completedIds, setCompletedIds] = useState<Set<string>>(answeredIds);

  // messages is a map from question id → Message[]
  // This preserves each question's conversation when the user navigates
  const [messageMap, setMessageMap] = useState<Record<string, Message[]>>(
    () => {
      const initial: Record<string, Message[]> = {};
      questions.forEach((q) => {
        initial[q.id] = [
          {
            id: uuidv4(),
            role: "ai",
            content: q.question,
            timestamp: new Date(),
          },
        ];
      });
      return initial;
    },
  );

  const [userInput, setUserInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [starDraft, setStarDraft] = useState<StarDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Derived
  const currentQuestion = questions[currentIndex];
  const messages = messageMap[currentQuestion?.id] ?? [];
  const isComplete = completedIds.size === questions.length;

  // ── Add a message to a specific question thread ──────────────────────────
  const appendMessage = useCallback(
    (questionId: string, msg: Omit<Message, "id" | "timestamp">) => {
      setMessageMap((prev) => ({
        ...prev,
        [questionId]: [
          ...(prev[questionId] ?? []),
          { ...msg, id: uuidv4(), timestamp: new Date() },
        ],
      }));
    },
    [],
  );

  // ── Send user answer to the answer-reviewer lambda ───────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isAnalyzing) return;

    const qId = currentQuestion.id;

    // Append the user's message immediately
    appendMessage(qId, { role: "user", content: trimmed });
    setUserInput("");
    setIsAnalyzing(true);
    setStarDraft(null);

    try {
      const user = await getCurrentUser();

      // Build the conversation history for context
      const history = (messageMap[qId] ?? []).map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

      const result = await apiFetch<RawStarResponse>("/review_answer", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.userId,
          question: currentQuestion.question,
          answer: trimmed,
          history,
          mode,
          ...(jobDescription && { job_description: jobDescription }),
        }),
      });

      // If the lambda returned a follow-up question, show it in the chat
      if (result.follow_up) {
        appendMessage(qId, { role: "ai", content: result.follow_up });
      } else if (result.situation && result.action && result.result) {
        // Full STAR/SAR response — show the draft card
        setStarDraft({
          situation: result.situation,
          task: result.task,
          action: result.action,
          result: result.result,
        });
        appendMessage(qId, {
          role: "ai",
          content:
            "I've structured your answer into a STAR card below. Review it, edit any field if needed, then confirm to save.",
        });
      } else {
        // Unexpected shape — treat as a plain text follow-up
        appendMessage(qId, {
          role: "ai",
          content:
            "Thanks for sharing that. Could you tell me more about the specific outcome or result?",
        });
      }
    } catch (err) {
      console.error("Answer review failed:", err);
      toast.error("Something went wrong. Please try again.");
      appendMessage(qId, {
        role: "ai",
        content:
          "Sorry, I had trouble processing that. Please try sending your answer again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    userInput,
    isAnalyzing,
    currentQuestion,
    messageMap,
    mode,
    jobDescription,
    appendMessage,
  ]);

  // ── Save confirmed STAR card to Supabase ─────────────────────────────────
  const handleConfirmStar = useCallback(
    async (edited: StarDraft) => {
      setIsSaving(true);
      try {
        const user = await getCurrentUser();

        const { error } = await supabase
          .from("interview_qa")
          .update({
            situation: edited.situation,
            task: edited.task ?? null,
            action: edited.action ?? null,
            result: edited.result ?? null,
            is_answered: true,
          })
          .eq("user_id", user.userId)
          .eq("id", currentQuestion.id);

        if (error) throw error;

        toast.success("STAR card saved to your training library.");
        setCompletedIds((prev) => new Set([...prev, currentQuestion.id]));
        setStarDraft(null);

        // Advance to next incomplete question
        const nextIndex = questions.findIndex(
          (q, i) =>
            i > currentIndex &&
            !completedIds.has(q.id) &&
            q.id !== currentQuestion.id,
        );
        if (nextIndex !== -1) {
          setCurrentIndex(nextIndex);
        }
      } catch (err) {
        console.error("Save failed:", err);
        toast.error("Could not save your STAR card. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [
      currentQuestion,
      currentIndex,
      mode,
      jobDescription,
      questions,
      completedIds,
    ],
  );

  // ── Reject draft — let user keep chatting ────────────────────────────────
  const handleRejectStar = useCallback(() => {
    setStarDraft(null);
    appendMessage(currentQuestion.id, {
      role: "ai",
      content:
        "No problem! Let's try again. Tell me more about what happened — focus on the specific actions you took and the outcome.",
    });
  }, [currentQuestion, appendMessage]);

  // ── Navigate between questions ────────────────────────────────────────────
  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
    setStarDraft(null);
    setUserInput("");
  };

  // ── Completion screen ─────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <PartyPopper className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2 max-w-md">
          <p className="text-2xl font-bold text-slate-800">
            Training session complete!
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You answered all {questions.length} questions and saved{" "}
            {completedIds.size} STAR cards to your training library. Your
            Virtual Me is now better at representing you.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Start another session
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={() => navigate("/app/agent")}
          >
            Back to Agent
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Main session layout ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* ── Page header ── */}
      <div className="px-6 py-3 border-b bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <BriefcaseBusiness className="w-4 h-4 text-blue-600" />
          <span
            className="text-muted-foreground cursor-pointer hover:underline"
            onClick={() => navigate("/app/agent")}
          >
            Agent
          </span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="font-medium text-slate-700">Training Studio</span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="text-slate-500 truncate max-w-48">{targetRole}</span>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              mode === "baseline"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-slate-100 text-slate-700"
            }
          >
            {mode === "baseline" ? (
              "Baseline"
            ) : (
              <>
                <Target className="w-3 h-3 mr-1 inline" />
                Job Prep
              </>
            )}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            className="text-muted-foreground hover:text-slate-700 gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </Button>
        </div>
      </div>

      {/* ── Three-column body ── */}
      <div className="flex flex-1 gap-4 p-4 min-h-0 bg-slate-50/30">
        {/* Left: question list */}
        <QuestionPanel
          questions={questions}
          currentIndex={currentIndex}
          completedIds={completedIds}
          onSelect={handleSelectQuestion}
        />

        {/* Center: chat */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <ChatPanel
            messages={messages}
            userInput={userInput}
            mode={mode}
            isAnalyzing={isAnalyzing}
            onInputChange={setUserInput}
            onSend={handleSend}
          />

          {/* STAR card — rendered below the chat when available */}
          {starDraft && (
            <StarCard
              draft={starDraft}
              isSaving={isSaving}
              onConfirm={handleConfirmStar}
              onReject={handleRejectStar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
