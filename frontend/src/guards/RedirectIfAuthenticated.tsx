import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AppContext";
import { Loader2 } from "lucide-react";

export function RedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to app if the user is authenticated.
  if (user) {
    return <Navigate to="/app" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
