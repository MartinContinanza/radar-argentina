"use client";

import { useEffect, useState, useMemo } from "react";
import { Shell } from "../components/Shell";
import { LandingPage } from "../components/LandingPage";
import { useAuth } from "../lib/auth-context";
import sourcesRaw from "../data/sources.json";
import { Source, NewsItem } from "../lib/types";

const sources: Source[] = sourcesRaw as Source[];
const PAGE_SIZE = 30;

const REGION_DEFAULTS: Record<string, string> = {
  UE: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1280px-Flag_of_Europe.svg.png",
  AR: "/default-ar.jpg",
  USA: "/default-usa.jpg",
  Global: "/default-global.jpg",
};
function getDefaultImage(item: NewsItem): string {
  return REGION_DEFAULTS[item.sourceRegion] ?? "/default-global.jpg";
}

async function translateText(text: string): Promise<string> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: `Traducí al español argentino este texto. Devolvé SOLO el texto traducido:\n\n${text}` }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? text;
  } catch { return text; }
}

const DEMO: NewsItem[] = [
  { id:"d1", title:"EUDR: la UE exige trazabilidad a exportadores de soja, cuero y madera", link:"https://environment.ec.europa.eu", publishedAt: new Date(Date.now()-1*86400000).toISOString(), sourceName:"Comisión Europea – Comercio", sourceRegion:"UE", tags:["EUDR","Deforestación","Regulaciones UE"], summary:"El Reglamento europeo sobre deforestación exige verificar que los productos no provienen de tierras deforestadas tras 2020." },
  { id:"d2", title:"SENASA habilita protocolo de exportación de arándanos a Europa", link:"https://www.argentina.gob.ar/senasa", publishedAt: new Date(Date.now()-2*86400000).toISOString(), sourceName:"SENASA Argentina", sourceRegion:"AR", tags:["Agricultura","Certificaciones","Comercio exterior","Argentina"], summary:"Nuevo protocolo fitosanitario para ingreso de frutas frescas argentinas al mercado europeo." },
  { id:"d3", title:"CBAM: el carbono en frontera y su impacto en fertilizantes argentinos", link:"https://taxation-customs.ec.europa.eu", publishedAt: new Date(Date.now()-3*86400000).toISOString(), sourceName:"Comisión Europea – Comercio", sourceRegion:"UE", tags:["CBAM","Huella de carbono","Comercio exterior"], summary:"Los importadores europeos deben reportar emisiones. El CBAM encarecerá productos sin huella de carbono certificada." },
  { id:"d4", title:"FSC actualiza cadena de custodia con requisitos digitales", link:"https://fsc.org", publishedAt: new Date(Date.now()-4*86400000).toISOString(), sourceName:"FSC Internacional", sourceRegion:"Global", tags:["Forestería","Certificaciones","EUDR"], summary:"FSC integró requisitos digitales de trazabilidad, alineándose con el EUDR." },
  { id:"d5", title:"ISCC actualiza criterios de sostenibilidad para biocombustibles de soja", link:"https://www.iscc-system.org", publishedAt: new Date(Date.now()-5*86400000).toISOString(), sourceName:"ISCC System", sourceRegion:"Global", tags:["Biocombustibles","Certificaciones","Sostenibilidad"], summary:"ISCC revisó criterios para biodiesel de soja incorporando indicadores de biodiversidad." },
  { id:"d6", title:"Deforestación en el Chaco: alertas satelitales muestran pérdidas récord", link:"https://www.globalforestwatch.org", publishedAt: new Date(Date.now()-6*86400000).toISOString(), sourceName:"Global Forest Watch – Blog", sourceRegion:"Global", tags:["Deforestación","EUDR","Forestería","Sostenibilidad"], summary:"Datos satelitales revelan que el Gran Chaco perdió más de 300.000 hectáreas en el último año." },
  { id:"d7", title:"CSRD: empresas europeas deberán auditar sus cadenas de valor en 2025", link:"https://www.edie.net", publishedAt: new Date(Date.now()-7*86400000).toISOString(), sourceName:"Edie – Sustainability", sourceRegion:"Global", tags:["CSRD","Regulaciones UE","Sostenibilidad"], summary:"La directiva CSRD impone nuevos estándares de reporte que alcanzan a proveedores argentinos de grandes firmas europeas." },
  { id:"d8", title:"Huella de carbono: Argentina avanza en metodologías de medición para el agro", link:"https://www.argentina.gob.ar", publishedAt: new Date(Date.now()-8*86400000).toISOString(), sourceName:"Secretaría Bioeconomía AR", sourceRegion:"AR", tags:["Huella de carbono","Agricultura","Sostenibilidad","Argentina"], summary:"El gobierno lanzó guías metodológicas para que productores rurales calculen y certifiquen su huella de carbono." },
  { id:"d9", title:"Textile Exchange: el algodón orgánico gana terreno en cadenas globales", link:"https://textileexchange.org", publishedAt: new Date(Date.now()-9*86400000).toISOString(), sourceName:"Textile Exchange", sourceRegion:"Global", tags:["Textiles","Orgánicos","Certificaciones","Sostenibilidad"], summary:"Crecimiento del 15% en adopción de estándares de algodón orgánico certificado." },
  { id:"d10", title:"Carbon Brief: las emisiones globales siguen creciendo pese a compromisos climáticos", link:"https://www.carbonbrief.org", publishedAt: new Date(Date.now()-10*86400000).toISOString(), sourceName:"Carbon Brief", sourceRegion:"Global", tags:["Huella de carbono","Sostenibilidad"], summary:"Las emisiones en 2024 superaron los niveles pre-pandemia, poniendo en riesgo los objetivos del Acuerdo de París." },
  { id:"d11", title:"Cancillería avanza en reconocimiento mutuo de certificaciones orgánicas con la UE", link:"https://www.cancilleria.gob.ar", publishedAt: new Date(Date.now()-11*86400000).toISOString(), sourceName:"Cancillería Argentina", sourceRegion:"AR", tags:["Orgánicos","Certificaciones","Comercio exterior","Argentina"], summary:"Acuerdo de equivalencia para que certificaciones orgánicas argentinas sean reconocidas en la UE." },
  { id:"d12", title:"Mongabay: incendios en la Amazonía amenazan compromisos EUDR de grandes traders", link:"https://news.mongabay.com", publishedAt: new Date(Date.now()-12*86400000).toISOString(), sourceName:"Mongabay", sourceRegion:"Global", tags:["Deforestación","EUDR","Forestería","Biodiversidad"], summary:"Los principales traders de soja y carne enfrentan reclamos de clientes europeos ante el avance del fuego en biomas protegidos." },
];

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

const TAG_COLORS: Record<string, string> = {
  "EUDR": "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  "CBAM": "bg-blue-900/60 text-blue-300 border-blue-700",
  "CSRD": "bg-violet-900/60 text-violet-300 border-violet-700",
  "Regulaciones UE": "bg-blue-900/40 text-blue-300 border-blue-800",
  "Sostenibilidad": "bg-teal-900/60 text-teal-300 border-teal-700",
  "Huella de carbono": "bg-orange-900/60 text-orange-300 border-orange-800",
  "Deforestación": "bg-red-900/60 text-red-300 border-red-800",
  "Biodiversidad": "bg-lime-900/60 text-lime-300 border-lime-700",
  "Bioeconomía": "bg-green-900/60 text-green-300 border-green-700",
  "Certificaciones": "bg-sky-900/60 text-sky-300 border-sky-700",
  "Orgánicos": "bg-green-900/50 text-green-300 border-green-800",
  "Forestería": "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  "Agricultura": "bg-yellow-900/60 text-yellow-300 border-yellow-800",
  "Textiles": "bg-pink-900/60 text-pink-300 border-pink-800",
  "Biocombustibles": "bg-amber-900/60 text-amber-300 border-amber-800",
  "Reciclado": "bg-cyan-900/60 text-cyan-300 border-cyan-800",
  "Comercio exterior": "bg-indigo-900/60 text-indigo-300 border-indigo-800",
  "Regulaciones comerciales": "bg-slate-700 text-slate-300 border-slate-600",
  "Argentina": "bg-sky-900/80 text-sky-200 border-sky-700",
};
function tagClass(tag: string) { return TAG_COLORS[tag] ?? "bg-slate-700 text-slate-300 border-slate-600"; }

