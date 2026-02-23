"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import sourcesRaw from "../data/sources.json";
import { Source, NewsItem, FetchResult } from "../lib/types";
import { detectTags, ALL_TAGS } from "../lib/tagging";

const sources: Source[] = sourcesRaw as Source[];

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_ITEMS: NewsItem[] = [
  { id:"d1", title:"UE aprueba reglamento EUDR: nuevas exigencias para exportadores de soja, maíz y cuero argentino", link:"https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en", publishedAt: new Date(Date.now()-1*24*60*60*1000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["EUDR","deforestation","due diligence","exports/imports"], summary:"El Reglamento europeo sobre deforestación exige verificar que los productos no provienen de tierras deforestadas tras 2020. Argentina, gran exportador de soja y cuero, deberá adaptar su trazabilidad o enfrentar cierre de mercados.", image:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" },
  { id:"d2", title:"SENASA habilita nuevos protocolos de exportación de limones y arándanos frescos a Europa", link:"https://www.argentina.gob.ar/senasa", publishedAt: new Date(Date.now()-2*24*60*60*1000).toISOString(), sourceName:"SENASA Argentina", sourceRegion:"AR", tags:["agriculture","certification","exports/imports"], summary:"El Servicio Nacional de Sanidad Agroalimentaria aprobó un nuevo protocolo fitosanitario que facilita el ingreso de frutas frescas argentinas al mercado europeo bajo los nuevos estándares vigentes.", image:"https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=400&q=80" },
  { id:"d3", title:"CBAM: el mecanismo de ajuste en frontera de carbono europeo y su impacto en exportaciones industriales", link:"https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en", publishedAt: new Date(Date.now()-3*24*60*60*1000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["CBAM","sustainability","exports/imports"], summary:"Los importadores europeos de acero, aluminio y fertilizantes deberán reportar emisiones. Argentina exporta fertilizantes y metales a la UE — el CBAM encarecerá productos sin huella de carbono certificada.", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { id:"d4", title:"FSC actualiza estándar de cadena de custodia con nuevos requisitos digitales de trazabilidad", link:"https://fsc.org", publishedAt: new Date(Date.now()-4*24*60*60*1000).toISOString(), sourceName:"FSC Internacional", sourceRegion:"Global", tags:["forestry","certification","EUDR"], summary:"Forest Stewardship Council integró requisitos digitales de trazabilidad en su estándar de chain-of-custody, alineándose con el EUDR y facilitando la verificación de origen para exportadores forestales latinoamericanos.", image:"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80" },
  { id:"d5", title:"ISCC actualiza criterios para biocombustibles: nuevas reglas que afectan al aceite de soja argentino", link:"https://www.iscc-system.org", publishedAt: new Date(Date.now()-5*24*60*60*1000).toISOString(), sourceName:"ISCC System", sourceRegion:"Global", tags:["biofuels/ISCC","certification","agriculture"], summary:"El sistema ISCC revisó sus criterios de sostenibilidad para biodiesel de soja, incorporando indicadores de biodiversidad y derechos laborales. Productores argentinos certificados deben adaptar su documentación antes de 2025.", image:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80" },
  { id:"d6", title:"OMC alerta: proliferación de barreras paraarancelarias de trazabilidad afecta a exportadores del sur global", link:"https://www.wto.org", publishedAt: new Date(Date.now()-6*24*60*60*1000).toISOString(), sourceName:"WTO / OMC", sourceRegion:"Global", tags:["trade","exports/imports","due diligence"], summary:"Un informe de la OMC señala que el G20 incrementó medidas no arancelarias vinculadas a trazabilidad y sostenibilidad, creando barreras de facto para exportadores de países en desarrollo, con impacto directo en Argentina.", image:"https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80" },
  { id:"d7", title:"Cancillería Argentina avanza en reconocimiento mutuo de certificaciones orgánicas con la UE", link:"https://www.cancilleria.gob.ar", publishedAt: new Date(Date.now()-7*24*60*60*1000).toISOString(), sourceName:"Cancillería Argentina", sourceRegion:"AR", tags:["organic","certification","exports/imports"], summary:"El Ministerio de Relaciones Exteriores negocia un acuerdo de equivalencia con la UE para que certificaciones orgánicas argentinas sean reconocidas directamente, reduciendo costos de doble certificación para productores.", image:"https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80" },
  { id:"d8", title:"CSRD: la directiva europea de reportes de sostenibilidad alcanza a proveedores argentinos de multinacionales", link:"https://finance.ec.europa.eu", publishedAt: new Date(Date.now()-9*24*60*60*1000).toISOString(), sourceName:"European Commission", sourceRegion:"UE", tags:["CSRD","sustainability","due diligence"], summary:"La Directiva CSRD obliga a grandes empresas europeas a reportar el impacto ambiental y social de su cadena de valor completa. Empresas argentinas que abastecen a grupos europeos serán alcanzadas indirectamente.", image:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
  { id:"d9", title:"USDA endurece controles de miel importada: Argentina deberá reforzar trazabilidad de origen", link:"https://www.fas.usda.gov", publishedAt: new Date(Date.now()-11*24*60*60*1000).toISOString(), sourceName:"USDA / FAS", sourceRegion:"USA", tags:["agriculture","exports/imports","certification"], summary:"El Departamento de Agricultura de EE.UU. exige trazabilidad completa de origen en miel importada. Argentina es exportador mundial clave y deberá ajustar su documentación para mantener acceso al mercado norteamericano.", image:"https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80" },
  { id:"d10", title:"FAO: deforestación en Sudamérica amenaza el cumplimiento de estándares internacionales de exportación", link:"https://www.fao.org", publishedAt: new Date(Date.now()-14*24*60*60*1000).toISOString(), sourceName:"FAO", sourceRegion:"Global", tags:["deforestation","agriculture","forestry","EUDR"], summary:"La FAO advierte que el ritmo de deforestación en América del Sur podría comprometer la capacidad regional para cumplir con las exigencias del EUDR y otros estándares internacionales de sostenibilidad en los próximos años.", image:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
  { id:"d11", title:"Textiles reciclados: nuevas certificaciones globales que impactan en la cadena de valor del algodón argentino", link:"https://www.epa.gov", publishedAt: new Date(Date.now()-17*24*60*60*1000).toISOString(), sourceName:"EPA", sourceRegion:"USA", tags:["textiles","recycled","certification","sustainability"], summary:"La EPA creó un sello para textiles con contenido reciclado mínimo del 30%. El programa podría convertirse en requisito de compras federales, afectando exportaciones de indumentaria y algodón argentinos a Estados Unidos.", image:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80" },
  { id:"d12", title:"IFOAM lanza guía para pequeños productores sobre certificaciones orgánicas internacionales", link:"https://www.ifoam.bio", publishedAt: new Date(Date.now()-20*24*60*60*1000).toISOString(), sourceName:"IFOAM Organics", sourceRegion:"Global", tags:["organic","agriculture","certification"], summary:"La organización global de agricultura orgánica publicó un manual práctico para que pequeñas y medianas explotaciones agropecuarias puedan acceder a certificaciones internacionales y mercados premium europeos y asiáticos.", image:"https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80" },
];

// ─── Fetch logic ─────────────────────────────────────────────────────────────
async function fetchSource(source: Source): Promise<FetchResult> {
  const encoded = encodeURIComponent(source.url);
  try {
    const res = await fetch(`/api/rss?url=${encoded}`);
    const json = await res.json();
    if (json.error && (!json.items || json.items.length === 0)) {
      return { sourceId: source.id, sourceName: source.name, items: [], error: json.error };
    }
    const now = new Date().toISOString();
    const items: NewsItem[] = (json.items ?? []).map(
      (raw: { title: string; link: string; pubDate: string | null; summary: string; image?: string }, idx: number) => {
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
      }
    );
    return { sourceId: source.id, sourceName: source.name, items };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { sourceId: source.id, sourceName: source.name, items: [], error: msg };
  }
}

async function fetchAllWithConcurrency(srcs: Source[], concurrency: number, onResult: (r: FetchResult) => void) {
  let idx = 0;
  async function worker() {
    while (idx < srcs.length) {
      const current = srcs[idx++];
      const result = await fetchSource(current);
      onResult(result);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, srcs.length) }, worker));
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

const REGIONS = Array.from(new Set(sources.map((s) => s.region))).sort();

// ─── Tag chip ─────────────────────────────────────────────────────────────────
function TagChip({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
        active
          ? "bg-[#3EB2ED] text-white border-[#3EB2ED] shadow-sm"
          : "bg-transparent text-slate-400 border-slate-700 hover:border-[#3EB2ED] hover:text-[#3EB2ED]"
      }`}
    >
      {tag}
    </button>
  );
}

// ─── Region badge colors ──────────────────────────────────────────────────────
const regionColors: Record<string, string> = {
  AR: "bg-sky-900/60 text-sky-300 border-sky-700",
  UE: "bg-blue-900/60 text-blue-300 border-blue-700",
  USA: "bg-red-900/60 text-red-300 border-red-700",
  Global: "bg-slate-700 text-slate-300 border-slate-600",
};

// ─── News card ────────────────────────────────────────────────────────────────
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const regionClass = regionColors[item.sourceRegion] ?? regionColors.Global;
  return (
    <article
      className="group bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden hover:border-[#3EB2ED]/50 hover:bg-slate-800 transition-all duration-200"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image */}
      {item.image && (
        <div className="relative w-full h-40 overflow-hidden bg-slate-700">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent" />
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded border ${regionClass}`}>
            {item.sourceRegion}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Source + date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-[#3EB2ED] uppercase tracking-wider truncate">
            {item.sourceName}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {!item.image && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${regionClass}`}>
                {item.sourceRegion}
              </span>
            )}
            <span className="text-xs text-slate-500">{formatDate(item.publishedAt)}</span>
          </div>
        </div>

        {/* Title */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[15px] font-bold text-slate-100 leading-snug mb-2 group-hover:text-[#3EB2ED] transition-colors line-clamp-2"
        >
          {item.title}
          <span className="inline-block ml-1 opacity-0 group-hover:opacity-60 transition-opacity text-xs">↗</span>
        </a>

        {/* Summary */}
        {item.summary && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-3">{item.summary}</p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [realItemCount, setRealItemCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);

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
    const realItems: NewsItem[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      for (const item of r.items) {
        const key = item.link || item.id;
        if (!seen.has(key)) { seen.add(key); realItems.push(item); }
      }
    }
    const base = realItems.length > 0 ? realItems : DEMO_ITEMS;
    return base.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [results]);

  const filtered = useMemo(() => {
    const cutoff = last30 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    const sq = search.toLowerCase();
    return allItems.filter((item) => {
      if (sq && !item.title.toLowerCase().includes(sq) && !item.summary.toLowerCase().includes(sq)) return false;
      if (selectedTags.length > 0 && !selectedTags.some((t) => item.tags.includes(t))) return false;
      if (selectedRegion && item.sourceRegion !== selectedRegion) return false;
      if (cutoff && item.publishedAt < cutoff) return false;
      return true;
    });
  }, [allItems, search, selectedTags, selectedRegion, last30]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  const isShowingDemo = realItemCount === 0;
  const errorsCount = results.filter((r) => r.error).length;
  const activeFilters = selectedTags.length + (selectedRegion ? 1 : 0) + (search ? 1 : 0) + (last30 ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ── Header ── */}
      <header className="border-b border-slate-700/60 bg-slate-900/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: logo + name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Control Union logo — white version via CSS filter */}
              <div className="w-28 shrink-0">
                <Image
                  src="/cu-logo.png"
                  alt="Control Union"
                  width={112}
                  height={32}
                  className="object-contain brightness-0 invert opacity-80"
                />
              </div>
              <div className="w-px h-8 bg-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#3EB2ED] text-lg">◈</span>
                <h1 className="font-display text-xl font-bold tracking-tight text-white">
                  Señal
                </h1>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#3EB2ED]/20 text-[#3EB2ED] font-semibold border border-[#3EB2ED]/30">
                  AR
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight">
                Inteligencia regulatoria para el agro y el comercio argentino
              </p>
            </div>
          </div>

          {/* Right: loading indicator */}
          <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin" />
                <span>{loadedCount}/{sources.length} fuentes</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{sources.length} fuentes activas</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* ── Alerts ── */}
        {isShowingDemo && !loading && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400 flex items-center gap-2">
            <span>⚠</span>
            <span>Mostrando noticias de ejemplo. Las fuentes RSS no respondieron — revisá los logs en Vercel.</span>
          </div>
        )}
        {!isShowingDemo && errorsCount > 0 && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
            ⚠ {errorsCount} fuente(s) no respondieron. El resto se muestra igual.
          </div>
        )}

        {/* ── Filters panel ── */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          {/* Filter header / toggle */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-300">Filtros</span>
              {activeFilters > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#3EB2ED] text-white font-bold">
                  {activeFilters}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-xs hidden sm:block">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                {isShowingDemo ? " (ejemplo)" : ` de ${allItems.length}`}
              </span>
              <span className={`text-sm transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </div>
          </button>

          {/* Collapsible content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 space-y-4">
              {/* Search + Region row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Buscar</label>
                  <input
                    type="text"
                    placeholder="EUDR, soja, CBAM, certificaciones…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Región</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#3EB2ED] transition"
                  >
                    <option value="">Todas</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Temas</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((tag) => (
                    <TagChip key={tag} tag={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />
                  ))}
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setLast30((v) => !v)}
                  className={`flex items-center gap-2 text-sm transition-colors ${last30 ? "text-[#3EB2ED]" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${last30 ? "bg-[#3EB2ED]" : "bg-slate-700"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${last30 ? "translate-x-4" : ""}`} />
                  </div>
                  Últimos 30 días
                </button>

                {activeFilters > 0 && (
                  <button
                    onClick={() => { setSearch(""); setSelectedTags([]); setSelectedRegion(""); setLast30(false); }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    ✕ Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-600">
            <p className="text-5xl mb-4">◈</p>
            <p className="text-lg font-display font-bold text-slate-400">Sin señal</p>
            <p className="text-sm mt-1">Ninguna noticia coincide con los filtros actuales.</p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 mt-12 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Image src="/cu-logo.png" alt="Control Union" width={80} height={22} className="object-contain brightness-0 invert opacity-30" />
            <span>Señal — desarrollado por Control Union Argentina</span>
          </div>
          <span>Fuentes públicas oficiales · Sin datos propietarios</span>
        </div>
      </footer>
    </div>
  );
}
