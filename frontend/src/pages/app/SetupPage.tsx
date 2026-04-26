import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "./../../lib/supabase-client";
import { setupSchema, type SetupFormValues } from "@/lib/validations/setup";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

// Import your Step Components
import ProfileStep from "./components/ProfileStep";
import PillarStep from "./components/PillarStep";
import JobHistoryStep from "./components/JobHistoryStep";
import { SkillsStep } from "./components/SkillsStep";
import { CredentialsStep } from "./components/CredentialsStep";
import InterviewQAStep from "./components/InterviewQAStep"; // Added based on earlier reqs

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      linkedin: "",
      pillars: [
        {
          title: "",
          content: "",
        },
      ],
      jobs: [
        {
          company: "",
          location: "",
          title: "",
          description: "",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          isCurrent: false,
          accomplishments: [""],
          awards: [""],
        },
      ],
      skills: [""],
      education: [
        {
          school: "",
          degree: "",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          isCurrent: false,
          gpa: "",
          clubs: "",
        },
      ],
      certifications: [
        {
          name: "",
          issuer: "",
          issueDate: "",
          url: "",
        },
      ],
      interviewQA: [
        {
          question: "",
          situation: "",
          task: "",
          action: "",
          result: "",
        },
      ],
      hobbies: "",
    },
  });

  const nextStep = async () => {
    // Optional: Validate only the fields in the current step before proceeding
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (values: SetupFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Get current user session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 2. Update Profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        postal_code: values.postalCode,
        linkedin_url: values.linkedin,
        hobbies: values.hobbies,
      });
      if (profileError) throw profileError;

      // 3. Sync Narrative Pillars (Delete/Insert pattern)
      await supabase.from("narrative_pillars").delete().eq("user_id", user.id);
      const { error: pillarError } = await supabase
        .from("narrative_pillars")
        .insert(values.pillars.map((p) => ({ ...p, user_id: user.id })));
      if (pillarError) throw pillarError;

      // 4. Sync Job History & Nested Details
      // We do this by mapping each job to a request
      for (const job of values.jobs) {
        const { data: insertedJob, error: jobErr } = await supabase
          .from("job_history")
          .insert({
            user_id: user.id,
            company: job.company,
            location: job.location,
            title: job.title,
            description: job.description,
            start_month: job.startMonth,
            start_year: job.startYear,
            end_month: job.endMonth,
            end_year: job.endYear,
            is_current: job.isCurrent,
          })
          .select()
          .single();

        if (jobErr) throw jobErr;

        // Insert Accomplishments
        const accs = job.accomplishments.map((content) => ({
          job_id: insertedJob.id,
          user_id: user.id,
          content,
          type: "accomplishment",
        }));

        // Insert Awards
        const awards = job.awards.map((content) => ({
          job_id: insertedJob.id,
          user_id: user.id,
          content,
          type: "award",
        }));

        const { error: detailErr } = await supabase
          .from("job_details")
          .insert([...accs, ...awards]);
        if (detailErr) throw detailErr;
      }

      // 5. Sync Skills
      await supabase.from("user_skills").delete().eq("user_id", user.id);
      const { error: skillErr } = await supabase.from("user_skills").insert(
        values.skills.map((s) => ({
          user_id: user.id,
          skill_value: s,
          skill_label: s,
        })),
      );
      if (skillErr) throw skillErr;

      toast.success("Virtual Me setup complete!");
      // Navigate to dashboard or next tool
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Stepper UI */}
      <div className="mb-12 flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step >= i
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            {step > i ? <CheckCircle className="w-6 h-6" /> : i}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && <ProfileStep form={form} />}
        {step === 2 && <PillarStep form={form} />}
        {step === 3 && <JobHistoryStep form={form} />}
        {step === 4 && <SkillsStep form={form} />}
        {step === 5 && <CredentialsStep form={form} />}
        {step === 6 && <InterviewQAStep form={form} />}

        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {step < 6 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Finalize Virtual Me"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
