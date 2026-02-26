"use client";
import { useState } from "react";
import { Shell } from "../../components/Shell";

export default function Acerca() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Visual-only: in production connect to Formspree, Resend, etc.
    setSent(true);
  }

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* About */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-4">Acerca de Radar</h2>
          <div className="space-y-4 text-slate-400 text-[15px] leading-relaxed">
            <p>
              <span className="text-[#3EB2ED] font-semibold">Radar</span> es una plataforma de inteligencia regulatoria desarrollada por{" "}
              <span className="text-slate-200 font-semibold">Control Union Argentina</span>, pensada para quienes trabajan en sectores productivos con exposición a mercados internacionales.
            </p>
            <p>
              El objetivo es simple: <span className="text-slate-200">agregar en un solo lugar las actualizaciones normativas, regulatorias y de certificación</span> que tienen o pueden tener impacto en Argentina, sin que tengas que seguir decenas de fuentes por tu cuenta.
            </p>
            <p>
              El foco está puesto en <span className="text-slate-200">sustentabilidad y certificaciones</span> — EUDR, CBAM, CSRD, ISCC, orgánicos, textiles, trazabilidad forestal, biocombustibles — con particular atención al agro, la industria y el comercio exterior argentino.
            </p>
            <p>
              Las noticias se actualizan automáticamente desde fuentes RSS públicas oficiales cada vez que abrís la página. No hay publicidad, ni datos de usuarios, ni contenido patrocinado.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "22+", label: "Fuentes monitoreadas" },
              { n: "0", label: "Costo para el usuario" },
              { n: "100%", label: "Fuentes públicas oficiales" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#3EB2ED]">{stat.n}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion form */}
        <div id="sugerencias" className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#3EB2ED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346A5.001 5.001 0 0112 17.5a5 5 0 01-2.829-.964l-.344-.346z" />
            </svg>
            <h3 className="font-display text-lg font-bold text-white">Sugerencias de mejora</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">¿Hay algo que mejorarías? ¿Una fuente que falta? ¿Un tema no cubierto? Contanos.</p>

          {sent ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">✓</p>
              <p className="font-semibold text-slate-200">¡Gracias por tu sugerencia!</p>
              <p className="text-sm text-slate-500 mt-1">La revisamos y la tenemos en cuenta.</p>
              <button onClick={() => { setSent(false); setForm({ nombre: "", email: "", mensaje: "" }); }}
                className="mt-4 text-xs text-[#3EB2ED] hover:underline">Enviar otra</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre"
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email (opcional)</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com"
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sugerencia</label>
                <textarea required value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Contanos qué mejorarías, qué fuente agregarías, o cualquier idea…" rows={4}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition resize-none" />
              </div>
              <button type="submit"
                className="px-6 py-2.5 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-lg transition-colors">
                Enviar sugerencia
              </button>
            </form>
          )}
        </div>
      </div>
    </Shell>
  );
}
