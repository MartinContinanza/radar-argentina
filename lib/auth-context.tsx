"use client";
/**
 * auth-context.tsx
 * ─────────────────────────────────────────────────────────────
 * Global authentication context for Radar.
 *
 * USER TYPES:
 *   - "admin"    → @controlunion.com + flag admin=true  (gestión total)
 *   - "internal" → @controlunion.com                    (usuario interno)
 *   - "external" → cualquier otro dominio               (usuario externo)
 *
 * PRODUCTION: replace the mock functions with real API calls
 * (Supabase Auth, NextAuth, Firebase Auth, etc.)
 * ─────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "internal" | "external";

export interface RadarUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  newsletterSubs: string[];   // module ids subscribed
  favorites: string[];        // news item ids
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

function deriveRole(email: string, isAdminFlag = false): UserRole {
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain === "controlunion.com") {
    return isAdminFlag ? "admin" : "internal";
  }
  return "external";
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Mock DB (localStorage) ─────────────────────────────────────────────────
// In production, replace with real API calls.

const DB_KEY = "radar_users_db";
const SESSION_KEY = "radar_session";

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // In production: NEVER store passwords client-side
  isAdminFlag: boolean;
  createdAt: string;
  newsletterSubs: string[];
  favorites: string[];
}

function getDB(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDB(db: StoredUser[]) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Seed a default admin for demo purposes
function seedAdmin() {
  const db = getDB();
  if (!db.find((u) => u.email === "mcontinanza@controlunion.com")) {
    db.push({
      id: "admin-seed",
      email: "mcontinanza@controlunion.com",
      name: "mcontinanza",
      passwordHash: btoa("admin1234"), // demo only — use proper hashing in prod
      isAdminFlag: true,
      createdAt: new Date().toISOString(),
      newsletterSubs: [],
      favorites: [],
    });
    saveDB(db);
  }
}

function hashPassword(pw: string) {
  // Demo only — use bcrypt/argon2 server-side in production
  return btoa(pw);
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RadarUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    try {
      seedAdmin();
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const stored: RadarUser = JSON.parse(raw);
        setUser(stored);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const persistSession = (u: RadarUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      await new Promise((r) => setTimeout(r, 600)); // simulate network
      const db = getDB();
      const found = db.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.passwordHash === hashPassword(password)
      );
      if (!found) return { error: "Email o contraseña incorrectos." };

      const role = deriveRole(found.email, found.isAdminFlag);
      const radarUser: RadarUser = {
        id: found.id,
        email: found.email,
        name: found.name,
        role,
        createdAt: found.createdAt,
        lastLoginAt: new Date().toISOString(),
        newsletterSubs: found.newsletterSubs,
        favorites: found.favorites,
      };

      // Update last login in DB
      const idx = db.indexOf(found);
      db[idx] = { ...found };
      saveDB(db);

      persistSession(radarUser);
      return {};
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ error?: string }> => {
      await new Promise((r) => setTimeout(r, 600));
      const db = getDB();
      if (db.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { error: "Ya existe una cuenta con ese email." };
      }
      if (password.length < 8) {
        return { error: "La contraseña debe tener al menos 8 caracteres." };
      }

      const newUser: StoredUser = {
        id: makeId(),
        email,
        name,
        passwordHash: hashPassword(password),
        isAdminFlag: false,
        createdAt: new Date().toISOString(),
        newsletterSubs: [],
        favorites: [],
      };
      db.push(newUser);
      saveDB(db);

      const role = deriveRole(email, false);
      const radarUser: RadarUser = {
        id: newUser.id,
        email,
        name,
        role,
        createdAt: newUser.createdAt,
        lastLoginAt: new Date().toISOString(),
        newsletterSubs: [],
        favorites: [],
      };
      persistSession(radarUser);
      return {};
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<{ error?: string }> => {
      await new Promise((r) => setTimeout(r, 800));
      const db = getDB();
      const found = db.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        // Don't reveal whether email exists (security best practice)
        return {};
      }
      // In production: send email via Resend/SendGrid/etc.
      console.info(`[AUTH] Password reset requested for ${email}`);
      return {};
    },
    []
  );

  const updateUser = useCallback((partial: Partial<RadarUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
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

// ── Admin helpers (read-only stats from mock DB) ───────────────────────────

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

export function getAdminStats(): AdminStats {
  const db = getDB();
  const users: StoredUserPublic[] = db.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: deriveRole(u.email, u.isAdminFlag),
    createdAt: u.createdAt,
  }));

  const newsletterSubs: Record<string, number> = {};
  for (const u of db) {
    for (const sub of u.newsletterSubs) {
      newsletterSubs[sub] = (newsletterSubs[sub] || 0) + 1;
    }
  }

  return {
    totalUsers: users.length,
    internalUsers: users.filter((u) => u.role === "internal" || u.role === "admin").length,
    externalUsers: users.filter((u) => u.role === "external").length,
    adminUsers: users.filter((u) => u.role === "admin").length,
    recentUsers: users.slice(-10).reverse(),
    newsletterSubs,
  };
}

export function promoteToAdmin(userId: string): boolean {
  const db = getDB();
  const idx = db.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  db[idx].isAdminFlag = true;
  saveDB(db);
  return true;
}

export function demoteFromAdmin(userId: string): boolean {
  const db = getDB();
  const idx = db.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  db[idx].isAdminFlag = false;
  saveDB(db);
  return true;
}

export function deleteUser(userId: string): boolean {
  const db = getDB();
  const idx = db.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  db.splice(idx, 1);
  saveDB(db);
  return true;
}
