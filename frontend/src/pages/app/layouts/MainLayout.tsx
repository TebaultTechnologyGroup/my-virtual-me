import { Link, useNavigate, Outlet } from "react-router-dom";
import { Settings, Bot, FileText, Briefcase, User, LogOut } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "./../../../lib/supabase-client";

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 pl-6">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/app" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-blue-600">
                Virtual Me
              </span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link
                    to="/app/setup"
                    className={navigationMenuTriggerStyle()}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Setup
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link
                    to="/app/agent"
                    className={navigationMenuTriggerStyle()}
                  >
                    <Bot className="w-4 h-4 mr-2" /> Agent
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link
                    to="/app/resumes"
                    className={navigationMenuTriggerStyle()}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Resumes
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/app/jobs" className={navigationMenuTriggerStyle()}>
                    <Briefcase className="w-4 h-4 mr-2" /> Jobs
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border"
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/profile")}>
                  Account Info
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/app/profile/billing")}
                >
                  Subscription & Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="space-y-4 ">
        <Outlet />
      </main>
    </div>
  );
}
