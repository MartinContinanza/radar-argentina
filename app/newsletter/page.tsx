"use client";
import { useState } from "react";
import { Shell } from "../../components/Shell";

const MODULES = [
  {
    id: "textiles",
    title: "Textiles",
    image: "/newsletter/textiles.jpg",
    color: "border-purple-700/40 hover:border-purple-500/60",
    accent: "text-purple-400",
    accentBg: "bg-purple-400",
    description: "Estándares de fibras recicladas, trazabilidad en cadenas de moda, certificaciones GOTS, OCS y GRS.",
    issues: [
      { id: "t1", title: "Reporte de Sustentabilidad Textil 2024", date: "Feb 2025", tag: "Informe" },
      { id: "t2", title: "Novedades en certificación GOTS v7.0", date: "Ene 2025", tag: "Actualización" },
    ],
  },
  {
    id: "eudr",
    title: "EUDR",
    image: "/newsletter/eudr.jpg",
    color: "border-emerald-700/40 hover:border-emerald-500/60",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-400",
    description: "Reglamento europeo de deforestación: plazos, due diligence, sistemas de trazabilidad y su impacto en exportaciones argentinas.",
    issues: [
      { id: "e1", title: "Guía práctica EUDR para exportadores de soja", date: "Feb 2025", tag: "Guía" },
      { id: "e2", title: "Estado de implementación EUDR — Q1 2025", date: "Mar 2025", tag: "Reporte" },
    ],
  },
  {
    id: "agro",
    title: "Agro",
    image: "/newsletter/agro.jpg",
    color: "border-yellow-700/40 hover:border-yellow-600/60",
    accent: "text-yellow-400",
    accentBg: "bg-yellow-400",
    description: "Regulaciones fitosanitarias, acceso a mercados, SENASA, nuevos protocolos de exportación y trazabilidad agropecuaria.",
    issues: [
      { id: "a1", title: "Nuevos protocolos SENASA para fruta fresca a la UE", date: "Ene 2025", tag: "Actualización" },
    ],
  },
  {
    id: "organico",
    title: "Mercado Orgánico",
    image: "/newsletter/organico.jpg",
    color: "border-teal-700/40 hover:border-teal-500/60",
    accent: "text-teal-400",
    accentBg: "bg-teal-400",
    description: "Certificaciones orgánicas internacionales, equivalencias UE-Argentina, IFOAM, acreditaciones y acceso al mercado orgánico global.",
    issues: [
      { id: "o1", title: "Avances en equivalencia orgánica Argentina–UE", date: "Feb 2025", tag: "Informe" },
      { id: "o2", title: "Guía IFOAM para productores de la región", date: "Dic 2024", tag: "Guía" },
    ],
  },
];

function ModuleCard({ mod }: { mod: typeof MODULES[0] }) {
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className={`bg-slate-800/60 border ${mod.color} rounded-2xl overflow-hidden transition-all duration-200 flex flex-col`}>
      {/* Image */}
      <div className="relative w-full h-44 overflow-hidden bg-slate-700/80 shrink-0">
        <img
          src={mod.image}
          alt={mod.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-500"
          onError={e => {
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/40 to-transparent" />

        {/* Subscribe toggle — overlaid on image bottom-right */}
        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
          <button
            onClick={() => setSubscribed(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${subscribed ? "bg-[#3EB2ED]" : "bg-slate-600/80 backdrop-blur-sm"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${subscribed ? "translate-x-5" : ""}`} />
          </button>
          <span className={`text-[10px] font-semibold ${subscribed ? "text-[#3EB2ED]" : "text-slate-400"}`}>
            {subscribed ? "Suscripto" : "Suscribirme"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-display text-lg font-bold ${mod.accent}`}>{mod.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mod.issues.length} boletín{mod.issues.length !== 1 ? "es" : ""} disponible{mod.issues.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{mod.description}</p>
      </div>

      {/* Issues list toggle */}
      <div className="border-t border-slate-700/40">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span>Ver boletines</span>
          <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </button>
        {open && (
          <div className="px-5 pb-4 space-y-2">
            {mod.issues.map(issue => (
              <div key={issue.id} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2.5 gap-3">
                <div>
                  <p className="text-sm text-slate-200 font-medium leading-snug">{issue.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{issue.date}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${mod.accent} border-current opacity-60`}>
                  {issue.tag}
                </span>
              </div>
            ))}
            <p className="text-[11px] text-slate-600 pt-1 text-center">Próximos boletines se publicarán aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Newsletter() {
  return (
    <Shell>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-white mb-2">Newsletter</h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            Boletines informativos por temática. Activá el switch de cada módulo para suscribirte y recibir novedades cuando publiquemos nuevo contenido.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {MODULES.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
        </div>
      </div>
    </Shell>
  );
}
