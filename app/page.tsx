"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Shell } from "../components/Shell";
import sourcesRaw from "../data/sources.json";
import { Source, NewsItem, FetchResult } from "../lib/types";
import { detectTags, ALL_TAGS } from "../lib/tagging";

const sources: Source[] = sourcesRaw as Source[];
const PAGE_SIZE = 30;

// ─── Default images by region/source ─────────────────────────────────────────
const SOURCE_DEFAULTS: Record<string, string> = {
  "European Commission – Trade": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1280px-Flag_of_Europe.svg.png",
  "European Commission – Environment": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1280px-Flag_of_Europe.svg.png",
  "Euractiv – Ambiente": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1280px-Flag_of_Europe.svg.png",
};

const REGION_DEFAULTS: Record<string, string> = {
  UE: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1280px-Flag_of_Europe.svg.png",
  AR: "/default-ar.jpg",
  USA: "/default-usa.jpg",
  Global: "/default-global.jpg",
};

function getDefaultImage(item: NewsItem): string {
  if (SOURCE_DEFAULTS[item.sourceName]) return SOURCE_DEFAULTS[item.sourceName];
  if (REGION_DEFAULTS[item.sourceRegion]) return REGION_DEFAULTS[item.sourceRegion];
  return "/default-global.jpg";
}

// ─── Translation ──────────────────────────────────────────────────────────────
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

// ─── Dollar filter ────────────────────────────────────────────────────────────
const DOLLAR_KW = ["dólar","dolar","dollar","tipo de cambio","cotización del","devaluación","brecha cambiaria","cepo cambiario","reservas bcra","banco central compró","banco central vendió","inflación mensual","indec inflación"];
function isDollar(t: string, s: string) { const tx = (t + " " + s).toLowerCase(); return DOLLAR_KW.some(k => tx.includes(k)); }

