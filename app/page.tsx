"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import sourcesRaw from "../data/sources.json";
import { Source, NewsItem, FetchResult } from "../lib/types";
import { detectTags, ALL_TAGS } from "../lib/tagging";

const sources: Source[] = sourcesRaw as Source[];

// ─── Translation via Claude API ───────────────────────────────────────────────
async function translateText(text: string): Promise<string> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: `Traducí al español argentino este texto de noticias. Devolvé SOLO el texto traducido, sin explicaciones:\n\n${text}` }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text ?? text;
  } catch { return text; }
}

// ─── Dollar/forex filter ──────────────────────────────────────────────────────
const DOLLAR_KEYWORDS = [
  "dólar","dolar","dollar","tipo de cambio","cotización del","devaluación",
  "brecha cambiaria","cepo cambiario","reservas bcra","banco central compró",
  "banco central vendió","inflación mensual","indec inflación"
];
function isDollarNews(title: string, summary: string): boolean {
  const text = (title + " " + summary).toLowerCase();
  return DOLLAR_KEYWORDS.some(kw => text.includes(kw));
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ITEMS: NewsItem[] = [
  { id:"d1", title:"EUDR: la UE exige trazabilidad a exportadores de soja, cuero y madera", link:"https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en", publishedAt: new Date(Date.now()-1*24*60*60*1000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["EUDR","deforestation","due diligence","exports/imports"], summary:"El Reglamento europeo sobre deforestación exige verificar que los productos no provienen de tierras deforestadas tras 2020. Argentina deberá adaptar su trazabilidad o enfrentar cierre de mercados.", image:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" },
  { id:"d2", title:"SENASA habilita protocolo de exportación de arándanos y limones a Europa", link:"https://www.argentina.gob.ar/senasa", publishedAt: new Date(Date.now()-2*24*60*60*1000).toISOString(), sourceName:"SENASA Argentina", sourceRegion:"AR", tags:["agriculture","certification","exports/imports"], summary:"Nuevo protocolo fitosanitario que facilita el ingreso de frutas frescas argentinas al mercado europeo bajo los estándares vigentes de la UE.", image:"https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=400&q=80" },
  { id:"d3", title:"CBAM: el carbono en frontera y su impacto en fertilizantes y acero argentino", link:"https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en", publishedAt: new Date(Date.now()-3*24*60*60*1000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["CBAM","sustainability","exports/imports"], summary:"Los importadores europeos de acero, aluminio y fertilizantes deben reportar emisiones. Argentina exporta estos productos a la UE — el CBAM encarecerá los que no tengan huella de carbono certificada.", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { id:"d4", title:"FSC actualiza cadena de custodia con requisitos digitales para exportadores forestales", link:"https://fsc.org", publishedAt: new Date(Date.now()-4*24*60*60*1000).toISOString(), sourceName:"FSC Internacional", sourceRegion:"Global", tags:["forestry","certification","EUDR"], summary:"Forest Stewardship Council integró requisitos digitales de trazabilidad, alineándose con el EUDR y facilitando la verificación de origen para exportadores latinoamericanos.", image:"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80" },
  { id:"d5", title:"ISCC actualiza criterios de sostenibilidad para biocombustibles de soja", link:"https://www.iscc-system.org", publishedAt: new Date(Date.now()-5*24*60*60*1000).toISOString(), sourceName:"ISCC System", sourceRegion:"Global", tags:["biofuels/ISCC","certification","agriculture","sustainability"], summary:"El sistema ISCC revisó sus criterios para biodiesel de soja, incorporando indicadores de biodiversidad. Productores argentinos certificados deben adaptar su documentación.", image:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80" },
  { id:"d6", title:"Textiles sustentables: nuevas normas globales de reciclado que impactan en el algodón argentino", link:"https://www.epa.gov", publishedAt: new Date(Date.now()-6*24*60*60*1000).toISOString(), sourceName:"EPA", sourceRegion:"USA", tags:["textiles","recycled","certification","sustainability"], summary:"La EPA creó un sello para textiles con mínimo 30% de contenido reciclado. El programa podría volverse requisito federal y afectar exportaciones de indumentaria argentina.", image:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80" },
  { id:"d7", title:"CSRD: la directiva europea de sostenibilidad corporativa alcanza a proveedores argentinos", link:"https://finance.ec.europa.eu", publishedAt: new Date(Date.now()-7*24*60*60*1000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["CSRD","sustainability","due diligence"], summary:"La CSRD obliga a empresas europeas a reportar el impacto ambiental de toda su cadena de valor. Empresas argentinas que abastecen a grupos europeos quedan alcanzadas indirectamente.", image:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
  { id:"d8", title:"Biocombustibles: Argentina busca posicionarse en el mercado europeo de energías renovables", link:"https://www.fas.usda.gov", publishedAt: new Date(Date.now()-9*24*60*60*1000).toISOString(), sourceName:"USDA / FAS", sourceRegion:"USA", tags:["biofuels/ISCC","agriculture","exports/imports","sustainability"], summary:"Argentina tiene potencial para convertirse en proveedor clave de biocombustibles para Europa, pero necesita adaptar sus certificaciones ISCC a los nuevos estándares de la directiva RED III.", image:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80" },
  { id:"d9", title:"FAO: deforestación en Sudamérica amenaza el cumplimiento de estándares de exportación", link:"https://www.fao.org", publishedAt: new Date(Date.now()-11*24*60*60*1000).toISOString(), sourceName:"FAO", sourceRegion:"Global", tags:["deforestation","agriculture","forestry","EUDR"], summary:"La FAO advierte que el ritmo de deforestación en América del Sur podría comprometer la capacidad regional para cumplir con el EUDR y otros estándares internacionales de sostenibilidad.", image:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
  { id:"d10", title:"Cancillería avanza en reconocimiento mutuo de certificaciones orgánicas con la UE", link:"https://www.cancilleria.gob.ar", publishedAt: new Date(Date.now()-13*24*60*60*1000).toISOString(), sourceName:"Cancillería Argentina", sourceRegion:"AR", tags:["organic","certification","exports/imports"], summary:"Se negocia un acuerdo de equivalencia con la UE para que certificaciones orgánicas argentinas sean reconocidas directamente, reduciendo costos de doble certificación para productores.", image:"https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80" },
  { id:"d11", title:"Bichos de Campo: certificaciones orgánicas, el desafío del productor para exportar", link:"https://bichosdecampo.com", publishedAt: new Date(Date.now()-15*24*60*60*1000).toISOString(), sourceName:"Bichos de Campo", sourceRegion:"AR", tags:["organic","agriculture","certification"], summary:"Los productores argentinos que buscan mercados premium en Europa enfrentan certificaciones que triplican el costo operativo. El camino para acceder al mercado orgánico internacional.", image:"https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80" },
  { id:"d12", title:"IFOAM: guía práctica para pequeños productores en mercados orgánicos internacionales", link:"https://www.ifoam.bio", publishedAt: new Date(Date.now()-18*24*60*60*1000).toISOString(), sourceName:"IFOAM Organics", sourceRegion:"Global", tags:["organic","agriculture","certification"], summary:"Manual para que pequeñas explotaciones agropecuarias accedan a certificaciones internacionales y mercados premium de Europa, Asia y Norteamérica.", image:"https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80" },
];

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchSource(source: Source): Promise<FetchResult> {
  const encoded = encodeURIComponent(source.url);
  try {
    const res = await fetch(`/api/rss?url=${encoded}`);
    const json = await res.json();
    if (json.error && (!json.items || json.items.length === 0)) {
      return { sourceId: source.id, sourceName: source.name, items: [], error: json.error };
    }
    const now = new Date().toISOString();
    const items: NewsItem[] = (json.items ?? [])
      .filter((raw: { title: string; summary: string }) => !isDollarNews(raw.title, raw.summary))
      .map((raw: { title: string; link: string; pubDate: string | null; summary: string; image?: string }, idx: number) => {
        const autoTags = detectTags(`${raw.title} ${raw.summary}`);
        const allTags = Array.from(new Set([...source.tags, ...autoTags]));
        return {
          id: `${source.id}-${idx}-${raw.link}`,
          title: raw.title,
          link: raw.link,
          publishedAt: raw.pubDate ? new Date(raw.pubDate).toISOString() : now,
          sourceName: source.name,
          sourceRegion: source.region,
          tags: allTags,
          summary: raw.summary,
          image: raw.image,
        };
      });
    return { sourceId: source.id, sourceName: source.name, items };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { sourceId: source.id, sourceName: source.name, items: [], error: msg };
  }
}

async function fetchAllWithConcurrency(srcs: Source[], concurrency: number, onResult: (r: FetchResult) => void) {
  let idx = 0;
  async function worker() {
    while (idx < srcs.length) { const s = srcs[idx++]; onResult(await fetchSource(s)); }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, srcs.length) }, worker));
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

const REGIONS = Array.from(new Set(sources.map((s) => s.region))).sort();
const regionColors: Record<string, string> = {
  AR: "bg-sky-900/60 text-sky-300 border-sky-700",
  UE: "bg-blue-900/60 text-blue-300 border-blue-700",
  USA: "bg-red-900/60 text-red-300 border-red-700",
  Global: "bg-slate-700 text-slate-300 border-slate-600",
};

function TagChip({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${active ? "bg-[#3EB2ED] text-white border-[#3EB2ED]" : "bg-transparent text-slate-400 border-slate-700 hover:border-[#3EB2ED] hover:text-[#3EB2ED]"}`}>
      {tag}
    </button>
  );
}

function NewsCard({ item, index, lang, onTranslate, translating }: {
  item: NewsItem; index: number; lang: "es" | "en";
  onTranslate: (id: string) => void; translating: boolean;
}) {
  const regionClass = regionColors[item.sourceRegion] ?? regionColors.Global;
  const displayTitle = lang === "es" && item.translatedTitle ? item.translatedTitle : item.title;
  const displaySummary = lang === "es" && item.translatedSummary ? item.translatedSummary : item.summary;
  const isTranslated = !!(item.translatedTitle);
  const needsTranslation = lang === "es" && !isTranslated;

  return (
    <article className="group bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden hover:border-[#3EB2ED]/50 hover:bg-slate-800 transition-all duration-200 flex flex-col" style={{ animationDelay: `${index * 40}ms` }}>
      {item.image && (
        <div className="relative w-full h-40 overflow-hidden bg-slate-700 shrink-0">
          <img src={item.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent" />
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded border ${regionClass}`}>{item.sourceRegion}</span>
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#3EB2ED] uppercase tracking-wider truncate">{item.sourceName}</span>
          <div className="flex items-center gap-2 shrink-0">
            {!item.image && <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${regionClass}`}>{item.sourceRegion}</span>}
            <span className="text-xs text-slate-500">{formatDate(item.publishedAt)}</span>
          </div>
        </div>
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block text-[15px] font-bold text-slate-100 leading-snug group-hover:text-[#3EB2ED] transition-colors line-clamp-2">
          {displayTitle}<span className="inline-block ml-1 opacity-0 group-hover:opacity-60 transition-opacity text-xs">↗</span>
        </a>
        {displaySummary && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{displaySummary}</p>}
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">{tag}</span>
            ))}
          </div>
          {needsTranslation && (
            <button onClick={() => onTranslate(item.id)} disabled={translating}
              className="text-[10px] text-slate-500 hover:text-[#3EB2ED] transition-colors shrink-0 whitespace-nowrap disabled:opacity-40">
              {translating ? "traduciendo…" : "traducir →"}
            </button>
          )}
          {isTranslated && lang === "es" && (
            <span className="text-[10px] text-emerald-500 shrink-0">✓ ES</span>
          )}
        </div>
      </div>
    </article>
  );
}

function NavBar() {
  return (
    <nav className="border-b border-slate-700/60 bg-slate-850">
      <div className="max-w-6xl mx-auto px-4 flex items-center">
        <a href="/" className="px-4 py-2.5 text-sm font-semibold text-[#3EB2ED] border-b-2 border-[#3EB2ED] -mb-px">Noticias</a>
        <span className="px-4 py-2.5 text-sm text-slate-600 cursor-not-allowed select-none">Fuentes</span>
        <span className="px-4 py-2.5 text-sm text-slate-600 cursor-not-allowed select-none">Acerca de</span>
      </div>
    </nav>
  );
}

export default function Home() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [realItemCount, setRealItemCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [translations, setTranslations] = useState<Record<string, { title: string; summary: string }>>({});
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [last30, setLast30] = useState(false);

  const onResult = useCallback((r: FetchResult) => {
    setResults((prev) => [...prev, r]);
    setLoadedCount((c) => c + 1);
    setRealItemCount((c) => c + r.items.length);
  }, []);

  useEffect(() => {
    fetchAllWithConcurrency(sources, 3, onResult).then(() => setLoading(false));
  }, [onResult]);

  const allItems = useMemo(() => {
    const real: NewsItem[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      for (const item of r.items) {
        const key = item.link || item.id;
        if (!seen.has(key)) { seen.add(key); real.push(item); }
      }
    }
    const base = real.length > 0 ? real : DEMO_ITEMS;
    return base
      .filter(item => !isDollarNews(item.title, item.summary))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map(item => ({ ...item, translatedTitle: translations[item.id]?.title, translatedSummary: translations[item.id]?.summary }));
  }, [results, translations]);

  const filtered = useMemo(() => {
    const cutoff = last30 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    const sq = search.toLowerCase();
    return allItems.filter(item => {
      if (sq && !item.title.toLowerCase().includes(sq) && !item.summary.toLowerCase().includes(sq)) return false;
      if (selectedTags.length > 0 && !selectedTags.some(t => item.tags.includes(t))) return false;
      if (selectedRegion && item.sourceRegion !== selectedRegion) return false;
      if (cutoff && item.publishedAt < cutoff) return false;
      return true;
    });
  }, [allItems, search, selectedTags, selectedRegion, last30]);

  async function handleTranslate(id: string) {
    const item = allItems.find(i => i.id === id);
    if (!item || translatingIds.has(id)) return;
    setTranslatingIds(prev => new Set(prev).add(id));
    try {
      const [title, summary] = await Promise.all([
        translateText(item.title),
        item.summary ? translateText(item.summary) : Promise.resolve(""),
      ]);
      setTranslations(prev => ({ ...prev, [id]: { title, summary } }));
    } finally {
      setTranslatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const isShowingDemo = realItemCount === 0;
  const failedSources = results.filter(r => r.error);
  const activeFilters = selectedTags.length + (selectedRegion ? 1 : 0) + (search ? 1 : 0) + (last30 ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-700/60 bg-slate-900/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-36 shrink-0">
              <Image src="/cu-logo.png" alt="Control Union" width={144} height={40} className="object-contain brightness-0 invert opacity-85" />
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[#3EB2ED]">◈</span>
                <h1 className="font-display text-xl font-bold tracking-tight text-white">Radar</h1>
              </div>
              <span className="text-slate-500 text-sm hidden md:block">Sustentabilidad &amp; Certificaciones con impacto en Argentina</span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {/* Lang toggle */}
            <button onClick={() => setLang(l => l === "es" ? "en" : "es")}
              className="flex items-center gap-1.5 text-xs font-bold border border-slate-700 rounded-lg px-3 py-1.5 hover:border-[#3EB2ED] transition-colors">
              <span className={lang === "es" ? "text-[#3EB2ED]" : "text-slate-500"}>ES</span>
              <span className="text-slate-600">/</span>
              <span className={lang === "en" ? "text-[#3EB2ED]" : "text-slate-500"}>EN</span>
            </button>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin" />
                <span className="hidden sm:block">{loadedCount}/{sources.length}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="hidden sm:block">{sources.length} fuentes</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Nav */}
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isShowingDemo && !loading && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400 flex items-center gap-2">
            <span>⚠</span><span>Mostrando noticias de ejemplo. Las fuentes RSS no respondieron aún.</span>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          <button onClick={() => setFiltersOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-300">Filtros</span>
              {activeFilters > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#3EB2ED] text-white font-bold">{activeFilters}</span>}
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-xs hidden sm:block">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}{isShowingDemo ? " (ejemplo)" : ` de ${allItems.length}`}</span>
              <span className={`text-sm transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>
          <div className={`transition-all duration-300 overflow-hidden ${filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Buscar</label>
                  <input type="text" placeholder="EUDR, textiles, biocombustibles, fruta…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Región</label>
                  <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#3EB2ED] transition">
                    <option value="">Todas</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Temas</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => <TagChip key={tag} tag={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />)}
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
                  <button onClick={() => { setSearch(""); setSelectedTags([]); setSelectedRegion(""); setLast30(false); }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors">✕ Limpiar filtros</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} lang={lang}
                onTranslate={handleTranslate} translating={translatingIds.has(item.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-600">
            <p className="text-5xl mb-4">◈</p>
            <p className="text-lg font-display font-bold text-slate-400">Sin resultados</p>
            <p className="text-sm mt-1">Ninguna noticia coincide con los filtros actuales.</p>
          </div>
        )}

        {/* Failed sources — at the bottom */}
        {failedSources.length > 0 && !loading && (
          <div className="mt-12 border-t border-slate-800 pt-6">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest mb-2">Fuentes que no respondieron</p>
            <div className="flex flex-wrap gap-2">
              {failedSources.map(s => (
                <span key={s.sourceId} className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-500">{s.sourceName}</span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Image src="/cu-logo.png" alt="Control Union" width={96} height={26} className="object-contain brightness-0 invert opacity-30" />
            <span>Radar — desarrollado por Control Union Argentina</span>
          </div>
          <span>Fuentes públicas oficiales · Sin datos propietarios</span>
        </div>
      </footer>
    </div>
  );
}
