"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../lib/auth-context";

type View = "login" | "register" | "reset" | "reset-sent" | "success";

function IconMail() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconEye({ show }: { show: boolean }) {
  return show ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function Input({
  icon, type = "text", placeholder, value, onChange, autoComplete, rightSlot,
}: {
  icon: React.ReactNode; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3.5 text-slate-500 pointer-events-none">{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] focus:ring-1 focus:ring-[#3EB2ED]/30 transition-all"
      />
      {rightSlot && <span className="absolute right-3 text-slate-500">{rightSlot}</span>}
    </div>
  );
}

function roleBadge(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain === "controlunion.com") {
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700">INTERNO</span>;
  }
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">EXTERNO</span>;
}

function ModalContent({ onClose }: { onClose: () => void }) {
  const { login, register, sendPasswordReset } = useAuth();
  const [view, setView] = useState<View>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [lEmail, setLEmail] = useState("");
  const [lPw, setLPw] = useState("");
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPw, setRPw] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  function clearError() { setError(""); }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); clearError(); setBusy(true);
    const res = await login(lEmail, lPw);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    setView("success");
    setTimeout(onClose, 1200);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); clearError(); setBusy(true);
    const res = await register(rName, rEmail, rPw);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    setView("success");
    setTimeout(onClose, 1200);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault(); clearError(); setBusy(true);
    await sendPasswordReset(resetEmail);
    setBusy(false);
    setView("reset-sent");
  }

  if (view === "success") return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">✓</div>
      <p className="font-bold text-white text-lg">¡Bienvenido!</p>
      <p className="text-slate-400 text-sm">Sesión iniciada correctamente.</p>
    </div>
  );

  if (view === "reset-sent") return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-16 h-16 rounded-full bg-[#3EB2ED]/20 border border-[#3EB2ED]/40 flex items-center justify-center text-3xl">✉</div>
      <p className="font-bold text-white text-lg">Revisá tu email</p>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        Si existe una cuenta para <span className="text-slate-200">{resetEmail}</span>, recibirás las instrucciones para restablecer tu contraseña.
      </p>
      <button onClick={() => setView("login")} className="text-sm text-[#3EB2ED] hover:underline mt-2">Volver al inicio de sesión</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 bg-slate-900/80 rounded-xl p-1">
        {(["login", "register"] as View[]).map((v) => (
          <button key={v} onClick={() => { setView(v); clearError(); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === v ? "bg-[#3EB2ED] text-white shadow" : "text-slate-500 hover:text-slate-300"}`}>
            {v === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      {view === "login" && (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input icon={<IconMail />} type="email" placeholder="correo@ejemplo.com" value={lEmail} onChange={setLEmail} autoComplete="email" />
          <Input icon={<IconLock />} type={showPw ? "text" : "password"} placeholder="Contraseña" value={lPw} onChange={setLPw} autoComplete="current-password"
            rightSlot={<button type="button" onClick={() => setShowPw(v => !v)} className="hover:text-slate-300 transition-colors"><IconEye show={showPw} /></button>} />
          <button type="button" onClick={() => { setView("reset"); setResetEmail(lEmail); clearError(); }}
            className="text-xs text-slate-500 hover:text-[#3EB2ED] transition-colors text-left -mt-1">
            ¿Olvidaste tu contraseña?
          </button>
          <button type="submit" disabled={busy || !lEmail || !lPw}
            className="w-full py-2.5 rounded-xl bg-[#3EB2ED] hover:bg-[#1a8fc7] disabled:opacity-40 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      )}

      {view === "register" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input icon={<IconUser />} placeholder="Tu nombre completo" value={rName} onChange={setRName} autoComplete="name" />
          <div className="flex flex-col gap-1.5">
            <Input icon={<IconMail />} type="email" placeholder="correo@ejemplo.com" value={rEmail} onChange={setREmail} autoComplete="email" />
            {rEmail.includes("@") && (
              <div className="flex items-center gap-2 px-1">
                {roleBadge(rEmail)}
                <span className="text-[10px] text-slate-600">
                  {rEmail.split("@")[1]?.toLowerCase() === "controlunion.com" ? "Acceso como usuario interno de Control Union" : "Acceso como usuario externo"}
                </span>
              </div>
            )}
          </div>
          <Input icon={<IconLock />} type={showPw ? "text" : "password"} placeholder="Contraseña (mín. 8 caracteres)" value={rPw} onChange={setRPw} autoComplete="new-password"
            rightSlot={<button type="button" onClick={() => setShowPw(v => !v)} className="hover:text-slate-300 transition-colors"><IconEye show={showPw} /></button>} />
          <button type="submit" disabled={busy || !rName || !rEmail || rPw.length < 8}
            className="w-full py-2.5 rounded-xl bg-[#3EB2ED] hover:bg-[#1a8fc7] disabled:opacity-40 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {busy ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      )}

      {view === "reset" && (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <p className="text-sm text-slate-400 -mt-1">Ingresá tu email y te enviaremos las instrucciones para restablecer tu contraseña.</p>
          <Input icon={<IconMail />} type="email" placeholder="correo@ejemplo.com" value={resetEmail} onChange={setResetEmail} autoComplete="email" />
          <button type="submit" disabled={busy || !resetEmail}
            className="w-full py-2.5 rounded-xl bg-[#3EB2ED] hover:bg-[#1a8fc7] disabled:opacity-40 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {busy ? "Enviando…" : "Enviar instrucciones"}
          </button>
          <button type="button" onClick={() => { setView("login"); clearError(); }} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Volver</button>
        </form>
      )}
    </div>
  );
}

// ── Modal con Portal — se renderiza directo en <body>, fuera del header ────

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // Bloquear scroll del body mientras el modal está abierto
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(2, 6, 23, 0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl"
        style={{ animation: "modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-[#3EB2ED]">◈</span>
            <span className="font-bold text-white tracking-tight">Radar</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><IconClose /></button>
        </div>
        <div className="px-6 py-5">
          <ModalContent onClose={onClose} />
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── AuthButton ─────────────────────────────────────────────────────────────

export function AuthButton() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  if (loading) return <div className="w-24 h-8 rounded-lg bg-slate-800 animate-pulse" />;

  if (user) {
    const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const roleColors: Record<string, string> = {
      admin: "bg-amber-500", internal: "bg-sky-500", external: "bg-slate-500",
    };

    return (
      <>
        <div className="relative">
          <button onClick={() => setDropOpen(v => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-700 hover:border-[#3EB2ED]/60 transition-all">
            <div className={`w-7 h-7 rounded-full ${roleColors[user.role]} flex items-center justify-center text-white text-xs font-bold`}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-slate-200">{user.name.split(" ")[0]}</span>
              <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
            </div>
            <span className="text-slate-500 text-xs">▾</span>
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/60">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                {user.role === "admin" && (
                  <a href="/admin" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-amber-400 hover:bg-slate-700/60 transition-colors border-b border-slate-700/40">
                    <span>⚙</span> Panel de admin
                  </a>
                )}
                <button onClick={() => { logout(); setDropOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-400 hover:bg-slate-700/60 hover:text-red-400 transition-colors text-left">
                  <span>↩</span> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
        <AuthModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 hover:border-[#3EB2ED] hover:text-[#3EB2ED] text-slate-300 text-sm font-semibold transition-all">
        <IconUser />
        <span className="hidden sm:block">Iniciar sesión</span>
      </button>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
