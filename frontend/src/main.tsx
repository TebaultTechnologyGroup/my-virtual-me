import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./context/AppContext";
import { RouterProvider } from "react-router";
import { router } from "./routes/routes";
import { Toaster } from "@/components/ui/sonner";

// This import initializes Amplify Auth globally
import "./lib/auth-config";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster richColors closeButton />
    </AppProvider>
  </React.StrictMode>,
);
