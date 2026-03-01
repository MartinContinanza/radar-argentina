"use client";
/**
 * components/AdminDashboard.tsx
 * Panel de administración completo.
 * Se importa dinámicamente (ssr:false) desde app/admin/page.tsx
 */

import { useState, useEffect } from "react";
import { Shell } from "./Shell";
import {
  useAuth,
  getAdminStats,
  promoteToAdmin,
  demoteFromAdmin,
  deleteUser,
  AdminStats,
  StoredUserPublic,
  UserRole,
} from "../lib/auth-context";

// ── Redirect if not admin ──────────────────────────────────────────────────

function AccessDenied() {
  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Acceso restringido</h2>
        <p className="text-slate-400 mb-6">Esta sección es exclusiva para administradores de Radar.</p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-xl transition-colors">
          ← Volver al inicio
        </a>
      </div>
    </Shell>
  );
}

// ── Role badge ─────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<UserRole, string> = {
  admin:    "bg-amber-900/50 text-amber-300 border-amber-700",
  internal: "bg-sky-900/50 text-sky-300 border-sky-700",
  external: "bg-slate-700 text-slate-300 border-slate-600",
};
const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  internal: "Interno",
  external: "Externo",
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ value, label, color = "text-[#3EB2ED]", icon }: {
  value: number | string; label: string; color?: string; icon: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className={`text-3xl font-bold font-display ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Users Table ────────────────────────────────────────────────────────────

function UsersTable({ users, currentUserId, onRefresh }: {
  users: StoredUserPublic[]; currentUserId: string; onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchText = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchText && matchRole;
  });

  async function handlePromote(userId: string) {
    setBusy(userId);
    await new Promise((r) => setTimeout(r, 400));
    promoteToAdmin(userId);
    onRefresh();
    setBusy(null);
  }

  async function handleDemote(userId: string) {
    setBusy(userId);
    await new Promise((r) => setTimeout(r, 400));
    demoteFromAdmin(userId);
    onRefresh();
    setBusy(null);
  }

  async function handleDelete(userId: string) {
    setBusy(userId);
    await new Promise((r) => setTimeout(r, 400));
    deleteUser(userId);
    setConfirmDelete(null);
    onRefresh();
    setBusy(null);
  }

  function fmtDate(iso: string) {
    try { return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return iso; }
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/40 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Buscar por nombre o email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#3EB2ED] transition">
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="internal">Interno</option>
          <option value="external">Externo</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/40">
              {["Usuario", "Email", "Rol", "Registrado", "Acciones"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-600">No hay usuarios que coincidan.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className={`border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors ${u.id === currentUserId ? "bg-[#3EB2ED]/5" : ""}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      u.role === "admin" ? "bg-amber-500" : u.role === "internal" ? "bg-sky-500" : "bg-slate-600"}`}>
                      {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-200">
                      {u.name}
                      {u.id === currentUserId && <span className="ml-2 text-[10px] text-[#3EB2ED]">(vos)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">{fmtDate(u.createdAt)}</td>
                <td className="px-5 py-3.5">
                  {u.id === currentUserId ? (
                    <span className="text-[10px] text-slate-600">—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {u.role === "internal" && (
                        <button onClick={() => handlePromote(u.id)} disabled={busy === u.id}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-amber-700/50 text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-40">
                          {busy === u.id ? "…" : "→ Admin"}
                        </button>
                      )}
                      {u.role === "admin" && (
                        <button onClick={() => handleDemote(u.id)} disabled={busy === u.id}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-sky-700/50 text-sky-400 hover:bg-sky-500/10 transition-colors disabled:opacity-40">
                          {busy === u.id ? "…" : "↓ Interno"}
                        </button>
                      )}
                      {confirmDelete === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleDelete(u.id)} disabled={busy === u.id}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-red-700/60 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40">
                            {busy === u.id ? "…" : "Confirmar"}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(u.id)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 text-slate-500 hover:border-red-700/50 hover:text-red-400 transition-colors">
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-slate-700/40 text-xs text-slate-600">
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
        {search || roleFilter ? ` · filtrado de ${users.length} total` : " registrados"}
      </div>
    </div>
  );
}

// ── Newsletter Panel ───────────────────────────────────────────────────────

const NL_LABELS: Record<string, string> = {
  textiles: "Textiles", eudr: "EUDR", agro: "Agro", organico: "Mercado Orgánico",
};

function NewsletterPanel({ subs }: { subs: Record<string, number> }) {
  const entries = Object.entries(NL_LABELS).map(([id, label]) => ({
    id, label, count: subs[id] || 0,
  }));
  const maxCount = Math.max(...entries.map((e) => e.count), 1);
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span>📬</span> Suscripciones a Newsletter</h3>
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300">{e.label}</span>
              <span className="text-sm font-bold text-[#3EB2ED]">{e.count}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#3EB2ED] rounded-full transition-all duration-500"
                style={{ width: `${(e.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity Feed ──────────────────────────────────────────────────────────

const MOCK_ACTIVITY = [
  { icon: "👤", text: "Nuevo usuario registrado: usuario@empresa.com", time: "hace 5 min" },
  { icon: "🔑", text: "Inicio de sesión: admin@controlunion.com", time: "hace 12 min" },
  { icon: "📬", text: "Nueva suscripción a newsletter EUDR", time: "hace 1h" },
  { icon: "💡", text: "Sugerencia recibida: agregar fuente INTA", time: "hace 3h" },
  { icon: "👤", text: "Nuevo usuario registrado: productor@campo.com.ar", time: "hace 5h" },
  { icon: "📬", text: "Nueva suscripción a newsletter Agro", time: "hace 8h" },
];

function ActivityFeed() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span>⚡</span> Actividad reciente
        <span className="text-[10px] text-slate-600 font-normal ml-1">(demo)</span>
      </h3>
      <div className="space-y-3">
        {MOCK_ACTIVITY.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">{a.icon}</span>
            <div>
              <p className="text-sm text-slate-300">{a.text}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Suggestions Panel ──────────────────────────────────────────────────────

const MOCK_SUGGESTIONS = [
  { name: "Carlos M.", email: "carlos@soja.com.ar", msg: "Agregaría fuente del INTA para regulaciones fitosanitarias locales.", date: "2025-03-01" },
  { name: "Ana R.", email: "", msg: "¿Podrían cubrir el mercado de carbono voluntario? Es clave para el agro.", date: "2025-02-28" },
  { name: "—", email: "textilera@empresa.com", msg: "Falta cobertura de la norma OEKO-TEX para textiles.", date: "2025-02-26" },
];

function SuggestionsPanel() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span>💡</span> Sugerencias recibidas
        <span className="text-[10px] text-slate-600 font-normal ml-1">(demo)</span>
      </h3>
      <div className="space-y-3">
        {MOCK_SUGGESTIONS.map((s, i) => (
          <div key={i} className="bg-slate-900/40 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-slate-200">{s.name}</span>
              <span className="text-[11px] text-slate-600 shrink-0">{s.date}</span>
            </div>
            {s.email && <p className="text-[11px] text-slate-500 mb-1.5">{s.email}</p>}
            <p className="text-sm text-slate-400 leading-relaxed">{s.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "newsletter" | "suggestions">("overview");

  function refreshStats() { getAdminStats().then(setStats); }

  useEffect(() => { if (isAdmin) refreshStats(); }, [isAdmin]);

  if (loading) {
    return (
      <Shell>
        <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
          <span className="w-6 h-6 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!isAdmin) return <AccessDenied />;

  const TABS = [
    { id: "overview",     label: "Resumen",     icon: "📊" },
    { id: "users",        label: "Usuarios",    icon: "👥" },
    { id: "newsletter",   label: "Newsletter",  icon: "📬" },
    { id: "suggestions",  label: "Sugerencias", icon: "💡" },
  ] as const;

  return (
    <Shell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400">⚙</span>
              <h2 className="font-display text-2xl font-bold text-white">Panel de Administración</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Bienvenido, <span className="text-slate-200 font-semibold">{user?.name}</span>
              {" · "}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 border border-amber-700">ADMIN</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema operativo
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-slate-700/60 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab.id ? "text-[#3EB2ED] border-[#3EB2ED]" : "text-slate-500 border-transparent hover:text-slate-300"}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value={stats.totalUsers}    label="Usuarios totales"   icon="👥" />
              <StatCard value={stats.internalUsers} label="Usuarios internos"  icon="🏢" color="text-sky-400" />
              <StatCard value={stats.externalUsers} label="Usuarios externos"  icon="🌐" color="text-emerald-400" />
              <StatCard value={stats.adminUsers}    label="Administradores"    icon="⚙"  color="text-amber-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard value="22" label="Fuentes activas" icon="📡" color="text-[#3EB2ED]" />
              <StatCard value="3"  label="Sugerencias nuevas" icon="💡" color="text-purple-400" />
              <StatCard value={Object.values(stats.newsletterSubs).reduce((a, b) => a + b, 0)} label="Suscripciones newsletter" icon="📬" color="text-emerald-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActivityFeed />
              <NewsletterPanel subs={stats.newsletterSubs} />
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && stats && (
          <UsersTable users={stats.recentUsers} currentUserId={user!.id} onRefresh={refreshStats} />
        )}

        {/* Newsletter */}
        {activeTab === "newsletter" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NewsletterPanel subs={stats.newsletterSubs} />
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Métricas de apertura
                <span className="text-[10px] text-slate-600 font-normal ml-1">(próximamente)</span>
              </h3>
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-600">
                <span className="text-4xl">📈</span>
                <p className="text-sm">Métricas de newsletters en desarrollo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {activeTab === "suggestions" && <SuggestionsPanel />}

        {!stats && activeTab !== "suggestions" && (
          <div className="text-center py-16 text-slate-600">
            <p className="text-4xl mb-4">◈</p>
            <p className="text-sm">Cargando estadísticas…</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
