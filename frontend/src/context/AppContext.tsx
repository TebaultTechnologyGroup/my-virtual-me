import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signOut as amplifySignOut,
} from "@aws-amplify/auth";
import { supabase } from "@/lib/supabase-client";
import { Hub } from "@aws-amplify/core";
import { toast } from "sonner";

interface User {
  userId: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  getProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        email: session.tokens?.idToken?.payload.email as string,
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const getProfile = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.userId)
      .single();

    if (error) {
      console.error("Error fetching Supabase profile:", error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    checkUser();

    // Listen for Auth events (SignIn, SignOut, etc.)
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkUser();
          break;
        case "signedOut":
          setUser(null);
          break;
        case "tokenRefresh_failure":
          setUser(null);
          toast.error("Session expired. Please login again.");
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, checkUser, getProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AppProvider");
  }
  return context;
};
