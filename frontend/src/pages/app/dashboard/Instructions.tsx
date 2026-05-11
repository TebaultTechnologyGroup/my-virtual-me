import { Button } from "@/components/ui/button";
import { FileText, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Instructions() {
  const navigate = useNavigate();
  return (
    <div className="mt-6 max-w-7xl mx-auto flex flex-col">
      <div className="flex flex-col justify-center">
        <h2 className="text-5xl font-bold leading-tight">
          Welcome to Virtual Me!
        </h2>
        <p className="mt-4 mb-4 text-lg text-gray-600">
          Setup and train your AI twin and take advantage of:
        </p>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <div className="mt-1 grid md:grid-cols-3 gap-10">
            <Feature
              icon={<User className="w-8 h-8 text-blue-600" />}
              title="Virtual Interviews"
              desc="Let recruiters screen your AI twin — anytime, anywhere."
            />
            <Feature
              icon={<FileText className="w-8 h-8 text-blue-600" />}
              title="Resume Assistant"
              desc="Upload a job description and generate tailored resumes instantly."
            />
            <Feature
              icon={<Search className="w-8 h-8 text-blue-600" />}
              title="Interview Prep"
              desc="Practice common questions and get AI‑powered feedback."
            />
          </div>
        </div>
      </div>
      <h3 className="text-3xl pt-6 font-bold leading-tight">
        Ready to stand out?
      </h3>
      <p className="mt-4 text-gray-600">
        Complete the Setup and train your agent to get started!
      </p>
      <div className="mt-1 grid md:grid-cols-3 gap-10">
        <Button
          size="lg"
          className="mt-8"
          onClick={() => navigate("/app/setup")}
        >
          Step 1 - Complete Setup
        </Button>{" "}
        <Button
          size="lg"
          className="mt-8"
          onClick={() => navigate("/app/agent/train")}
        >
          Step 2 - Train your agent
        </Button>
      </div>
    </div>
  );
}

//<Button
//                 variant="ghost"
//                 className="w-full justify-between group/btn"
//                 onClick={() => navigate(option.path)}
//               >
//                 Open {option.title}
//                 <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
//               </Button>

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div>{icon}</div>
      <h4 className="mt-4 text-xl font-semibold">{title}</h4>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  );
}
