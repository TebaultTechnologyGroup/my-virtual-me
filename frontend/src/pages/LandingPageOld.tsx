import { Button } from "@/components/ui/button";
import { Sparkles, User, FileText, Search } from "lucide-react";

export default function LandingPageOld() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* NAV */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Virtual Me</h1>
          <nav className="flex items-center gap-6">Login</nav>
        </div>
      </header>

      {/* HERO */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Your AI‑Powered{" "}
              <span className="text-blue-600">Virtual Self</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Stand out to recruiters, prepare for interviews, and generate
              tailored resumes — all powered by your personal AI twin.
            </p>

            <div className="mt-8 flex gap-4">Create Your Virtual Me Login</div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="w-80 h-80 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
              <Sparkles className="w-16 h-16 text-blue-500" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center">What You Can Do</h3>

          <div className="mt-12 grid md:grid-cols-3 gap-10">
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
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold">Ready to stand out?</h3>
          <p className="mt-4 text-gray-600">
            Create your Virtual Me and start your job search with confidence.
          </p>

          <Button size="lg" className="mt-8">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Virtual Me. All rights reserved.
      </footer>
    </div>
  );
}

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
