import { useEffect, useRef } from "react";
import { Send, Sparkles, UserCheck, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Message, TrainingMode } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatPanelProps {
  messages: Message[];
  userInput: string;
  mode: TrainingMode;
  isAnalyzing: boolean; // true while the answer-reviewer lambda runs
  onInputChange: (value: string) => void;
  onSend: () => void;
}

// ─── Persona labels ───────────────────────────────────────────────────────────
const PERSONA: Record<TrainingMode, { name: string; role: string }> = {
  baseline: { name: "Recruiter", role: "Corporate Recruiter" },
  job_prep: { name: "Hiring Manager", role: "Hiring Manager" },
};

// ─── Individual message bubble ────────────────────────────────────────────────
function MessageBubble({
  message,
  mode,
}: {
  message: Message;
  mode: TrainingMode;
}) {
  const isAI = message.role === "ai";
  const persona = PERSONA[mode];

  return (
    <div className={cn("flex gap-3", isAI ? "flex-row" : "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isAI
            ? mode === "baseline"
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-white"
            : "bg-emerald-600 text-white",
        )}
      >
        {isAI ? (
          <Sparkles className="w-4 h-4" />
        ) : (
          <UserCheck className="w-4 h-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isAI ? "items-start" : "items-end",
        )}
      >
        <p className="text-xs font-semibold text-muted-foreground px-1">
          {isAI ? persona.role : "You"}
        </p>
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed",
            isAI
              ? "bg-muted/50 border rounded-2xl rounded-tl-none"
              : "bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-md",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatPanel({
  messages,
  userInput,
  mode,
  isAnalyzing,
  onInputChange,
  onSend,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  const canSend = userInput.trim().length > 0 && !isAnalyzing;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-2 border-slate-100 rounded-xl shadow-sm overflow-hidden">
      {/* Mode badge */}
      <div className="px-5 py-3 border-b bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Interview chat
        </p>
        <Badge
          variant="outline"
          className={cn(
            "text-xs border",
            mode === "baseline"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-slate-100 text-slate-700",
          )}
        >
          {PERSONA[mode].name} Persona Active
        </Badge>
      </div>

      {/* Message thread */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} mode={mode} />
          ))}

          {/* Analyzing indicator */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm italic py-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              Extracting STAR components…
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="p-4 border-t bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell your story naturally. Don't worry about structure — I'll organise it for you."
            className="min-h-20 pr-14 py-3 rounded-xl border-2 focus-visible:ring-blue-200 resize-none text-sm leading-relaxed"
            disabled={isAnalyzing}
          />
          <Button
            size="icon"
            onClick={onSend}
            disabled={!canSend}
            className="absolute right-3 bottom-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="max-w-3xl mx-auto mt-2 text-[10px] text-muted-foreground text-center">
          TIP: Include specific metrics (percentages, timelines, dollar amounts)
          to improve your Virtual Me accuracy. Press{" "}
          <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] border">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] border">
            Shift+Enter
          </kbd>{" "}
          for a new line.
        </p>
      </div>
    </div>
  );
}
