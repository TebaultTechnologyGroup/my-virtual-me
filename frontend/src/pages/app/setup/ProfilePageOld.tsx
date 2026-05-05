// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { supabase } from "../../../lib/supabase-client";
// import { setupSchema, type SetupFormValues } from "@/lib/validations/setup";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

// // Import your Step Components
// import ProfileStep from "./steps/PersonalPage";
// import PillarStep from "./steps/SummaryPage";
// import JobHistoryStep from "./steps/JobHistoryPage";
// import { SkillsPage } from "./steps/SkillsPage";
// import { CredentialsPage } from "./steps/CredentialsPage";
// import { getCurrentUser } from "@aws-amplify/auth";

// export default function ProfilePageOld() {
//   const [step, setStep] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const form = useForm<SetupFormValues>({
//     resolver: zodResolver(setupSchema),
//     defaultValues: {
//       fullName: "",
//       email: "",
//       phone: "",
//       address: "",
//       city: "",
//       state: "",
//       postalCode: "",
//       linkedin: "",
//       pillars: [
//         {
//           title: "",
//           content: "",
//         },
//       ],
//       jobs: [
//         {
//           company: "",
//           location: "",
//           title: "",
//           description: "",
//           startMonth: "",
//           startYear: "",
//           endMonth: "",
//           endYear: "",
//           isCurrent: false,
//           accomplishments: [""],
//           awards: [""],
//         },
//       ],
//       skills: [""],
//       education: [
//         {
//           school: "",
//           degree: "",
//           startMonth: "",
//           startYear: "",
//           endMonth: "",
//           endYear: "",
//           isCurrent: false,
//           gpa: "",
//           clubs: "",
//         },
//       ],
//       certifications: [
//         {
//           name: "",
//           issuer: "",
//           issueDate: "",
//           url: "",
//         },
//       ],
//     },
//   });

//   const fieldsToValidateByStep: Record<number, (keyof SetupFormValues)[]> = {
//     1: [
//       "fullName",
//       "email",
//       "phone",
//       "address",
//       "city",
//       "state",
//       "postalCode",
//       "linkedin",
//     ],
//     2: ["pillars"],
//     3: ["jobs"],
//     4: ["skills"],
//     5: ["education", "certifications"],
//   };

//   const nextStep = async () => {
//     // Define the fields present on the current step/page
//     const fieldsToValidate = fieldsToValidateByStep[step] || [];
//     const isStepValid = await form.trigger(fieldsToValidate as any);
//     if (isStepValid) {
//       setStep((s) => s + 1);
//     } else {
//       // The errors are now automatically populated in form.formState.errors

//       console.warn("Fix the errors on this page before moving on.");
//       console.log(form.formState.errors);
//     }
//   };

//   const prevStep = () => setStep((s) => s - 1);

//   const onSubmit = async (values: SetupFormValues) => {
//     setIsSubmitting(true);
//     try {
//       // 1. Get current user session
//       const user = await getCurrentUser();
//       if (!user) throw new Error("User not authenticated");

//       // 2. Update Profile
//       const { error: profileError } = await supabase.from("profiles").upsert({
//         id: user.userId,
//         full_name: values.fullName,
//         email: values.email,
//         phone: values.phone,
//         address: values.address,
//         city: values.city,
//         state: values.state,
//         postal_code: values.postalCode,
//         linkedin_url: values.linkedin,
//       });
//       if (profileError) throw profileError;

//       // 3. Sync Narrative Pillars (Delete/Insert pattern)
//       await supabase
//         .from("narrative_pillars")
//         .delete()
//         .eq("user_id", user.userId);
//       const { error: pillarError } = await supabase
//         .from("narrative_pillars")
//         .insert(values.pillars.map((p) => ({ ...p, user_id: user.userId })));
//       if (pillarError) throw pillarError;

//       // 4. Sync Job History & Nested Details
//       // We do this by mapping each job to a request
//       for (const job of values.jobs) {
//         const { data: insertedJob, error: jobErr } = await supabase
//           .from("job_history")
//           .insert({
//             user_id: user.userId,
//             company: job.company,
//             location: job.location,
//             title: job.title,
//             description: job.description,
//             start_month: job.startMonth,
//             start_year: job.startYear,
//             end_month: job.endMonth,
//             end_year: job.endYear,
//             is_current: job.isCurrent,
//           })
//           .select()
//           .single();

//         if (jobErr) throw jobErr;

//         // Insert Accomplishments
//         const accs = job.accomplishments.map((content) => ({
//           job_id: insertedJob.id,
//           user_id: user.userId,
//           content,
//           type: "accomplishment",
//         }));

//         // Insert Awards
//         const awards = job.awards.map((content) => ({
//           job_id: insertedJob.id,
//           user_id: user.userId,
//           content,
//           type: "award",
//         }));

//         const { error: detailErr } = await supabase
//           .from("job_details")
//           .insert([...accs, ...awards]);
//         if (detailErr) throw detailErr;
//       }

//       // 5. Sync Skills
//       await supabase.from("user_skills").delete().eq("user_id", user.userId);
//       const { error: skillErr } = await supabase.from("user_skills").insert(
//         values.skills.map((s) => ({
//           user_id: user.userId,
//           skill_value: s,
//           skill_label: s,
//         })),
//       );
//       if (skillErr) throw skillErr;

//       toast.success("Virtual Me setup complete!");
//       // Navigate to dashboard or next tool
//     } catch (error: any) {
//       console.error(error);
//       toast.error(error.message || "Failed to save setup.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-4">
//       {/* Stepper UI */}
//       <div className="mb-12 flex items-center justify-between relative">
//         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
//         {[1, 2, 3, 4, 5].map((i) => (
//           <div
//             key={i}
//             className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
//               step >= i
//                 ? "bg-blue-600 border-blue-600 text-white"
//                 : "bg-white border-slate-200 text-slate-400"
//             }`}
//           >
//             {step > i ? (
//               <CheckCircle className="w-6 h-6" onClick={() => setStep(i)} />
//             ) : (
//               i
//             )}
//           </div>
//         ))}
//       </div>

//       <form
//         onSubmit={form.handleSubmit(onSubmit, (errors) => {
//           console.error("Validation Failed:", errors);
//         })}
//         className="space-y-8"
//       >
//         {step === 1 && <ProfileStep form={form} />}
//         {step === 2 && <PillarStep form={form} />}
//         {step === 3 && <JobHistoryStep form={form} />}
//         {step === 4 && <SkillsStep form={form} />}
//         {step === 5 && <CredentialsStep form={form} />}

//         <div className="flex justify-between items-center pt-6 border-t">
//           <Button
//             type="button"
//             variant="ghost"
//             onClick={prevStep}
//             disabled={step === 1 || isSubmitting}
//           >
//             <ChevronLeft className="w-4 h-4 mr-2" /> Back
//           </Button>

//           {step < 5 ? (
//             <Button
//               type="button"
//               onClick={nextStep}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               Next Step <ChevronRight className="w-4 h-4 ml-2" />
//             </Button>
//           ) : (
//             <Button
//               type="submit"
//               disabled={isSubmitting}
//               className="bg-emerald-600 hover:bg-emerald-700 min-w-37.5"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
//                 </>
//               ) : (
//                 "Save Setup Details"
//               )}
//             </Button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }
