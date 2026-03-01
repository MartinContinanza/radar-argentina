"use client";
/**
 * lib/auth-context.tsx
 * Autenticación real con Supabase Auth + tabla profiles
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "./supabase-client";

export type UserRole = "admin" | "internal" | "external";

export interface RadarUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextValue {
  user: RadarUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  updateUser: (partial: Partial<RadarUser>) => void;
  isAdmin: boolean;
  isInternal: boolean;
}

async function fetchProfile(userId: string, accessToken?: string): Promise<RadarUser | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hvftwdsmwakqklnsymkd.supabase.co"}/rest/v1/profiles?id=eq.${userId}&select=*`;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZnR3ZHNtd2FrcWtsbnN5bWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTc1NDAsImV4cCI6MjA4Nzk3MzU0MH0.PofSC-juYgEzw3oSwVRjCLvr9TTwQUZT5PK-VXjbfl4";
    const res = await fetch(url, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${accessToken || key}`,
      },
    });
    const data = await res.json();
    console.log("fetchProfile:", { userId, data });
    if (!data || !data[0]) return null;
    const p = data[0];
    return {
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role as UserRole,
      createdAt: p.created_at,
    };
  } catch (e) {
    console.error("fetchProfile error:", e);
    return null;
  }
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RadarUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("getSession:", { session: session?.user?.email, error });
        if (!mounted) return;
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.access_token);
          console.log("profile loaded:", profile);
          if (mounted) setUser(profile);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("onAuthStateChange:", event, session?.user?.email);
        if (!mounted) return;
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.access_token);
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Email o contraseña incorrectos." };
        }
        return { error: error.message };
      }
      return {};
    }, []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ error?: string }> => {
      if (password.length < 8) {
        return { error: "La contraseña debe tener al menos 8 caracteres." };
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          return { error: "Ya existe una cuenta con ese email." };
        }
        return { error: error.message };
      }
      return {};
    }, []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<{ error?: string }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
      return {};
    }, []
  );

  const updateUser = useCallback((partial: Partial<RadarUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    updateUser,
    isAdmin: user?.role === "admin",
    isInternal: user?.role === "internal" || user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export interface AdminStats {
  totalUsers: number;
  internalUsers: number;
  externalUsers: number;
  adminUsers: number;
  recentUsers: StoredUserPublic[];
  newsletterSubs: Record<string, number>;
}

export interface StoredUserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("getAdminStats:", { profiles, error });

  const users: StoredUserPublic[] = (profiles || []).map((p) => ({
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role as UserRole,
    createdAt: p.created_at,
  }));

  return {
    totalUsers: users.length,
    internalUsers: users.filter((u) => u.role === "internal" || u.role === "admin").length,
    externalUsers: users.filter((u) => u.role === "external").length,
    adminUsers: users.filter((u) => u.role === "admin").length,
    recentUsers: users.slice(0, 20),
    newsletterSubs: {},
  };
}

export async function promoteToAdmin(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);
  return !error;
}

export async function demoteFromAdmin(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ role: "internal" })
    .eq("id", userId);
  return !error;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);
  return !error;
}
