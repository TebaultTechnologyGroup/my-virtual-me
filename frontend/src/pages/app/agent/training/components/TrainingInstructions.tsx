import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  PlayCircle,
  Loader2,
  Upload,
  FileCheck2,
  X,
  Info,
} from "lucide-react";
import { getCurrentUser } from "@aws-amplify/auth";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase-client";
import HowItWorks from "./HowItWorks";
import type { StartTrainingParams, TargetRole } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface TrainingInstructionsProps {
  onStartTraining: (params: StartTrainingParams) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TrainingInstructions({
  onStartTraining,
}: TrainingInstructionsProps) {
  const navigate = useNavigate();

  // ── Role data ──────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<TargetRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // ── Job description ────────────────────────────────────────────────────
  const [jobDescription, setJobDescription] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Submission ─────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canStart = selectedRoleId !== "" && !isSubmitting && !rolesLoading;
  const hasJobDescription = jobDescription.trim().length > 0 || !!fileName;
  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  // ── Fetch the user's target roles from Supabase ────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchRoles = async () => {
      try {
        const user = await getCurrentUser();
        const { data, error } = await supabase
          .from("target_roles")
          .select("id, role_title, prof_summary")
          .eq("user_id", user.userId)
          .order("role_title");

        if (error) throw error;
        if (!cancelled && data) {
          setRoles(data);
          // Pre-select the first role if only one exists
          if (data.length === 1) setSelectedRoleId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load target roles:", err);
        toast.error("Could not load your target roles. Please try again.");
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };
    fetchRoles();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── File handling ──────────────────────────────────────────────────────
  const readFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) =>
      setJobDescription((e.target?.result as string) ?? "");
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const clearFile = () => {
    setFileName(null);
    setJobDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (!canStart || !selectedRole) return;
    setIsSubmitting(true);
    onStartTraining({
      roleId: selectedRoleId,
      roleTitle: selectedRole.role_title,
      jobDescription: jobDescription.trim() || null,
    });
    // Note: setIsSubmitting(false) is not called here because TrainingStudio
    // will unmount this component and render GeneratingQuestions instead.
    // If the lambda call fails, TrainingStudio re-renders this component
    // which resets all state naturally.
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <Card className="border-2 border-slate-100 shadow-sm">
        {/* Header */}
        <CardHeader className="bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
              <span
                className="text-muted-foreground font-normal cursor-pointer hover:underline"
                onClick={() => navigate("/app/agent")}
              >
                Agent
              </span>
              <span className="text-muted-foreground font-normal">&rarr;</span>
              Training Studio
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your virtual me learns from your real experiences. Each session
            generates recruiter-style questions and builds your STAR card
            library.
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* How it works */}
          <HowItWorks />

          {/* Configuration panel */}
          <div className="rounded-xl border-2 border-slate-100 bg-slate-50/30 p-6 space-y-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Training configuration
            </p>

            {/* ── Target role ── */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-600">
                Target Role <span className="text-destructive ml-0.5">*</span>
              </label>
              <p className="text-sm text-muted-foreground">
                Select the role you want to train for. Questions will be
                tailored to match what a recruiter would ask for this type of
                position.
              </p>
              {rolesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading your target roles…
                </div>
              ) : roles.length === 0 ? (
                <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    No target roles found.{" "}
                    <span
                      className="underline cursor-pointer font-medium"
                      onClick={() => navigate("/app/setup/target-roles")}
                    >
                      Add target roles in Setup
                    </span>{" "}
                    before starting a training session.
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="Select a target role…" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <span className="font-medium">{role.role_title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* ── Job description ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-blue-600">
                  Job Description
                </label>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider border border-slate-200 rounded px-1.5 py-0.5 bg-white">
                  Optional — Job Prep Mode
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste or upload a job description to have the AI act as a hiring
                manager asking role-specific questions. Responses will be tagged
                to this specific job.
              </p>

              {/* Drop zone / file success */}
              {!fileName ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                    dragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
                >
                  <Upload
                    className={`w-4 h-4 shrink-0 ${
                      dragOver ? "text-blue-500" : "text-slate-400"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    Drop a{" "}
                    <span className="font-medium text-slate-700">
                      .txt or .pdf
                    </span>{" "}
                    file here, or{" "}
                    <span className="text-blue-600 font-medium">browse</span>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload job description file"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="flex-1 text-sm font-medium text-emerald-700 truncate">
                    {fileName}
                  </span>
                  <button
                    onClick={clearFile}
                    aria-label="Remove file"
                    className="text-emerald-500 hover:text-emerald-700 transition-colors p-0.5 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Textarea
                placeholder="…or paste the job description here"
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (fileName) setFileName(null);
                }}
                rows={6}
                className="bg-white resize-y leading-relaxed text-sm"
                aria-label="Paste job description"
              />
            </div>

            {/* Job prep mode notice */}
            {hasJobDescription && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 leading-relaxed">
                  <span className="font-semibold">Job prep mode active.</span>{" "}
                  Questions and STAR cards from this session will be tagged to
                  this specific job description.
                </p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="bg-slate-50/50 flex items-center justify-between">
          <Button
            variant="ghost"
            className="w-32"
            onClick={() => navigate("/app/agent")}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {!selectedRoleId && !rolesLoading && roles.length > 0 && (
              <p className="text-xs text-muted-foreground italic">
                Select a target role to continue.
              </p>
            )}
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="bg-blue-600 hover:bg-blue-700 min-w-44 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
