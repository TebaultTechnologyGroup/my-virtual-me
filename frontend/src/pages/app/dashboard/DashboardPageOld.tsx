// import { useNavigate } from "react-router-dom";
// import {
//   UserCircle,
//   BrainCircuit,
//   FileStack,
//   MicVocal,
//   LogOut,
//   ArrowRight,
// } from "lucide-react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { supabase } from "@/lib/supabase-client";

// const dashboardOptions = [
//   {
//     title: "Profile",
//     description:
//       "Manage your personal information, contact details, and location for your resume header.",
//     icon: UserCircle,
//     path: "/app/setup",
//     color: "text-slate-600",
//     bg: "bg-slate-50",
//   },
//   {
//     title: "Train Virtual Me",
//     description:
//       "The core of your AI. Update narrative pillars, job history, and STAR stories to sharpen your agent.",
//     icon: BrainCircuit,
//     path: "/app/setup",
//     color: "text-blue-600",
//     bg: "bg-blue-50",
//   },
//   {
//     title: "Resume Builder",
//     description:
//       "Generate tailored resumes based on your trained personas and specific job descriptions.",
//     icon: FileStack,
//     path: "/app/resume-builder",
//     color: "text-emerald-600",
//     bg: "bg-emerald-50",
//   },
//   {
//     title: "Interview Prep",
//     description:
//       "Practice with your AI coach. Get feedback based on your signature professional stories.",
//     icon: MicVocal,
//     path: "/app/interview-prep",
//     color: "text-purple-600",
//     bg: "bg-purple-50",
//   },
// ];

// export default function DashboardPage() {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="flex justify-between items-start mb-10">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Executive Control Center
//           </h1>
//           <p className="text-muted-foreground mt-2">
//             Manage your professional identity and AI training.
//           </p>
//         </div>
//         <Button
//           variant="outline"
//           onClick={handleLogout}
//           className="text-destructive hover:bg-destructive/10"
//         >
//           <LogOut className="w-4 h-4 mr-2" /> Log Off
//         </Button>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {dashboardOptions.map((option) => (
//           <Card
//             key={option.title}
//             className="hover:shadow-lg transition-all border-2 hover:border-blue-200 group"
//           >
//             <CardHeader>
//               <div
//                 className={`w-12 h-12 rounded-xl ${option.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
//               >
//                 <option.icon className={`w-6 h-6 ${option.color}`} />
//               </div>
//               <CardTitle className="text-xl">{option.title}</CardTitle>
//               <CardDescription className="line-clamp-3">
//                 {option.description}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 variant="ghost"
//                 className="w-full justify-between group/btn"
//                 onClick={() => navigate(option.path)}
//               >
//                 Open {option.title}
//                 <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
