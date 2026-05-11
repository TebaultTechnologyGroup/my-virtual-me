"use client";

import { useEffect, useState } from "react";
import Instructions from "./Instructions";

export default function DashboardPage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    setIsSetupComplete(false);
  }, []);

  return <>{isSetupComplete ? "complete" : <Instructions />}</>;
}
