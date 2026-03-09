"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AuthModal } from "./auth-modal";

// ── Animated counter ───────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(to / 60);
        const timer = setInterval(() => {
          start = Math.min(start + step, to);
          setVal(start);
          if (start >= to) clearInterval(timer);
        }, 18);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toLocaleString("es-AR")}{suffix}</span>;
}

// ── Radar scan animation (SVG) ─────────────────────────────────────────────
function RadarViz() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 480 480"
        className="w-full h-full max-w-[520px] max-h-[520px]"
        style={{ filter: "drop-shadow(0 0 32px rgba(62,178,237,0.15))" }}
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f1a2e" />
            <stop offset="100%" stopColor="#060d1a" />
          </radialGradient>
          <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(62,178,237,0.35)" />
            <stop offset="100%" stopColor="rgba(62,178,237,0)" />
          </radialGradient>
          <clipPath id="radarClip">
            <circle cx="240" cy="240" r="220" />
          </clipPath>
        </defs>

        {/* Background */}
        <circle cx="240" cy="240" r="240" fill="url(#bgGrad)" />

        {/* Grid rings */}
        {[55, 110, 165, 220].map((r) => (
          <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="rgba(62,178,237,0.10)" strokeWidth="1" />
        ))}

        {/* Cross hairs */}
        <line x1="240" y1="20" x2="240" y2="460" stroke="rgba(62,178,237,0.08)" strokeWidth="1" />
        <line x1="20" y1="240" x2="460" y2="240" stroke="rgba(62,178,237,0.08)" strokeWidth="1" />
        <line x1="84" y1="84" x2="396" y2="396" stroke="rgba(62,178,237,0.05)" strokeWidth="1" />
        <line x1="396" y1="84" x2="84" y2="396" stroke="rgba(62,178,237,0.05)" strokeWidth="1" />

        {/* Sweep */}
        <g clipPath="url(#radarClip)">
          <g style={{ transformOrigin: "240px 240px", animation: "radarSweep 4s linear infinite" }}>
            <path
              d="M240,240 L240,20 A220,220 0 0,1 460,240 Z"
              fill="url(#sweepGrad)"
              opacity="0.85"
            />
          </g>
        </g>

        {/* Center dot */}
        <circle cx="240" cy="240" r="5" fill="#3EB2ED" opacity="0.9" />
        <circle cx="240" cy="240" r="10" fill="none" stroke="#3EB2ED" strokeWidth="1.5" opacity="0.4" />

        {/* Blips — static positions simulating detected signals */}
        {[
          { cx: 310, cy: 140, r: 4, delay: "0.3s" },
          { cx: 165, cy: 185, r: 3, delay: "1.1s" },
          { cx: 355, cy: 280, r: 5, delay: "2.2s" },
          { cx: 190, cy: 320, r: 3, delay: "0.8s" },
          { cx: 290, cy: 370, r: 4, delay: "1.7s" },
          { cx: 130, cy: 255, r: 3, delay: "3.0s" },
          { cx: 380, cy: 190, r: 3, delay: "0.5s" },
        ].map((b, i) => (
          <g key={i}>
            <circle cx={b.cx} cy={b.cy} r={b.r} fill="#3EB2ED" opacity="0.85" />
            <circle
              cx={b.cx} cy={b.cy} r={b.r + 2}
              fill="none" stroke="#3EB2ED" strokeWidth="1"
              opacity="0.4"
              style={{ animation: `blipPulse 2.4s ease-out ${b.delay} infinite` }}
            />
          </g>
        ))}

        {/* Outer ring */}
        <circle cx="240" cy="240" r="220" fill="none" stroke="rgba(62,178,237,0.20)" strokeWidth="1.5" />
      </svg>

      <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blipPulse {
          0%   { opacity: 0.6; r: 4px; }
          60%  { opacity: 0; r: 14px; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Tag chip ───────────────────────────────────────────────────────────────
function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[#3EB2ED]/25 bg-[#3EB2ED]/8 text-[#3EB2ED] tracking-wide uppercase">
      {label}
    </span>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-[#3EB2ED]/40 hover:bg-slate-800/80 transition-all duration-300">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(ellipse at top left, rgba(62,178,237,0.05) 0%, transparent 70%)" }} />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-[#3EB2ED]/12 border border-[#3EB2ED]/20 flex items-center justify-center text-xl mb-4">
          {icon}
        </div>
        <h3 className="font-bold text-white text-sm mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ── Source badge ───────────────────────────────────────────────────────────
function SourceBadge({ label, region }: { label: string; region: "UE" | "AR" | "Global" | "USA" }) {
  const colors = {
    UE: "bg-blue-500/10 border-blue-500/25 text-blue-300",
    AR: "bg-sky-500/10 border-sky-500/25 text-sky-300",
    Global: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
    USA: "bg-red-500/10 border-red-400/25 text-red-300",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${colors[region]}`}>
      {label}
    </span>
  );
}

// ── Main Landing ───────────────────────────────────────────────────────────
export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#060d1a] text-slate-100 overflow-x-hidden">

      {/* ── Header ── */}
      <header className="border-b border-slate-800/80 bg-[#060d1a]/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/cu-logo.png" alt="Control Union" width={128} height={36}
              className="object-contain brightness-0 invert opacity-80" />
            <div className="w-px h-7 bg-slate-700/80" />
            <div className="flex items-center gap-2">
              <span className="text-[#3EB2ED] text-lg">◈</span>
              <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: "Georgia, serif" }}>Radar</span>
            </div>
          </div>
          <button
            onClick={() => setAuthOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3EB2ED]/10 border border-[#3EB2ED]/30 hover:bg-[#3EB2ED]/20 hover:border-[#3EB2ED]/60 text-[#3EB2ED] text-sm font-semibold transition-all duration-200"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(62,178,237,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 10% 80%, rgba(30,100,180,0.05) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(62,178,237,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center py-20">

          {/* Left: copy */}
          <div
            className="flex flex-col gap-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
          >
            <div className="flex flex-wrap gap-2">
              <Tag label="Sustentabilidad" />
              <Tag label="Certificaciones" />
              <Tag label="Comercio exterior" />
            </div>

            <div>
              <h1
                className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tighter text-white mb-5"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Inteligencia regulatoria{" "}
                <span
                  className="relative inline-block"
                  style={{
                    background: "linear-gradient(135deg, #3EB2ED 0%, #7dd3fc 50%, #3EB2ED 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  para el agro argentino
                </span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                Radar monitorea en tiempo real las normativas de sustentabilidad, certificaciones y requisitos de comercio exterior que impactan en la producción argentina. Todo en un solo lugar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setAuthOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #1a8fc7 0%, #3EB2ED 50%, #1a8fc7 100%)",
                  backgroundSize: "200% 200%",
                  boxShadow: "0 0 32px rgba(62,178,237,0.30), 0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <span>Acceder a Radar</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-800">
              {[
                { n: 40, suffix: "+", label: "fuentes monitoreadas" },
                { n: 5, suffix: " regiones", label: "de cobertura" },
                { n: 24, suffix: "hs", label: "actualización continua" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-2xl font-black text-white tracking-tight">
                    <Counter to={s.n} suffix={s.suffix} />
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: radar viz */}
          <div
            className="flex items-center justify-center w-full lg:h-[520px] h-[360px] transition-all duration-900"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px) scale(0.97)", transitionDelay: "150ms" }}
          >
            <RadarViz />
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[#3EB2ED] text-xs font-bold uppercase tracking-[0.2em] mb-3">Por qué Radar</p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Todo lo que necesitás, en un solo lugar
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Diseñado para equipos que exportan, certifican o asesoran en sustentabilidad y necesitan estar al día sin perder tiempo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon="📡"
            title="Monitoreo automático 24/7"
            body="Más de 40 fuentes oficiales actualizadas en tiempo real: Comisión Europea, SENASA, USDA, FAO, normas ISO, sistemas de certificación y más."
          />
          <FeatureCard
            icon="🏷️"
            title="Clasificación inteligente"
            body="Cada noticia es clasificada automáticamente por tema: EUDR, CBAM, CSRD, biocombustibles, orgánicos, textiles, deforestación y más."
          />
          <FeatureCard
            icon="🌍"
            title="Cobertura global con foco local"
            body="Seguimiento de regulaciones de la UE, EEUU, Argentina y organismos globales, siempre con el impacto en el contexto argentino en mente."
          />
          <FeatureCard
            icon="🔍"
            title="Filtrado avanzado"
            body="Filtrá por región, tema, fuente o período. Encontrá exactamente lo que necesitás sin tener que revisar decenas de sitios."
          />
          <FeatureCard
            icon="🌐"
            title="Traducción al instante"
            body="Noticias originalmente en inglés o portugués traducidas al español argentino con un clic, sin salir de la plataforma."
          />
          <FeatureCard
            icon="⭐"
            title="Guardado de favoritos"
            body="Marcá las noticias más relevantes para tu trabajo y accedé a ellas en cualquier momento desde tu panel personal."
          />
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* ── Sources strip ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-8">Fuentes que Radar monitorea</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            { label: "Comisión Europea", region: "UE" },
            { label: "SENASA", region: "AR" },
            { label: "USDA / FAS", region: "USA" },
            { label: "FAO", region: "Global" },
            { label: "FSC Internacional", region: "Global" },
            { label: "ISCC System", region: "Global" },
            { label: "Textile Exchange", region: "Global" },
            { label: "Cancillería AR", region: "AR" },
            { label: "Euractiv", region: "UE" },
            { label: "Bichos de Campo", region: "AR" },
            { label: "EPA", region: "USA" },
            { label: "Secretaría de Bioec.", region: "AR" },
          ].map((s) => (
            <SourceBadge key={s.label} label={s.label} region={s.region as "UE" | "AR" | "Global" | "USA"} />
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(62,178,237,0.07) 0%, transparent 65%)" }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#3EB2ED]/10 border border-[#3EB2ED]/25 rounded-full px-4 py-1.5 mb-8">
            <span className="text-[#3EB2ED] text-sm">◈</span>
            <span className="text-[#3EB2ED] text-xs font-bold uppercase tracking-widest">Acceso por invitación</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-5" style={{ fontFamily: "Georgia, serif" }}>
            Empezá a usar Radar hoy
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Iniciá sesión con tu cuenta de Control Union o registrate para acceder a todo el monitoreo regulatorio de Radar.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #1a8fc7 0%, #3EB2ED 50%, #1a8fc7 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 40px rgba(62,178,237,0.25), 0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            <span>Iniciar sesión</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Image src="/cu-logo.png" alt="Control Union" width={88} height={24}
              className="object-contain brightness-0 invert opacity-25" />
            <span>Radar — Control Union Argentina</span>
          </div>
          <span>Fuentes públicas oficiales · Sin datos propietarios</span>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
