import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  UserCheck,
  Send,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";

// Types for our "Extract & Confirm" workflow
interface StarDraft {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface InterviewQuestion {
  id: string;
  question: string;
  intent?: string;
  context_tag: string;
}

export default function TrainingStudio() {
  const [mode, setMode] = useState<"baseline" | "job_prep">("baseline");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draft, setDraft] = useState<StarDraft | null>(null);
  const [userInput, setUserInput] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const startTraining = async () => {
    setIsGenerating(true);
    try {
      // 1. Fetch "Super JSON" from your existing profile/job tables
      // 2. Call your AWS Lambda via an Edge Function or API Gateway
      // 3. Questions are saved to interview_qa via the Lambda

      // 4. Fetch the newly created questions
      const { data, error } = await supabase
        .from("interview_qa")
        .select("id, question, context_tag")
        .is("situation", null) // Only fetch unanswered ones
        .order("created_at", { ascending: true });

      if (data) setQuestions(data);
    } catch (err) {
      toast.error("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulated logic for the "Extract" phase
  const handleSend = () => {
    if (!userInput.trim()) return;
    setIsAnalyzing(true);

    // In production, this would call your Edge Function to parse the STAR
    setTimeout(() => {
      setDraft({
        situation:
          "At Georgia Tech, the legacy power systems were failing during peak load.",
        task: "I needed to architect a rerouting logic to prevent campus-wide blackouts.",
        action:
          "I implemented a load-balancing algorithm using real-time sensor data.",
        result:
          "Reduced failure rate by 40% and stabilized the grid for the final semester.",
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSaveToDB = () => {
    // Logic to upsert to interview_qa with context_tag
    console.log("Saving to Supabase...", { ...draft, mode });
    setDraft(null);
    setUserInput("");
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 p-6 bg-background animate-in fade-in duration-500">
      {/* LEFT: System Map (The 'Architect' View) */}
      <div className="w-80 flex flex-col gap-4">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Training Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Baseline Persona</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[85%] transition-all" />
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Top Skills to Train
              </p>
              {["System Architecture", "SaaS Strategy", "AI RAG"].map(
                (skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {skill}
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Interaction Lab */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as any)}
            className="w-100"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="baseline" className="gap-2">
                <UserCheck className="w-4 h-4" /> Baseline
              </TabsTrigger>
              <TabsTrigger value="job_prep" className="gap-2">
                <Target className="w-4 h-4" /> Job Prep
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Badge
            variant="outline"
            className="px-3 py-1 border-primary/20 bg-primary/5 text-primary animate-pulse"
          >
            {mode === "baseline"
              ? "Recruiter Persona Active"
              : "Hiring Manager Persona Active"}
          </Badge>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-card border rounded-2xl shadow-sm overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* AI Question */}
              <div className="flex gap-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    mode === "baseline"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-white",
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">
                    {mode === "baseline"
                      ? "Corporate Recruiter"
                      : "VP of Engineering"}
                  </p>
                  <div className="p-4 bg-muted/50 rounded-2xl rounded-tl-none text-sm leading-relaxed border">
                    "Tell me about a time you had to pivot a technical strategy
                    mid-stream. What was the trigger, and how did you handle the
                    stakeholders?"
                  </div>
                </div>
              </div>

              {/* User Answer (Temporary) */}
              {userInput && !draft && (
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 text-white">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="p-4 bg-primary text-primary-foreground rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-md">
                    {userInput}
                  </div>
                </div>
              )}

              {/* STAR Extraction Card */}
              {isAnalyzing && (
                <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground italic text-sm">
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Architecting STAR components...
                </div>
              )}

              {draft && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <Card className="border-primary/30 bg-primary/2 shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b py-3 px-4 flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        Proposed STAR Entry
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDraft(null)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Redo
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-2 divide-x divide-y border-b">
                        <div className="p-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Situation
                          </label>
                          <p className="text-sm">{draft.situation}</p>
                        </div>
                        <div className="p-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Task
                          </label>
                          <p className="text-sm">{draft.task}</p>
                        </div>
                        <div className="p-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Action
                          </label>
                          <p className="text-sm">{draft.action}</p>
                        </div>
                        <div className="p-4 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Result
                          </label>
                          <p className="text-sm font-medium text-green-600">
                            {draft.result}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-white p-3 flex justify-end">
                      <Button onClick={handleSaveToDB} className="gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Confirm & Save to
                        Persona
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Persistent Input Bar */}
          <div className="p-6 bg-card border-t shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="max-w-3xl mx-auto relative group">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your story naturally. Don't worry about the structure; I'll organize it for you."
                className="min-h-20 pr-20 py-4 rounded-xl border-2 focus-visible:ring-primary/20 resize-none transition-all shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!userInput.trim() || isAnalyzing}
                  onClick={handleSend}
                  className="rounded-lg shadow-md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="max-w-3xl mx-auto mt-2 text-[10px] text-muted-foreground text-center">
              TIP: Mention specific metrics (percentages, dollars, dates) to
              increase your "Digital Me" accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
