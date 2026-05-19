import { createBrowserRouter } from "react-router";
import LandingPage from "./../pages/LandingPage";
import LoginPage from "./../pages/LoginPage";
import RegisterPage from "./../pages/RegisterPage";
import VerifyEmailPage from "./../pages/VerifyEmailPage";
import DashboardPage from "@/pages/app/dashboard/DashboardPage";
import ProfilePage from "../pages/app/setup/SetupPage";
import { RedirectIfAuthenticated } from "./../guards/RedirectIfAuthenticated";
import { ProtectedRoutes } from "./../guards/ProtectedRoutes";
import MainLayout from "@/pages/app/layouts/MainLayout";
import PersonalPage from "@/pages/app/setup/steps/PersonalPage";
import { CredentialsPage } from "@/pages/app/setup/steps/CredentialsPage";
import JobHistoryPage from "@/pages/app/setup/steps/JobHistoryPage";
import SkillsPage from "@/pages/app/setup/steps/SkillsPage";
import TrainingStudio from "@/pages/app/agent/training/TrainingStudio";
import TargetRoles from "@/pages/app/setup/steps/TargetRolesPage";
import TargetRolesPage from "@/pages/app/setup/steps/TargetRolesPage";
import SummaryPage from "@/pages/app/setup/steps/SummaryPage";

export const router = createBrowserRouter([
  {
    Component: RedirectIfAuthenticated,
    children: [
      { path: "/", Component: LandingPage },
      { path: "/login", Component: LoginPage },
      { path: "/register", Component: RegisterPage },
      { path: "/verify-email", Component: VerifyEmailPage },
    ],
  },
  {
    Component: ProtectedRoutes, // Logic for auth check
    children: [
      {
        Component: MainLayout, // Your new Top Nav layout
        children: [
          { path: "/app", Component: DashboardPage },
          { path: "/app/setup", Component: ProfilePage },
          { path: "/app/setup/personal", Component: PersonalPage },
          { path: "/app/setup/target-roles", Component: TargetRolesPage },
          { path: "/app/setup/job-history", Component: JobHistoryPage },
          { path: "/app/setup/credentials", Component: CredentialsPage },
          { path: "/app/setup/skills", Component: SkillsPage },
          { path: "/app/agent/training", Component: TrainingStudio },
        ],
      },
    ],
  },
]);
