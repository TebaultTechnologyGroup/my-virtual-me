import { useNavigate } from "react-router-dom";
import { Bot, FileText, MicVocal, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Virtual Me Setup",
    description:
      "Configure your RAG instance. Upload your bio, links, and documents to train your AI twin.",
    icon: Bot,
    path: "/app/virtual-me",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Resume Builder",
    description:
      "Create or refine your resume. Use AI to tailor it to specific job descriptions.",
    icon: FileText,
    path: "/app/resume-builder",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Interview Prep",
    description:
      "Practice with your AI coach. Get real-time feedback on your answers and body language.",
    icon: MicVocal,
    path: "/app/interview-prep",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Virtual Me
        </h1>
        <p className="text-muted-foreground mt-2">
          Select a tool to accelerate your career growth.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="hover:shadow-md transition-all border-2 hover:border-primary/20"
          >
            <CardHeader>
              <div
                className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-between group"
                onClick={() => navigate(feature.path)}
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
