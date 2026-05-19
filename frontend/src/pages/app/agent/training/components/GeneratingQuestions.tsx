import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Cycles through messages so the user knows something is happening
// during the ~5-10 second Bedrock call.
const MESSAGES = [
  "Reviewing your job history…",
  "Identifying key competencies…",
  "Building your question set…",
  "Calibrating question difficulty…",
  "Almost ready…",
];

const INTERVAL_MS = 2800;

export default function GeneratingQuestions() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6 text-center px-8">
      {/* Spinner ring */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <p className="text-lg font-semibold text-slate-800">
          Generating your questions
        </p>
        {/* Animated status message */}
        <p
          key={msgIndex}
          className="text-sm text-muted-foreground animate-in fade-in duration-500"
        >
          {MESSAGES[msgIndex]}
        </p>
      </div>

      <p className="text-xs text-muted-foreground max-w-xs">
        This usually takes 10–20 seconds. We're tailoring your questions based
        on your job history and target role.
      </p>
    </div>
  );
}
