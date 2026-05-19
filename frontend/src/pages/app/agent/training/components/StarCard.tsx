import { useState } from "react";
import {
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { StarDraft } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface StarCardProps {
  draft: StarDraft;
  isSaving: boolean;
  onConfirm: (edited: StarDraft) => void;
  onReject: () => void;
}

// ─── Field config ─────────────────────────────────────────────────────────────
type StarField = keyof StarDraft;

interface FieldMeta {
  key: StarField;
  label: string;
  color: string; // Tailwind text color class
  border: string; // Tailwind border color class
  bg: string; // Tailwind bg color class
}

const FIELDS: FieldMeta[] = [
  {
    key: "situation",
    label: "Situation",
    color: "text-blue-700",
    border: "border-blue-200",
    bg: "bg-blue-50/60",
  },
  {
    key: "task",
    label: "Task",
    color: "text-violet-700",
    border: "border-violet-200",
    bg: "bg-violet-50/60",
  },
  {
    key: "action",
    label: "Action",
    color: "text-amber-700",
    border: "border-amber-200",
    bg: "bg-amber-50/60",
  },
  {
    key: "result",
    label: "Result",
    color: "text-emerald-700",
    border: "border-emerald-200",
    bg: "bg-emerald-50/60",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function StarCard({
  draft,
  isSaving,
  onConfirm,
  onReject,
}: StarCardProps) {
  // Allow the user to edit each field before saving
  const [edited, setEdited] = useState<StarDraft>({ ...draft });
  const [expandedField, setExpandedField] = useState<StarField | null>(null);

  const updateField = (key: StarField, value: string) => {
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    onConfirm(edited);
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-400 rounded-xl border-2 border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Proposed STAR Entry
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReject}
          className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
          disabled={isSaving}
        >
          <RotateCcw className="w-3 h-3" />
          Redo
        </Button>
      </div>

      {/* STAR fields */}
      <div className="divide-y">
        {FIELDS.map(({ key, label, color, border, bg }) => {
          // Skip task if not present (SAR pattern)
          if (key === "task" && !edited.task && !draft.task) return null;

          const isExpanded = expandedField === key;
          const value = edited[key] ?? "";

          return (
            <div key={key} className={cn("transition-all", bg)}>
              {/* Field header — click to toggle edit */}
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                onClick={() => setExpandedField(isExpanded ? null : key)}
              >
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    color,
                  )}
                >
                  {label}
                </span>
                {isExpanded ? (
                  <ChevronUp className={cn("w-3.5 h-3.5", color)} />
                ) : (
                  <ChevronDown className={cn("w-3.5 h-3.5", color)} />
                )}
              </button>

              <div className="px-4 pb-3 space-y-1.5">
                {isExpanded ? (
                  /* Editable textarea */
                  <Textarea
                    value={value}
                    onChange={(e) => updateField(key, e.target.value)}
                    rows={3}
                    className={cn(
                      "text-sm resize-none bg-white border focus-visible:ring-1",
                      border,
                    )}
                    autoFocus
                  />
                ) : (
                  /* Read-only display */
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {value || (
                      <span className="italic text-muted-foreground">
                        Not provided
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t gap-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Click any field to edit before saving.
        </p>
        <Button
          onClick={handleConfirm}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 shrink-0 gap-2"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm & Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
