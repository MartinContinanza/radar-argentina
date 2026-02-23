"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import sourcesRaw from "../data/sources.json";
import { Source, NewsItem, FetchResult } from "../lib/types";
import { detectTags, ALL_TAGS } from "../lib/tagging";

const sources: Source[] = sourcesRaw as Source[];

// ─── Demo data shown immediately ─────────────────────────────────────────────
const DEMO_ITEMS: NewsItem[] = [
  { id:"d1", title:"UE aprueba reglamento EUDR: nuevas exigencias de due diligence para exportadores de soja, maíz y cuero", link:"https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en", publishedAt: new Date(Date.now()-2*24*60*60*1000).toISOString(), sourceName:"European Commission – Environment", sourceRegion:"UE", tags:["EUDR","deforestation","due diligence","exports/imports"], summary:"El Reglamento de la UE sobre deforestación (EUDR) exige que las empresas verifiquen que sus productos no provienen de tierras deforestadas tras diciembre de 2020. Argentina, como gran exportador de soja y cuero, deberá adaptar su trazabilidad." },
  { id:"d2", title:"SENASA habilita nuevos protocolos de exportación de limones y arándanos frescos a la Unión Europea", link:"https://www.argentina.gob.ar/senasa", publishedAt: new Date(Date.now()-3*24*60*60*1000).toISOString(), sourceName:"SENASA Argentina", sourceRegion:"AR", tags:["agriculture","certification","exports/imports"], summary:"El Servicio Nacional de Sanidad y Calidad Agroalimentaria informó la aprobación de un nuevo protocolo fitosanitario que facilitará el ingreso de frutas frescas argentinas al mercado europeo bajo los nuevos estándares de la UE." },
  { id:"d3", title:"CBAM: el mecanismo de ajuste en frontera de carbono europeo entra en fase de transición", link:"https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en", publishedAt: new Date(Date.now()-5*24*60*60*1000).toISOString(), sourceName:"European Commission – Trade", sourceRegion:"UE", tags:["CBAM","sustainability","exports/imports"], summary:"El CBAM comenzó su fase de transición. Los importadores europeos de acero, aluminio, fertilizantes y cemento deberán reportar sus emisiones. Argentina exporta fertilizantes y metales a la UE, lo que impactará en costos." },
  { id:"d4", title:"FSC lanza nueva versión del estándar de cadena de custodia con énfasis en trazabilidad digital", link:"https://fsc.org", publishedAt: new Date(Date.now()-6*24*60*60*1000).toISOString(), sourceName:"FSC – Forest Stewardship Council", sourceRegion:"Global", tags:["forestry","certification","EUDR","deforestation"], summary:"Forest Stewardship Council actualizó su estándar de chain-of-custody para integrar requisitos digitales de trazabilidad, alineándose con las exigencias del EUDR y facilitando la verificación de origen para exportadores forestales." },
  { id:"d5", title:"ISCC actualiza requisitos para certificación de biocombustibles: impacto en productores de soja argentina", link:"https://www.iscc-system.org", publishedAt: new Date(Date.now()-8*24*60*60*1000).toISOString(), sourceName:"ISCC System", sourceRegion:"Global", tags:["biofuels/ISCC","certification","agriculture","sustainability"], summary:"El sistema ISCC revisó sus criterios de sostenibilidad para aceite de soja y biodiesel, incluyendo nuevos indicadores de biodiversidad y derechos laborales. Los productores argentinos certificados deberán adaptar su documentación." },
  { id:"d6", title:"OMC alerta sobre proliferación de medidas paraarancelarias con foco en trazabilidad", link:"https://www.wto.org", publishedAt: new Date(Date.now()-10*24*60*60*1000).toISOString(), sourceName:"WTO News", sourceRegion:"Global", tags:["trade","exports/imports","due diligence"], summary:"Un informe de la OMC señala que los países del G20 han incrementado las medidas no arancelarias vinculadas a trazabilidad y sostenibilidad, creando barreras de facto para exportadores de países en desarrollo como Argentina." },
  { id:"d7", title:"CSRD: la directiva de reporte de sostenibilidad europeo y su alcance extraterritorial", link:"https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en", publishedAt: new Date(Date.now()-12*24*60*60*1000).toISOString(), sourceName:"European Commission – Environment", sourceRegion:"UE", tags:["CSRD","sustainability","due diligence"], summary:"La Directiva CSRD obliga a grandes empresas europeas a reportar su impacto ambiental y social en toda la cadena de valor, incluyendo proveedores de terceros países. Empresas argentinas que abastecen a grupos europeos serán alcanzadas indirectamente." },
  { id:"d8", title:"Cancillería Argentina negocia reconocimiento mutuo de certificaciones orgánicas con la Unión Europea", link:"https://www.cancilleria.gob.ar", publishedAt: new Date(Date.now()-15*24*60*60*1000).toISOString(), sourceName:"Cancillería Argentina", sourceRegion:"AR", tags:["organic","certification","exports/imports","agriculture"], summary:"El Ministerio de Relaciones Exteriores avanza en un acuerdo de equivalencia con la UE que permitiría que las certificaciones orgánicas argentinas sean reconocidas directamente en el mercado europeo, reduciendo costos de doble certificación." },
  { id:"d9", title:"IFOAM publica guía para pequeños productores sobre acceso a mercados orgánicos internacionales", link:"https://www.ifoam.bio", publishedAt: new Date(Date.now()-18*24*60*60*1000).toISOString(), sourceName:"IFOAM Organics International", sourceRegion:"Global", tags:["organic","agriculture","certification"], summary:"La organización global de agricultura orgánica publicó un manual práctico para que pequeñas y medianas explotaciones agropecuarias puedan acceder a certificaciones internacionales y mercados premium de Europa, Asia y Norteamérica." },
  { id:"d10", title:"USDA refuerza controles de importación de miel y productos apícolas: nuevas exigencias de origen", link:"https://www.fas.usda.gov", publishedAt: new Date(Date.now()-20*24*60*60*1000).toISOString(), sourceName:"USDA Foreign Agri. Service", sourceRegion:"USA", tags:["agriculture","exports/imports","certification"], summary:"El Departamento de Agricultura de EE.UU. endureció los controles sobre miel importada, exigiendo trazabilidad completa de origen. Argentina es uno de los principales exportadores mundiales de miel y deberá ajustar su documentación." },
  { id:"d11", title:"FAO alerta: deforestación en Sudamérica amenaza cumplimiento de estándares internacionales de exportación", link:"https://www.fao.org", publishedAt: new Date(Date.now()-22*24*60*60*1000).toISOString(), sourceName:"FAO – Food & Agriculture", sourceRegion:"Global", tags:["deforestation","agriculture","forestry","EUDR","due diligence"], summary:"Un informe de la FAO advierte que el ritmo de deforestación en América del Sur podría comprometer la capacidad de los países de la región para cumplir con las nuevas exigencias del EUDR y otros estándares internacionales de sostenibilidad." },
  { id:"d12", title:"EPA lanza programa de certificación para textiles reciclados: potencial impacto en exportaciones argentinas", link:"https://www.epa.gov", publishedAt: new Date(Date.now()-25*24*60*60*1000).toISOString(), sourceName:"EPA – Environment", sourceRegion:"USA", tags:["textiles","recycled","certification","sustainability"], summary:"La Agencia de Protección Ambiental de EE.UU. creó un sello voluntario para textiles con contenido reciclado mínimo del 30%. El programa podría volverse requisito de compras federales y afectar exportaciones de indumentaria argentina." },
];