// ─── Demo items ───────────────────────────────────────────────────────────────
const DEMO: NewsItem[] = [
  { id:"d1", title:"EUDR: la UE exige trazabilidad a exportadores de soja, cuero y madera", link:"https://environment.ec.europa.eu", publishedAt: new Date(Date.now()-1*86400000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["EUDR","deforestation","due diligence"], summary:"El Reglamento europeo sobre deforestación exige verificar que los productos no provienen de tierras deforestadas tras 2020.", image:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" },
  { id:"d2", title:"SENASA habilita protocolo de exportación de arándanos a Europa", link:"https://www.argentina.gob.ar/senasa", publishedAt: new Date(Date.now()-2*86400000).toISOString(), sourceName:"SENASA Argentina", sourceRegion:"AR", tags:["agriculture","certification","exports/imports"], summary:"Nuevo protocolo fitosanitario para ingreso de frutas frescas argentinas al mercado europeo.", image:"https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=400&q=80" },
  { id:"d3", title:"CBAM: el carbono en frontera y su impacto en fertilizantes argentinos", link:"https://taxation-customs.ec.europa.eu", publishedAt: new Date(Date.now()-3*86400000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["CBAM","sustainability","exports/imports"], summary:"Los importadores europeos de fertilizantes deben reportar emisiones. El CBAM encarecerá productos sin huella de carbono certificada.", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { id:"d4", title:"FSC actualiza cadena de custodia con requisitos digitales", link:"https://fsc.org", publishedAt: new Date(Date.now()-4*86400000).toISOString(), sourceName:"FSC Internacional", sourceRegion:"Global", tags:["forestry","certification","EUDR"], summary:"Forest Stewardship Council integró requisitos digitales de trazabilidad, alineándose con el EUDR.", image:"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80" },
  { id:"d5", title:"ISCC actualiza criterios de sostenibilidad para biocombustibles de soja", link:"https://www.iscc-system.org", publishedAt: new Date(Date.now()-5*86400000).toISOString(), sourceName:"ISCC System", sourceRegion:"Global", tags:["biofuels/ISCC","certification","sustainability"], summary:"El sistema ISCC revisó criterios para biodiesel de soja incorporando indicadores de biodiversidad.", image:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80" },
  { id:"d6", title:"Textiles sustentables: nuevas normas globales que impactan en el algodón argentino", link:"https://www.epa.gov", publishedAt: new Date(Date.now()-6*86400000).toISOString(), sourceName:"EPA", sourceRegion:"USA", tags:["textiles","recycled","sustainability"], summary:"La EPA creó un sello para textiles con mínimo 30% de contenido reciclado.", image:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80" },
  { id:"d7", title:"CSRD: la directiva europea de sostenibilidad alcanza a proveedores argentinos", link:"https://finance.ec.europa.eu", publishedAt: new Date(Date.now()-7*86400000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["CSRD","sustainability","due diligence"], summary:"La CSRD obliga a empresas europeas a reportar el impacto ambiental de toda su cadena de valor.", image:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
  { id:"d8", title:"Biocombustibles: Argentina busca posicionarse en el mercado europeo de renovables", link:"https://www.fas.usda.gov", publishedAt: new Date(Date.now()-9*86400000).toISOString(), sourceName:"USDA / FAS", sourceRegion:"USA", tags:["biofuels/ISCC","agriculture","sustainability"], summary:"Argentina tiene potencial para ser proveedor clave de biocombustibles para Europa bajo estándar RED III.", image:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80" },
  { id:"d9", title:"FAO: deforestación en Sudamérica amenaza estándares de exportación", link:"https://www.fao.org", publishedAt: new Date(Date.now()-11*86400000).toISOString(), sourceName:"FAO", sourceRegion:"Global", tags:["deforestation","agriculture","forestry","EUDR"], summary:"La FAO advierte que el ritmo de deforestación en América del Sur compromete el cumplimiento del EUDR.", image:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
  { id:"d10", title:"Cancillería avanza en reconocimiento mutuo de certificaciones orgánicas con la UE", link:"https://www.cancilleria.gob.ar", publishedAt: new Date(Date.now()-13*86400000).toISOString(), sourceName:"Cancillería Argentina", sourceRegion:"AR", tags:["organic","certification","exports/imports"], summary:"Acuerdo de equivalencia para que certificaciones orgánicas argentinas sean reconocidas en la UE.", image:"https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80" },
  { id:"d11", title:"Bichos de Campo: certificaciones orgánicas, el desafío del productor para exportar", link:"https://bichosdecampo.com", publishedAt: new Date(Date.now()-15*86400000).toISOString(), sourceName:"Bichos de Campo", sourceRegion:"AR", tags:["organic","agriculture","certification"], summary:"Los productores que buscan mercados premium en Europa enfrentan certificaciones que triplican el costo operativo.", image:"https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80" },
  { id:"d12", title:"Textile Exchange: el algodón orgánico gana terreno en cadenas globales de moda", link:"https://textileexchange.org", publishedAt: new Date(Date.now()-16*86400000).toISOString(), sourceName:"Textile Exchange", sourceRegion:"Global", tags:["textiles","organic","certification","sustainability"], summary:"El informe anual de Textile Exchange muestra un crecimiento del 15% en adopción de estándares de algodón orgánico certificado.", image:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80" },
];

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchSource(source: Source): Promise<FetchResult> {
  try {
    const res = await fetch(`/api/rss?url=${encodeURIComponent(source.url)}`);
    const json = await res.json();
    if (json.error && !json.items?.length) return { sourceId: source.id, sourceName: source.name, items: [], error: json.error };
    const now = new Date().toISOString();
    const items: NewsItem[] = (json.items ?? [])
      .filter((r: { title: string; summary: string }) => !isDollar(r.title, r.summary))
      .map((r: { title: string; link: string; pubDate: string | null; summary: string; image?: string }, i: number) => ({
        id: `${source.id}-${i}-${r.link}`,
        title: r.title, link: r.link,
        publishedAt: r.pubDate ? new Date(r.pubDate).toISOString() : now,
        sourceName: source.name, sourceRegion: source.region,
        tags: Array.from(new Set([...source.tags, ...detectTags(`${r.title} ${r.summary}`)])),
        summary: r.summary, image: r.image,
      }));
    return { sourceId: source.id, sourceName: source.name, items };
  } catch (e) {
    return { sourceId: source.id, sourceName: source.name, items: [], error: String(e) };
  }
}

async function fetchAll(srcs: Source[], concurrency: number, onResult: (r: FetchResult) => void) {
  let i = 0;
  const worker = async () => { while (i < srcs.length) { onResult(await fetchSource(srcs[i++])); } };
  await Promise.all(Array.from({ length: Math.min(concurrency, srcs.length) }, worker));
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

const REGIONS = Array.from(new Set(sources.map(s => s.region))).sort();
const RC: Record<string, string> = {
  AR: "bg-sky-900/60 text-sky-300 border-sky-700",
  UE: "bg-blue-900/60 text-blue-300 border-blue-700",
  USA: "bg-red-900/60 text-red-300 border-red-700",
  Global: "bg-slate-700 text-slate-300 border-slate-600",
};

function TagBtn({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${active ? "bg-[#3EB2ED] text-white border-[#3EB2ED]" : "bg-transparent text-slate-400 border-slate-700 hover:border-[#3EB2ED] hover:text-[#3EB2ED]"}`}>
      {tag}
    </button>
  );
}

function Card({ item, lang, onTranslate, translating, isFav, onToggleFav }: {
  item: NewsItem; lang: "es" | "en"; onTranslate: (id: string) => void;
  translating: boolean; isFav: boolean; onToggleFav: (id: string) => void;
}) {
  const rc = RC[item.sourceRegion] ?? RC.Global;
  const title = lang === "es" && item.translatedTitle ? item.translatedTitle : item.title;
  const summary = lang === "es" && item.translatedSummary ? item.translatedSummary : item.summary;

  // Always show an image: use item's image, or fall back to a default
  const displayImage = item.image || getDefaultImage(item);
  const isDefaultImg = !item.image;

  return (
    <article className="group bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden hover:border-[#3EB2ED]/50 hover:bg-slate-800 transition-all duration-200 flex flex-col">
      <div className="relative w-full h-40 overflow-hidden bg-slate-700/80 shrink-0">
        <img
          src={displayImage}
          alt=""
          className={`w-full h-full object-cover transition-all duration-500 ${
            isDefaultImg
              ? "opacity-30 group-hover:opacity-40 scale-105"
              : "opacity-80 group-hover:opacity-100 group-hover:scale-105"
          }`}
          onError={e => {
            // If even the default fails, show a plain slate background
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent" />
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded border ${rc}`}>{item.sourceRegion}</span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#3EB2ED] uppercase tracking-wider truncate">{item.sourceName}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500">{fmtDate(item.publishedAt)}</span>
            {/* Favorite star */}
            <button onClick={() => onToggleFav(item.id)}
              className={`ml-1 transition-colors ${isFav ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}
              title={isFav ? "Quitar de favoritas" : "Marcar como favorita"}>
              {isFav ? "★" : "☆"}
            </button>
          </div>
        </div>
        <a href={item.link} target="_blank" rel="noopener noreferrer"
          className="block text-[15px] font-bold text-slate-100 leading-snug group-hover:text-[#3EB2ED] transition-colors line-clamp-2">
          {title}<span className="inline-block ml-1 opacity-0 group-hover:opacity-60 transition-opacity text-xs">↗</span>
        </a>
        {summary && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{summary}</p>}
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">{tag}</span>
            ))}
          </div>
          {lang === "es" && !item.translatedTitle && (
            <button onClick={() => onTranslate(item.id)} disabled={translating}
              className="text-[10px] text-slate-500 hover:text-[#3EB2ED] transition-colors shrink-0 disabled:opacity-40">
              {translating ? "traduciendo…" : "traducir →"}
            </button>
          )}
          {item.translatedTitle && lang === "es" && <span className="text-[10px] text-emerald-500 shrink-0">✓ ES</span>}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [realCount, setRealCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [translations, setTranslations] = useState<Record<string, { title: string; summary: string }>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavs, setShowFavs] = useState(false);
  const [search, setSearch] = useState("");
  const [selTags, setSelTags] = useState<string[]>([]);
  const [selRegion, setSelRegion] = useState("");
  const [last30, setLast30] = useState(false);
  const [page, setPage] = useState(1);

  const onResult = useCallback((r: FetchResult) => {
    setResults(p => [...p, r]);
    setLoadedCount(c => c + 1);
    setRealCount(c => c + r.items.length);
  }, []);

  useEffect(() => { fetchAll(sources, 3, onResult).then(() => setLoading(false)); }, [onResult]);

  const allItems = useMemo(() => {
    const real: NewsItem[] = []; const seen = new Set<string>();
    for (const r of results) for (const it of r.items) {
      const k = it.link || it.id;
      if (!seen.has(k)) { seen.add(k); real.push(it); }
    }
    return (real.length > 0 ? real : DEMO)
      .filter(it => !isDollar(it.title, it.summary))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map(it => ({ ...it, translatedTitle: translations[it.id]?.title, translatedSummary: translations[it.id]?.summary }));
  }, [results, translations]);

  const filtered = useMemo(() => {
    const cutoff = last30 ? new Date(Date.now() - 30 * 86400000).toISOString() : null;
    const sq = search.toLowerCase();
    let base = showFavs ? allItems.filter(it => favorites.has(it.id)) : allItems;
    return base.filter(it => {
      if (sq && !it.title.toLowerCase().includes(sq) && !it.summary.toLowerCase().includes(sq)) return false;
      if (selTags.length > 0 && !selTags.some(t => it.tags.includes(t))) return false;
      if (selRegion && it.sourceRegion !== selRegion) return false;
      if (cutoff && it.publishedAt < cutoff) return false;
      return true;
    });
  }, [allItems, search, selTags, selRegion, last30, showFavs, favorites]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, selTags, selRegion, last30, showFavs]);

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

  function toggleFav(id: string) {
    setFavorites(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const isDemo = realCount === 0;
  const failed = results.filter(r => r.error);
  const activeFilters = selTags.length + (selRegion ? 1 : 0) + (search ? 1 : 0) + (last30 ? 1 : 0);

  const loadingStatus = (
    <div className="flex items-center gap-3 shrink-0">
      <button onClick={() => setLang(l => l === "es" ? "en" : "es")}
        className="flex items-center gap-1.5 text-xs font-bold border border-slate-700 rounded-lg px-3 py-1.5 hover:border-[#3EB2ED] transition-colors">
        <span className={lang === "es" ? "text-[#3EB2ED]" : "text-slate-500"}>ES</span>
        <span className="text-slate-600">/</span>
        <span className={lang === "en" ? "text-[#3EB2ED]" : "text-slate-500"}>EN</span>
      </button>
      {loading
        ? <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin" />
            <span className="hidden sm:block">{loadedCount}/{sources.length}</span>
          </div>
        : <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:block">{sources.length} fuentes</span>
          </div>
      }
    </div>
  );

  return (
    <Shell loadingStatus={loadingStatus}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isDemo && !loading && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400 flex gap-2">
            <span>⚠</span><span>Mostrando noticias de ejemplo. Las fuentes RSS no respondieron aún.</span>
          </div>
        )}

        {/* Favorites toggle */}
        {favorites.size > 0 && (
          <button onClick={() => setShowFavs(v => !v)}
            className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showFavs ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-400" : "border-slate-700 text-slate-400 hover:border-yellow-400/50 hover:text-yellow-400"}`}>
            <span>★</span>
            {showFavs ? `Ver todas las noticias` : `Ver favoritas (${favorites.size})`}
          </button>
        )}

        {/* Filters */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          <button onClick={() => setFiltersOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-300">Filtros</span>
              {activeFilters > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#3EB2ED] text-white font-bold">{activeFilters}</span>}
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-xs hidden sm:block">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}{isDemo ? " (ejemplo)" : ` de ${allItems.length}`}</span>
              <span className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>
          <div className={`transition-all duration-300 overflow-hidden ${filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Buscar</label>
                  <input type="text" placeholder="EUDR, textiles, biocombustibles…" value={search} onChange={e => { setSearch(e.target.value); }}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Región</label>
                  <select value={selRegion} onChange={e => setSelRegion(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#3EB2ED] transition">
                    <option value="">Todas</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Temas</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => <TagBtn key={tag} tag={tag} active={selTags.includes(tag)} onClick={() => setSelTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])} />)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => setLast30(v => !v)} className={`flex items-center gap-2 text-sm transition-colors ${last30 ? "text-[#3EB2ED]" : "text-slate-500 hover:text-slate-300"}`}>
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${last30 ? "bg-[#3EB2ED]" : "bg-slate-700"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${last30 ? "translate-x-4" : ""}`} />
                  </div>
                  Últimos 30 días
                </button>
                {activeFilters > 0 && (
                  <button onClick={() => { setSearch(""); setSelTags([]); setSelRegion(""); setLast30(false); }} className="text-xs text-slate-500 hover:text-red-400 transition-colors">✕ Limpiar filtros</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        {pageItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {pageItems.map((item) => (
                <Card key={item.id} item={item} lang={lang}
                  onTranslate={handleTranslate} translating={translatingIds.has(item.id)}
                  isFav={favorites.has(item.id)} onToggleFav={toggleFav} />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:border-[#3EB2ED] hover:text-[#3EB2ED] disabled:opacity-30 transition-colors">
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) => p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-600">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p as number)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${page === p ? "bg-[#3EB2ED] border-[#3EB2ED] text-white" : "border-slate-700 text-slate-400 hover:border-[#3EB2ED] hover:text-[#3EB2ED]"}`}>
                      {p}
                    </button>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:border-[#3EB2ED] hover:text-[#3EB2ED] disabled:opacity-30 transition-colors">
                  Siguiente →
                </button>
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

        {/* Failed sources */}
        {failed.length > 0 && !loading && (
          <div className="mt-12 border-t border-slate-800 pt-6">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest mb-2">Fuentes que no respondieron</p>
            <div className="flex flex-wrap gap-2">
              {failed.map(s => <span key={s.sourceId} className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-500">{s.sourceName}</span>)}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
