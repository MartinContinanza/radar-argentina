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
        className="w-full h-full max-w-[440px] max-h-[440px]"
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
        <circle cx="240" cy="240" r="240" fill="url(#bgGrad)" />
        {[55, 110, 165, 220].map((r) => (
          <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="rgba(62,178,237,0.10)" strokeWidth="1" />
        ))}
        <line x1="240" y1="20" x2="240" y2="460" stroke="rgba(62,178,237,0.08)" strokeWidth="1" />
        <line x1="20" y1="240" x2="460" y2="240" stroke="rgba(62,178,237,0.08)" strokeWidth="1" />
        <line x1="84" y1="84" x2="396" y2="396" stroke="rgba(62,178,237,0.05)" strokeWidth="1" />
        <line x1="396" y1="84" x2="84" y2="396" stroke="rgba(62,178,237,0.05)" strokeWidth="1" />
        <g clipPath="url(#radarClip)">
          <g style={{ transformOrigin: "240px 240px", animation: "radarSweep 4s linear infinite" }}>
            <path d="M240,240 L240,20 A220,220 0 0,1 460,240 Z" fill="url(#sweepGrad)" opacity="0.85" />
          </g>
        </g>
        <circle cx="240" cy="240" r="5" fill="#3EB2ED" opacity="0.9" />
        <circle cx="240" cy="240" r="10" fill="none" stroke="#3EB2ED" strokeWidth="1.5" opacity="0.4" />
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
            <circle cx={b.cx} cy={b.cy} r={b.r + 2} fill="none" stroke="#3EB2ED" strokeWidth="1" opacity="0.4"
              style={{ animation: `blipPulse 2.4s ease-out ${b.delay} infinite` }} />
          </g>
        ))}
        <circle cx="240" cy="240" r="220" fill="none" stroke="rgba(62,178,237,0.20)" strokeWidth="1.5" />
      </svg>
      <style>{`
        @keyframes radarSweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blipPulse { 0% { opacity: 0.6; } 60% { opacity: 0; } 100% { opacity: 0; } }
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

// ── Benefit item ───────────────────────────────────────────────────────────
function BenefitItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3 group">
      <div className="mt-0.5 w-5 h-5 rounded-full border border-[#3EB2ED]/40 bg-[#3EB2ED]/10 flex items-center justify-center shrink-0 group-hover:bg-[#3EB2ED]/20 transition-colors">
        <svg className="w-2.5 h-2.5 text-[#3EB2ED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
        <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ── Laptop mockup with screenshot ─────────────────────────────────────────
function LaptopMockup() {
  return (
    <div className="relative w-full flex items-center justify-center select-none">
      {/* Glow behind laptop */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(62,178,237,0.10) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-[560px]">
        {/* ── Screen body ── */}
        <div
          className="relative rounded-t-xl overflow-hidden border border-slate-600/60"
          style={{
            background: "linear-gradient(160deg, #1e2d42 0%, #0f1a2e 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.5)",
            paddingTop: "3px",
          }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#111d2e] border-b border-slate-700/50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-3 bg-slate-800/80 rounded px-2 py-0.5 text-[10px] text-slate-500 text-center">
              radar.controlunion.com
            </div>
          </div>

          {/* Screenshot — use the uploaded image via public path */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img
              src="/screenshot-radar.png"
              alt="Radar — pantalla principal"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector(".fallback-ui")) {
                  const div = document.createElement("div");
                  div.className = "fallback-ui w-full h-full bg-slate-900 p-2";
                  div.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px";
                  const cards = [
                    { tag: "EUDR", region: "Global", title: "EUDR: la UE exige trazabilidad a exportadores de soja" },
                    { tag: "CBAM", region: "UE", title: "CBAM: el carbono en frontera y fertilizantes argentinos" },
                    { tag: "CSRD", region: "UE", title: "CSRD: directiva europea alcanza a proveedores locales" },
                    { tag: "orgánico", region: "AR", title: "Cancillería avanza en certificaciones orgánicas con UE" },
                    { tag: "biofuels", region: "Global", title: "ISCC actualiza criterios para biocombustibles de soja" },
                    { tag: "textiles", region: "USA", title: "Textiles sustentables: nuevas normas de la EPA" },
                  ];
                  div.innerHTML = cards.map(c => `
                    <div style="background:#1e293b;border:1px solid #334155;border-radius:6px;overflow:hidden">
                      <div style="height:38px;background:linear-gradient(135deg,#0c2236,#163352)"></div>
                      <div style="padding:6px 7px">
                        <div style="font-size:7px;color:#3EB2ED;font-weight:700;text-transform:uppercase;margin-bottom:3px">${c.region}</div>
                        <div style="font-size:8px;color:#e2e8f0;font-weight:600;line-height:1.3;margin-bottom:4px">${c.title}</div>
                        <span style="font-size:7px;color:#3EB2ED;background:rgba(62,178,237,0.1);border:1px solid rgba(62,178,237,0.2);border-radius:3px;padding:1px 4px">${c.tag}</span>
                      </div>
                    </div>
                  `).join("");
                  parent.appendChild(div);
                }
              }}
            />
          </div>
        </div>

        {/* ── Hinge ── */}
        <div className="relative h-3 mx-[-2%]"
          style={{ background: "linear-gradient(180deg, #1a2a3e 0%, #0d1520 100%)", borderLeft: "1px solid #334155", borderRight: "1px solid #334155" }}>
          <div className="absolute inset-x-0 top-0 h-px bg-slate-600/40" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0.5 w-12 h-1.5 rounded-full bg-slate-700/60" />
        </div>

        {/* ── Base ── */}
        <div className="relative h-4 rounded-b-xl mx-[-4%]"
          style={{ background: "linear-gradient(180deg, #0d1520 0%, #081018 100%)", border: "1px solid #1e2d3d", borderTop: "none" }}>
          <div className="absolute inset-x-0 bottom-0 h-px bg-slate-800/80" />
        </div>

        {/* Shadow under base */}
        <div className="h-2 mx-[4%] rounded-b-full"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)", filter: "blur(6px)" }} />
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

      {/* ── Header oculto — solo para SEO/accesibilidad ── */}
      <header className="hidden" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/cu-logo.png" alt="Control Union" width={128} height={36}
              className="object-contain brightness-0 invert opacity-80" />
          </div>
        </div>
      </header>

      {/* ── Hero — fills exactly the remaining viewport after header ── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 57px)" }}
      >
        {/* Background */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(62,178,237,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 10% 80%, rgba(30,100,180,0.05) 0%, transparent 60%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(62,178,237,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center py-10">

          {/* Left: copy */}
          <div
            className="flex flex-col gap-5 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
          >
            {/* Control Union branding */}
            <div className="flex items-center gap-3">
              <Image src="/cu-logo.png" alt="Control Union" width={140} height={38}
                className="object-contain brightness-0 invert opacity-90" />
              <div className="w-px h-6 bg-slate-700" />
              <span className="text-slate-400 text-xs font-medium">Una herramienta de</span>
            </div>

            {/* Tags — close to the content, no extra top spacing */}
            <div className="flex flex-wrap gap-2">
              <Tag label="Sustentabilidad" />
              <Tag label="Certificaciones" />
              <Tag label="Comercio exterior" />
            </div>

            <div>
              <h1
                className="text-4xl lg:text-[2.7rem] font-black leading-[1.08] tracking-tighter text-white mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Las noticias que{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #3EB2ED 0%, #7dd3fc 50%, #3EB2ED 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  mueven tu negocio
                </span>
                <br />
                antes que las vea todo el mundo.
              </h1>
              <p className="text-slate-300 text-base leading-relaxed max-w-lg">
                Radar monitorea en tiempo real normativas de sustentabilidad, certificaciones y comercio exterior con impacto en la producción argentina. Todo en un solo lugar, siempre actualizado.
              </p>
            </div>

            <div>
              <button
                onClick={() => setAuthOpen(true)}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
            className="flex items-center justify-center w-full lg:h-[440px] h-[280px] transition-all duration-900"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px) scale(0.97)", transitionDelay: "150ms" }}
          >
            <RadarViz />
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* ── Benefits + Laptop ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: benefits list */}
          <div>
            <p className="text-[#3EB2ED] text-xs font-bold uppercase tracking-[0.2em] mb-3">Por qué Radar</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Todo lo que necesitás,<br />en un solo lugar
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
              Diseñado para equipos que exportan, certifican o asesoran en sustentabilidad y necesitan estar al día sin perder tiempo.
            </p>

            <div className="flex flex-col gap-5">
              <BenefitItem
                title="Monitoreo automático 24/7"
                body="Más de 40 fuentes oficiales: Comisión Europea, SENASA, USDA, FAO y más."
              />
              <BenefitItem
                title="Clasificación inteligente por tema"
                body="Cada noticia etiquetada: EUDR, CBAM, CSRD, biocombustibles, orgánicos y más."
              />
              <BenefitItem
                title="Cobertura global con foco local"
                body="UE, EEUU, Argentina y organismos globales, en clave de impacto para el agro argentino."
              />
              <BenefitItem
                title="Traducción al instante"
                body="Noticias en inglés o portugués traducidas al español argentino con un clic."
              />
            </div>
          </div>

          {/* Right: laptop mockup */}
          <div
            className="transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transitionDelay: "200ms" }}
          >
            <LaptopMockup />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* ── Herramientas extra: Autoevaluación + Escalá ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-center text-[#3EB2ED] text-xs font-bold uppercase tracking-[0.2em] mb-3">Más que noticias</p>
        <h2 className="text-center text-2xl lg:text-3xl font-black tracking-tighter text-white mb-10" style={{ fontFamily: "Georgia, serif" }}>
          Conocé tu posición regulatoria
        </h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Autoevaluación */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-7 hover:border-[#3EB2ED]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#3EB2ED]/10 border border-[#3EB2ED]/25 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#3EB2ED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Auto-evaluación de cumplimiento</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Respondé un cuestionario guiado y obtené un diagnóstico de tu posición frente a las principales normativas vigentes.</p>
          </div>
          {/* Escalá */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-7 hover:border-[#3EB2ED]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#3EB2ED]/10 border border-[#3EB2ED]/25 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#3EB2ED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Escala de madurez regulatoria</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Visualizá en qué nivel está tu organización y qué pasos concretos necesitás para avanzar hacia el cumplimiento pleno.</p>
          </div>
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