const TAG_GROUPS = [
  { label: "Regulaciones",    tags: ["EUDR", "CBAM", "CSRD", "Regulaciones UE", "Regulaciones comerciales"] },
  { label: "Ambiente",        tags: ["Sostenibilidad", "Huella de carbono", "Deforestación", "Biodiversidad", "Bioeconomía"] },
  { label: "Certificaciones", tags: ["Certificaciones", "Orgánicos", "Forestería"] },
  { label: "Sectores",        tags: ["Agricultura", "Textiles", "Biocombustibles", "Reciclado"] },
  { label: "Comercio",        tags: ["Comercio exterior", "Argentina"] },
];

function TagPill({ tag }: { tag: string }) {
  return <span className={`inline-flex items-center font-semibold border rounded-md text-[10px] px-1.5 py-0.5 ${tagClass(tag)}`}>{tag}</span>;
}

function TagBtn({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${active ? tagClass(tag) + " ring-1 ring-white/20" : "bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300"}`}>
      {tag}
    </button>
  );
}

function Card({ item, onTranslate, translating, isFav, onToggleFav }: {
  item: NewsItem; onTranslate: (id: string) => void; translating: boolean; isFav: boolean; onToggleFav: (id: string) => void;
}) {
  const title = item.translatedTitle ?? item.title;
  const summary = item.translatedSummary ?? item.summary;
  const displayImage = item.image || getDefaultImage(item);
  return (
    <article className="group bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden hover:border-[#3EB2ED]/50 hover:bg-slate-800 transition-all duration-200 flex flex-col">
      <div className="relative w-full h-40 overflow-hidden bg-slate-700/80 shrink-0">
        <img src={displayImage} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/90 to-transparent" />
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-900/80 text-slate-300 border-slate-600">{item.sourceRegion}</span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#3EB2ED] uppercase tracking-wider truncate">{item.sourceName}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500">{fmtDate(item.publishedAt)}</span>
            <button onClick={() => onToggleFav(item.id)} className={`ml-1 transition-colors ${isFav ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}>{isFav ? "★" : "☆"}</button>
          </div>
        </div>
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-[15px] font-bold text-slate-100 leading-snug group-hover:text-[#3EB2ED] transition-colors line-clamp-2">
          {title}<span className="inline-block ml-1 opacity-0 group-hover:opacity-60 transition-opacity text-xs">↗</span>
        </a>
        {summary && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{summary}</p>}
        <div className="flex items-end justify-between mt-auto pt-2 gap-2">
          <div className="flex flex-wrap gap-1">{item.tags.slice(0, 4).map(tag => <TagPill key={tag} tag={tag} />)}</div>
          {!item.translatedTitle ? (
            <button onClick={() => onTranslate(item.id)} disabled={translating} className="text-[10px] text-slate-500 hover:text-[#3EB2ED] transition-colors shrink-0 disabled:opacity-40">
              {translating ? "traduciendo…" : "traducir →"}
            </button>
          ) : <span className="text-[10px] text-emerald-500 shrink-0">✓ ES</span>}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  if (authLoading) return (
    <div className="min-h-screen bg-[#060d1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-[#3EB2ED] text-3xl animate-pulse">◈</span>
        <div className="w-40 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-[#3EB2ED]/60 rounded-full" style={{ width: "40%", animation: "loadBar 1.4s ease-in-out infinite" }} />
        </div>
      </div>
      <style>{`@keyframes loadBar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
    </div>
  );
  if (!user) return <LandingPage />;
  return <NewsPage />;
}

function NewsPage() {
  const [allItems, setAllItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [translations, setTranslations] = useState<Record<string, { title: string; summary: string }>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavs, setShowFavs] = useState(false);
  const [search, setSearch] = useState("");
  const [selTags, setSelTags] = useState<string[]>([]);
  const [selSources, setSelSources] = useState<string[]>([]);
  const [last30, setLast30] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filterTab, setFilterTab] = useState<"temas" | "fuentes">("temas");
  const [page, setPage] = useState(1);

  // ── Fetch desde Supabase vía API route ──────────────────────────────────────
  useEffect(() => {
    fetch("/api/rss?limit=1000")
      .then(r => r.json())
      .then(json => {
        const items: NewsItem[] = (json.items ?? []).map((row: NewsItem) => ({
          ...row,
          tags: row.tags ?? [],
        }));
        if (items.length > 0) {
          setAllItems(items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
          setIsDemo(false);
        } else {
          setAllItems(DEMO);
          setIsDemo(true);
        }
      })
      .catch(() => {
        setAllItems(DEMO);
        setIsDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const itemsWithTranslations = useMemo(() =>
    allItems.map(it => ({ ...it, translatedTitle: translations[it.id]?.title, translatedSummary: translations[it.id]?.summary })),
    [allItems, translations]
  );

  const availableSources = useMemo(() => {
    const names = allItems.map(it => it.sourceName);
    return Array.from(new Set(names)).sort();
  }, [allItems]);

  const filtered = useMemo(() => {
    const cutoff = last30 ? new Date(Date.now() - 30 * 86400000).toISOString() : null;
    const sq = search.toLowerCase().trim();
    let base = showFavs ? itemsWithTranslations.filter(it => favorites.has(it.id)) : itemsWithTranslations;
    return base.filter(it => {
      if (sq && !it.title.toLowerCase().includes(sq) && !(it.summary ?? "").toLowerCase().includes(sq)) return false;
      if (selTags.length > 0 && !selTags.some(t => it.tags.includes(t))) return false;
      if (selSources.length > 0 && !selSources.includes(it.sourceName)) return false;
      if (cutoff && it.publishedAt < cutoff) return false;
      return true;
    });
  }, [itemsWithTranslations, search, selTags, selSources, last30, showFavs, favorites]);

  useEffect(() => { setPage(1); }, [search, selTags, selSources, last30, showFavs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleTranslate(id: string) {
    const item = allItems.find(i => i.id === id);
    if (!item || translatingIds.has(id)) return;
    setTranslatingIds(p => new Set(p).add(id));
    try {
      const [title, summary] = await Promise.all([translateText(item.title), item.summary ? translateText(item.summary) : Promise.resolve("")]);
      setTranslations(p => ({ ...p, [id]: { title, summary } }));
    } finally {
      setTranslatingIds(p => { const s = new Set(p); s.delete(id); return s; });
    }
  }

  function toggleFav(id: string) { setFavorites(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; }); }
  function toggleTag(tag: string) { setSelTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]); }
  function toggleSource(name: string) { setSelSources(p => p.includes(name) ? p.filter(s => s !== name) : [...p, name]); }

  const activeFilters = selTags.length + selSources.length + (search ? 1 : 0) + (last30 ? 1 : 0);

  const loadingStatus = (
    <div className="flex items-center gap-3 shrink-0">
      {loading
        ? <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin" />
            <span className="hidden sm:block">Cargando…</span>
          </div>
        : <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:block">{sources.length} fuentes · {allItems.length} noticias</span>
          </div>
      }
    </div>
  );

  return (
    <Shell loadingStatus={loadingStatus}>
      <div className="max-w-6xl mx-auto px-4 py-6">

        {isDemo && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400 flex gap-2">
            <span>⚠</span><span>Mostrando noticias de ejemplo. La base de datos no tiene noticias aún.</span>
          </div>
        )}

        {favorites.size > 0 && (
          <button onClick={() => setShowFavs(v => !v)}
            className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showFavs ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-400" : "border-slate-700 text-slate-400 hover:border-yellow-400/50 hover:text-yellow-400"}`}>
            <span>★</span>{showFavs ? "Ver todas las noticias" : `Ver favoritas (${favorites.size})`}
          </button>
        )}

        {/* Filters panel */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          <button onClick={() => setFiltersOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 10h12M9 16h6" /></svg>
              <span className="text-sm font-semibold text-slate-300">Filtros</span>
              {activeFilters > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#3EB2ED] text-white font-bold">{activeFilters}</span>}
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-xs hidden sm:block">{filtered.length} noticia{filtered.length !== 1 ? "s" : ""}{isDemo ? " (ejemplo)" : ` de ${allItems.length}`}</span>
              <span className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>

          <div className={`transition-all duration-300 overflow-hidden ${filtersOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 space-y-4">

              {/* Search + last30 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Buscar</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="EUDR, carbono, soja, certificación…" value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition" />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Período</label>
                  <button onClick={() => setLast30(v => !v)} className={`flex items-center gap-2 text-xs h-[38px] px-3 rounded-lg border transition-colors ${last30 ? "bg-[#3EB2ED]/10 border-[#3EB2ED]/50 text-[#3EB2ED]" : "border-slate-600 text-slate-500 hover:border-slate-500"}`}>
                    <div className={`relative w-8 h-4 rounded-full transition-colors ${last30 ? "bg-[#3EB2ED]" : "bg-slate-700"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${last30 ? "translate-x-4" : ""}`} />
                    </div>
                    <span className="whitespace-nowrap">Últ. 30 días</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div>
                <div className="flex gap-1 mb-3 border-b border-slate-700/60">
                  {(["temas", "fuentes"] as const).map(tab => (
                    <button key={tab} onClick={() => setFilterTab(tab)}
                      className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px ${filterTab === tab ? "text-[#3EB2ED] border-[#3EB2ED]" : "text-slate-500 border-transparent hover:text-slate-300"}`}>
                      {tab === "temas" ? `Temas${selTags.length ? ` (${selTags.length})` : ""}` : `Fuentes${selSources.length ? ` (${selSources.length})` : ""}`}
                    </button>
                  ))}
                </div>

                {filterTab === "temas" && (
                  <div className="space-y-3">
                    {TAG_GROUPS.map(group => (
                      <div key={group.label}>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.tags.map(tag => <TagBtn key={tag} tag={tag} active={selTags.includes(tag)} onClick={() => toggleTag(tag)} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filterTab === "fuentes" && (
                  <div className="flex flex-wrap gap-1.5">
                    {availableSources.map(name => (
                      <button key={name} onClick={() => toggleSource(name)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${selSources.includes(name) ? "bg-[#3EB2ED]/15 text-[#3EB2ED] border-[#3EB2ED]/50" : "bg-transparent text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300"}`}>
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeFilters > 0 && (
                <div className="flex justify-end">
                  <button onClick={() => { setSearch(""); setSelTags([]); setSelSources([]); setLast30(false); }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                    ✕ Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {(selTags.length > 0 || selSources.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selTags.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${tagClass(tag)}`}>
                {tag} <span className="opacity-60">✕</span>
              </button>
            ))}
            {selSources.map(src => (
              <button key={src} onClick={() => toggleSource(src)} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium bg-slate-700 text-slate-300 border-slate-600 hover:border-red-400 hover:text-red-400 transition-colors">
                {src} <span className="opacity-60">✕</span>
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        {pageItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {pageItems.map(item => (
                <Card key={item.id} item={item} onTranslate={handleTranslate} translating={translatingIds.has(item.id)} isFav={favorites.has(item.id)} onToggleFav={toggleFav} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:border-[#3EB2ED] hover:text-[#3EB2ED] disabled:opacity-30 transition-colors">← Anterior</button>
                {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=2).reduce<(number|"...")[]>((acc,p,i,arr)=>{if(i>0&&p-(arr[i-1] as number)>1)acc.push("...");acc.push(p);return acc;},[]).map((p,i)=>p==="..."?<span key={`e-${i}`} className="px-2 text-slate-600">…</span>:(
                  <button key={p} onClick={()=>setPage(p as number)} className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${page===p?"bg-[#3EB2ED] border-[#3EB2ED] text-white":"border-slate-700 text-slate-400 hover:border-[#3EB2ED] hover:text-[#3EB2ED]"}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:border-[#3EB2ED] hover:text-[#3EB2ED] disabled:opacity-30 transition-colors">Siguiente →</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-slate-600">
            <p className="text-5xl mb-4">◈</p>
            <p className="text-lg font-bold text-slate-400">{showFavs ? "No tenés favoritas aún" : "Sin resultados"}</p>
            <p className="text-sm mt-1">{showFavs ? "Marcá noticias con ★ para guardarlas acá." : "Probá con otros filtros."}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
