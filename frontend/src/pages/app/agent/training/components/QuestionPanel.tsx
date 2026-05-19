import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Question, ContextTag } from "../types";

// ─── Tag pill colours ─────────────────────────────────────────────────────────
const TAG_STYLES: Record<ContextTag, string> = {
  universal: "bg-slate-100 text-slate-600 border-slate-200",
  technical: "bg-blue-50 text-blue-700 border-blue-200",
  leadership: "bg-violet-50 text-violet-700 border-violet-200",
};

const TAG_LABELS: Record<ContextTag, string> = {
  universal: "Universal",
  technical: "Technical",
  leadership: "Leadership",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface QuestionPanelProps {
  questions: Question[];
  currentIndex: number;
  completedIds: Set<string>;
  onSelect: (index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuestionPanel({
  questions,
  currentIndex,
  completedIds,
  onSelect,
}: QuestionPanelProps) {
  const completedCount = completedIds.size;
  const totalCount = questions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-72 shrink-0 flex flex-col gap-4">
      {/* ── Progress card ── */}
      <div className="rounded-xl border-2 border-slate-100 bg-white p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Progress
          </p>
          <span className="text-xs font-semibold text-blue-600">
            {completedCount} / {totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Tag distribution */}
        <div className="flex gap-1.5 flex-wrap pt-1">
          {(Object.keys(TAG_LABELS) as ContextTag[]).map((tag) => {
            const count = questions.filter((q) => q.context_tag === tag).length;
            if (count === 0) return null;
            return (
              <span
                key={tag}
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                  TAG_STYLES[tag],
                )}
              >
                {TAG_LABELS[tag]} &times; {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Question list ── */}
      <div className="rounded-xl border-2 border-slate-100 bg-white shadow-sm overflow-hidden flex-1 min-h-0">
        <div className="px-4 py-3 border-b bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Questions
          </p>
        </div>
        <ScrollArea className="h-full max-h-[calc(100vh-340px)]">
          <div className="p-2 space-y-1">
            {questions.map((q, idx) => {
              const isCompleted = completedIds.has(q.id);
              const isActive = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg transition-all group",
                    isActive
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-slate-50 border border-transparent",
                  )}
                >
                  {/* Status icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-blue-500" : "text-slate-300",
                        )}
                      />
                    )}
                  </div>

                  {/* Question text + tag */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        isActive
                          ? "text-blue-700 font-medium"
                          : isCompleted
                            ? "text-slate-400"
                            : "text-slate-600",
                      )}
                    >
                      {q.question}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border inline-block",
                        TAG_STYLES[q.context_tag],
                      )}
                    >
                      {TAG_LABELS[q.context_tag]}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
