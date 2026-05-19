import { Brain, MessageSquareText, Star } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="rounded-xl border-2 border-slate-100 bg-slate-50/30 p-6 space-y-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        How it works
      </p>
      <HowItWorksStep
        n={1}
        icon={<Brain className="w-4 h-4" />}
        title="Questions are generated"
        description="The AI reviews your job history and builds a targeted set of recruiter-style questions for your chosen role."
      />
      <HowItWorksStep
        n={2}
        icon={<MessageSquareText className="w-4 h-4" />}
        title="You answer in your own words"
        description="Speak naturally in the chat. The AI will ask follow-up questions to draw out the full story behind each experience."
      />
      <HowItWorksStep
        n={3}
        icon={<Star className="w-4 h-4" />}
        title="STAR cards are confirmed and saved"
        description="Each answer is structured into a Situation, Task, Action, Result card. Review the AI's breakdown and confirm it to save to your training library."
      />
    </div>
  );
}

function HowItWorksStep({
  n,
  icon,
  title,
  description,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
        {n}
      </div>
      <div className="flex gap-3 items-start pt-1">
        <div className="text-blue-600 shrink-0">{icon}</div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
