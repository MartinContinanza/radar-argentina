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

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<RadarUser | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role as UserRole,
    createdAt: data.created_at,
  };
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RadarUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // First: check for existing session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    });

    // Then: listen for changes (login, logout, token refresh, email confirm)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
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
    },
    []
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
    },
    []
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
    },
    []
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

// ── Admin helpers ──────────────────────────────────────────────────────────

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
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

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
