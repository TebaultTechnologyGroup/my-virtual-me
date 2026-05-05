import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./context/AppContext";
import { RouterProvider } from "react-router";
import { router } from "./routes/routes";
import { Toaster } from "@/components/ui/sonner";

// This import initializes Amplify Auth globally
import "./lib/auth-config";
import "./index.css";

// Place this at the absolute top of your entry file
const blockFrameworkNoise = () => {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    // Check if the log is the service worker success object
    if (args[0] && typeof args[0] === "object" && args[0].serviceWorkerId) {
      return;
    }
    // Check if it's the stringified version
    if (typeof args[0] === "string" && args[0].includes("serviceWorkerId")) {
      return;
    }
    originalLog(...args);
  };
};

blockFrameworkNoise();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster richColors closeButton />
    </AppProvider>
  </React.StrictMode>,
);
