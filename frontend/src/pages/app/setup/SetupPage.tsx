import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  SquareStack,
  FileStack,
  ArrowRight,
  FolderPen,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const setupOptions = [
  {
    title: "General Information",
    description:
      "Manage your general information, contact details, and location for your resume header.",
    icon: FolderPen,
    path: "/app/setup/personal",
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
  {
    title: "Professional Summary",
    description:
      "Manage your professional summary for one or more target job types. This will be used to create your signature professional stories and tailor your resume and interview prep.",
    icon: BriefcaseBusiness,
    path: "/app/setup/summary",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Job History",
    description:
      "Manage your job history, including roles, companies, dates, and descriptions. This will be used to create your signature professional stories and tailor your resume and interview prep.",
    icon: SquareStack,
    path: "/app/setup/job-history",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Credentials",
    description:
      "Manage your educational background, certifications, and licenses.",
    icon: FileStack,
    path: "/app/setup/credentials",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Skills",
    description: "Manage your skills and expertise across different domains.",
    icon: FileStack,
    path: "/app/setup/skills",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function SetupPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Complete each of the sections below to configure your Virtual Me
            agent. The more accurate you are, the better the results.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setupOptions.map((option) => (
          <Card
            key={option.title}
            className="hover:shadow-lg transition-all border-2 hover:border-blue-200 group"
          >
            <CardHeader>
              <div
                className={`w-12 h-12 rounded-xl ${option.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <option.icon className={`w-6 h-6 ${option.color}`} />
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-between group/btn"
                onClick={() => navigate(option.path)}
              >
                Open {option.title}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
