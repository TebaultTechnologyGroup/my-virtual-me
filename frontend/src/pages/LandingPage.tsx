"use client";

import React, { useState } from "react";
import { ArrowRight, Play, Check, Star, Menu, X } from "lucide-react";

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow">
              VM
            </div>
            <span className="text-2xl font-semibold tracking-tight text-slate-900">
              Virtual Me
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="hover:text-slate-900 transition-colors"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection("stories")}
              className="hover:text-slate-900 transition-colors"
            >
              Stories
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="hover:text-slate-900 transition-colors"
            >
              Pricing
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
            >
              Log in
            </a>
            <a
              href="/onboarding"
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-2xl transition flex items-center gap-2"
            >
              Get Started Free
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-6 py-6 flex flex-col gap-5 text-base">
            <button
              onClick={() => scrollToSection("features")}
              className="text-left py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="text-left py-2"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection("stories")}
              className="text-left py-2"
            >
              Stories
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-left py-2"
            >
              Pricing
            </button>
            <div className="pt-4 border-t flex flex-col gap-3">
              <a href="/login" className="py-3 text-center text-slate-700">
                Log in
              </a>
              <a
                href="/onboarding"
                className="py-3 text-center bg-slate-900 text-white font-semibold rounded-2xl"
              >
                Get Started Free
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 bg-linear-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm text-sm">
              <span className="text-emerald-600">✦</span>
              Born from Virtual-Mark — loved by recruiters and candidates
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-slate-900">
              Your AI twin.
              <br />
              Interviewed anytime.
            </h1>

            <p className="text-2xl text-slate-600 max-w-lg">
              Create a virtual version of yourself that recruiters can screen
              24/7. Build perfect resumes, practice interviews, and land your
              next role faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/onboarding"
                className="group flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white font-semibold text-lg px-10 py-4 rounded-3xl transition-all active:scale-[0.985]"
              >
                Create Your Virtual Me — Free
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </a>

              <button
                onClick={() => scrollToSection("demo")}
                className="flex items-center justify-center gap-3 border border-slate-300 hover:border-slate-400 font-medium text-lg px-8 py-4 rounded-3xl transition"
              >
                <Play className="fill-current" size={22} /> Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="text-emerald-500" /> No credit card needed
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-500" /> Setup in under 10 minutes
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex justify-center">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 w-full max-w-md lg:max-w-lg">
              {/* Avatar / Video preview area */}
              <div className="aspect-video bg-linear-to-br from-slate-900 to-indigo-950 relative flex items-center justify-center">
                <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-8xl">👤</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 bg-black/70 text-white text-xs px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span>Always online • Ready for interviews</span>
                </div>
              </div>

              {/* Chat simulation */}
              <div className="p-6 space-y-6">
                <div className="bg-slate-100 rounded-2xl p-5 text-sm">
                  <div className="font-medium text-slate-500 mb-1">
                    Recruiter via Virtual Me
                  </div>
                  <div className="text-slate-800">
                    "Tell me about a challenging project you led and how you
                    overcame obstacles."
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-5 text-sm ml-8">
                  <div className="font-medium text-blue-700 mb-1">
                    Your Virtual Me
                  </div>
                  <div className="text-slate-700">
                    "In my role at Acme Corp, I led a cross-functional team to
                    migrate our legacy system..."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-b py-6 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-75">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            POWERED BY
          </div>
          <div className="text-2xl font-light tracking-widest text-slate-400">
            CLAUDE
          </div>
          <div className="text-2xl font-light tracking-widest text-slate-400">
            BEDROCK
          </div>
          <div className="text-2xl font-light tracking-widest text-slate-400">
            AWS
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-blue-600 font-semibold tracking-widest text-sm mb-3">
              EVERYTHING YOU NEED
            </div>
            <h2 className="text-5xl font-bold tracking-tight">
              One platform.
              <br />
              Four powerful AI tools.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Virtual Me",
                desc: "Recruiters screen your AI twin via shareable link. Text-based now — talking avatar in Paid Tier 1.",
                icon: "👤",
              },
              {
                title: "Resume Builder",
                desc: "Upload a job description and get a tailored resume. Fine-tune with AI and export to PDF.",
                icon: "📄",
              },
              {
                title: "Interview Coach",
                desc: "Practice common questions. Get instant feedback and improve your answers.",
                icon: "🎤",
              },
              {
                title: "Recruiter Discovery",
                desc: "Opt-in to let recruiters find you based on job descriptions (Paid Tier 1).",
                icon: "🔍",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-3xl p-8 hover:border-slate-200 transition group"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600 transition">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight">
              How Virtual Me Works
            </h2>
            <p className="mt-4 text-xl text-slate-600">
              From onboarding to landing interviews in minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-16">
            {[
              {
                step: "01",
                title: "Onboard & Build Your Profile",
                desc: "Tell us about your experience, achievements, interests, and answer common interview questions. Upload your photo.",
              },
              {
                step: "02",
                title: "Meet Your Virtual Me",
                desc: "Test your AI twin in the dashboard. Correct any answers to continuously improve accuracy via RAG.",
              },
              {
                step: "03",
                title: "Share or Get Discovered",
                desc: "Generate shareable links for recruiters or opt-in to recruiter search.",
              },
              {
                step: "04",
                title: "Build Resumes & Prepare",
                desc: "Create tailored resumes and practice interviews with AI feedback.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-10 items-start">
                <div className="w-14 h-14 shrink-0 bg-blue-100 text-blue-700 font-mono font-bold text-2xl rounded-2xl flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-lg text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories / Testimonials */}
      <section id="stories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight">
              Real feedback from Virtual-Mark users
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "This is genius. I interviewed Mark at 11pm on a Sunday and got thoughtful answers instantly.",
                name: "Sarah Chen",
                role: "Tech Recruiter",
              },
              {
                quote:
                  "I finally have a way to practice interviews without bothering my friends. The feedback is spot-on.",
                name: "Alex Rivera",
                role: "Software Engineer",
              },
              {
                quote:
                  "The concept is so powerful. I want this for myself and every candidate I work with.",
                name: "Michael Torres",
                role: "Hiring Manager",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-100 rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-amber-400 fill-current"
                      size={20}
                    />
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-slate-700 mb-8">
                  “{testimonial.quote}”
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-blue-400 text-sm font-semibold tracking-widest">
              START FREE • SCALE AS YOU GROW
            </div>
            <h2 className="text-5xl font-bold tracking-tight mt-4">
              Simple pricing that grows with you
            </h2>
          </div>

          <div className="grid md:grid-cols-2 max-w-3xl mx-auto gap-8">
            {/* Free Tier */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-10">
              <div className="uppercase text-xs tracking-widest mb-2 text-blue-300">
                Starter
              </div>
              <div className="text-5xl font-semibold mb-1">$0</div>
              <div className="text-slate-400 mb-8">forever</div>

              <ul className="space-y-4 mb-10">
                <li className="flex gap-3">
                  <Check className="text-emerald-400 mt-1" /> Static profile
                  picture
                </li>
                <li className="flex gap-3">
                  <Check className="text-emerald-400 mt-1" /> Text-based Virtual
                  Me
                </li>
                <li className="flex gap-3">
                  <Check className="text-emerald-400 mt-1" /> Limited resume
                  generations
                </li>
                <li className="flex gap-3">
                  <Check className="text-emerald-400 mt-1" /> Basic interview
                  practice
                </li>
                <li className="flex gap-3">
                  <Check className="text-emerald-400 mt-1" /> Basic analytics
                </li>
              </ul>

              <a
                href="/onboarding"
                className="block text-center py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-100 transition"
              >
                Start Free
              </a>
            </div>

            {/* Paid Tier 1 Teaser */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-white/20 text-white text-xs px-4 py-1 rounded-full">
                Recommended
              </div>

              <div className="uppercase text-xs tracking-widest mb-2 text-blue-200">
                Tier 1
              </div>
              <div className="text-5xl font-semibold mb-1">Coming soon</div>
              <div className="text-blue-100 mb-8">
                Affordable monthly/annual plans
              </div>

              <ul className="space-y-4 mb-10 text-blue-50">
                <li className="flex gap-3">
                  <Check className="mt-1" /> Talking avatar (HeyGen / D-ID)
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1" /> Voice interviews
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1" /> Unlimited resumes
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1" /> Detailed analytics + logs
                </li>
                <li className="flex gap-3">
                  <Check className="mt-1" /> Discoverable to recruiters
                </li>
              </ul>

              <div className="text-center py-4 border border-white/30 text-white font-semibold rounded-2xl">
                Join waitlist for early access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white border-t">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Ready to stand out in a crowded job market?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Join the growing community using AI to work smarter — not harder —
            on their job search.
          </p>

          <a
            href="/onboarding"
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white text-xl font-semibold px-12 py-6 rounded-3xl transition"
          >
            Create Your Virtual Me Now
            <ArrowRight size={28} />
          </a>

          <p className="mt-8 text-sm text-slate-500">
            Takes less than 10 minutes • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center font-bold">
                VM
              </div>
              <span className="font-semibold text-lg">Virtual Me</span>
            </div>
            <p className="text-sm">
              AI-powered career tools that help you get hired faster.
            </p>
          </div>

          <div>
            <div className="font-medium text-white mb-4">Product</div>
            <div className="space-y-2 text-sm">
              <div>Virtual Me</div>
              <div>Resume Builder</div>
              <div>Interview Coach</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-white mb-4">Company</div>
            <div className="space-y-2 text-sm">
              <div>About</div>
              <div>Blog</div>
              <div>Contact</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-white mb-4">Legal</div>
            <div className="space-y-2 text-sm">
              <div>Privacy Policy</div>
              <div>Terms of Service</div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs mt-16 text-slate-500">
          © {new Date().getFullYear()} Virtual Me. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
