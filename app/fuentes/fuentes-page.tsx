"use client";
import { Shell } from "../../components/Shell";
import sourcesRaw from "../../data/sources.json";

const sources = sourcesRaw as { id: string; name: string; url: string; type: string; region: string; tags: string[]; priority: number }[];

const RC: Record<string, string> = {
  AR: "bg-sky-900/60 text-sky-300 border-sky-700",
  UE: "bg-blue-900/60 text-blue-300 border-blue-700",
  USA: "bg-red-900/60 text-red-300 border-red-700",
  Global: "bg-slate-700 text-slate-300 border-slate-600",
};

const byRegion = sources.reduce<Record<string, typeof sources>>((acc, s) => {
  (acc[s.region] = acc[s.region] || []).push(s); return acc;
}, {});

export default function Fuentes() {
  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="font-display text-2xl font-bold text-white mb-1">Fuentes</h2>
        <p className="text-slate-400 text-sm mb-8">
          Radar agrega noticias de {sources.length} fuentes RSS públicas. Todas se actualizan automáticamente cada vez que abrís la página.
        </p>

        {Object.entries(byRegion).sort().map(([region, srcs]) => (
          <div key={region} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded border ${RC[region] ?? RC.Global}`}>{region}</span>
              <span className="text-slate-600 text-xs">{srcs.length} fuente{srcs.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {srcs.map(s => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="group bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-[#3EB2ED]/50 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-[#3EB2ED] transition-colors">{s.name}</span>
                    <span className="text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 shrink-0">{s.type.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">{tag}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 truncate">{s.url}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