// ─── concurrency fetcher ─────────────────────────────────────────────────────
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
      (raw: { title: string; link: string; pubDate: string | null; summary: string }, idx: number) => {
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
        };
      }
    );
    return { sourceId: source.id, sourceName: source.name, items };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
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

function TagChip({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all border ${active ? "bg-[#3EB2ED] text-white border-[#3EB2ED]" : "bg-white text-[#3EB2ED] border-[#3EB2ED]/40 hover:border-[#3EB2ED]"}`}>
      {tag}
    </button>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-[#3EB2ED]/30 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-[15px] leading-snug text-slate-800 group-hover:text-[#3EB2ED] transition-colors line-clamp-2">
          {item.title}
        </a>
        <span className="shrink-0 text-xs text-slate-400 mt-0.5 whitespace-nowrap">{formatDate(item.publishedAt)}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-[#3EB2ED]">{item.sourceName}</span>
        <span className="text-slate-300">·</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{item.sourceRegion}</span>
      </div>
      {item.summary && <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-3">{item.summary}</p>}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 6).map((tag) => <TagChip key={tag} tag={tag} />)}
        </div>
      )}
    </article>
  );
}

export default function Home() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [realItemCount, setRealItemCount] = useState(0);

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

  // Merge: real items take priority over demo items
  const allItems = useMemo(() => {
    const realItems: NewsItem[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      for (const item of r.items) {
        const key = item.link || item.id;
        if (!seen.has(key)) { seen.add(key); realItems.push(item); }
      }
    }
    // If we have real items, use them; otherwise show demo
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

  const errorsCount = results.filter((r) => r.error).length;
  const isShowingDemo = realItemCount === 0;

  return (
    <div className="min-h-screen bg-[#f0f6fb]">
      <header style={{ background: "linear-gradient(135deg, #3EB2ED 0%, #1a8fc7 100%)" }} className="text-white py-10 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📡</span>
            <h1 className="font-display font-bold text-3xl tracking-tight">Radar Argentina</h1>
          </div>
          <p className="text-white/80 text-base ml-12 font-light tracking-wide">
            Regulaciones &amp; Certificaciones · Actualizaciones públicas con posible impacto en Argentina
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Buscar</label>
              <input type="text" placeholder="Buscar por título o resumen…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3EB2ED]/40 focus:border-[#3EB2ED] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Región</label>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3EB2ED]/40 focus:border-[#3EB2ED] transition bg-white">
                <option value="">Todas</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Filtrar por tema</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => <TagChip key={tag} tag={tag} active={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />)}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <div onClick={() => setLast30((v) => !v)} className={`relative w-10 h-5 rounded-full transition-colors ${last30 ? "bg-[#3EB2ED]" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${last30 ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm text-slate-600">Últimos 30 días</span>
          </label>
        </section>

        {/* Status */}
        {loading && (
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
            <span className="inline-block w-4 h-4 border-2 border-[#3EB2ED] border-t-transparent rounded-full animate-spin" />
            Actualizando fuentes… ({loadedCount}/{sources.length})
          </div>
        )}
        {isShowingDemo && !loading && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            ⚠ No se pudieron cargar noticias en vivo. Mostrando noticias de ejemplo. Revisá la consola de Vercel para ver los errores de cada fuente.
          </div>
        )}
        {!isShowingDemo && errorsCount > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            ⚠ {errorsCount} fuente(s) no respondieron. El resto se muestra igual.
          </div>
        )}

        <p className="text-sm text-slate-400 mb-4">
          Mostrando <span className="font-semibold text-slate-600">{filtered.length}</span> noticias
          {isShowingDemo ? " (ejemplo)" : ` de ${allItems.length} totales`}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-display font-semibold">Sin resultados</p>
            <p className="text-sm mt-1">Intentá con otros filtros o términos de búsqueda.</p>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-8 border-t border-slate-200 mt-8">
        Radar Argentina · Fuentes públicas oficiales · Sin datos propietarios
      </footer>
    </div>
  );
}
