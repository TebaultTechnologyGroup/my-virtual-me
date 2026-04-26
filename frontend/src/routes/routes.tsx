import { createBrowserRouter } from "react-router";
import LandingPage from "./../pages/LandingPage";
import LoginPage from "./../pages/LoginPage";
import RegisterPage from "./../pages/RegisterPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import DashboardPage from "@/pages/DashboardPage";
import SetupPage from "@/pages/app/SetupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/verify-email",
    Component: VerifyEmailPage,
  },
  {
    path: "/app",
    Component: DashboardPage,
  },
  {
    path: "/app/setup",
    Component: SetupPage,
  },
]);

/*

// src/routes.tsx
import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
// Import your dashboard or app layout here later

import {
  RedirectIfAuthenticated,
  RequireAuthAndProfile,
} from "./guards/AuthGuard";

export const router = createBrowserRouter([
  {
    Component: RedirectIfAuthenticated,
    children: [
      { path: "/", Component: LandingPage },
      { path: "login", Component: LoginPage },
    ],
  },
  {
    Component: RequireAuth,
    children: [
      {
        path: "app",
        Component: Dashboard
      },
      // More protected routes will be added here
    ],
  }
]);


*/
