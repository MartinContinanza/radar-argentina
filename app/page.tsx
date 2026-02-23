"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import sourcesRaw from "../data/sources.json";
import { Source, NewsItem, FetchResult } from "../lib/types";
import { detectTags, ALL_TAGS } from "../lib/tagging";

const sources: Source[] = sourcesRaw as Source[];

// ─── concurrency-limited fetcher ────────────────────────────────────────────

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

async function fetchAllWithConcurrency(
  srcs: Source[],
  concurrency: number,
  onResult: (r: FetchResult) => void
) {
  let idx = 0;
  async function worker() {
    while (idx < srcs.length) {
      const current = srcs[idx++];
      const result = await fetchSource(current);
      onResult(result);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, srcs.length) }, worker);
  await Promise.all(workers);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const REGIONS = Array.from(new Set(sources.map((s) => s.region))).sort();

// ─── components ─────────────────────────────────────────────────────────────

function TagChip({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all border ${
        active
          ? "bg-[#3EB2ED] text-white border-[#3EB2ED]"
          : "bg-white text-[#3EB2ED] border-[#3EB2ED]/40 hover:border-[#3EB2ED]"
      }`}
    >
      {tag}
    </button>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-[#3EB2ED]/30 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-semibold text-[15px] leading-snug text-slate-800 group-hover:text-[#3EB2ED] transition-colors line-clamp-2"
        >
          {item.title}
        </a>
        <span className="shrink-0 text-xs text-slate-400 mt-0.5 whitespace-nowrap">
          {formatDate(item.publishedAt)}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-[#3EB2ED]">{item.sourceName}</span>
        <span className="text-slate-300">·</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{item.sourceRegion}</span>
      </div>
      {item.summary && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-3">{item.summary}</p>
      )}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 6).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  );
}

function SourceStatus({ results }: { results: FetchResult[] }) {
  const errors = results.filter((r) => r.error);
  if (errors.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
      <span className="font-semibold">⚠ {errors.length} fuente(s) con error:</span>{" "}
      {errors.map((e) => e.sourceName).join(", ")}. El resto se sigue mostrando.
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [last30, setLast30] = useState(false);

  const onResult = useCallback((r: FetchResult) => {
    setResults((prev) => [...prev, r]);
    setLoadedCount((c) => c + 1);
  }, []);

  useEffect(() => {
    fetchAllWithConcurrency(sources, 3, onResult).then(() => setLoading(false));
  }, [onResult]);

  const allItems = useMemo(() => {
    const seen = new Set<string>();
    const merged: NewsItem[] = [];
    for (const r of results) {
      for (const item of r.items) {
        const key = item.link || item.id;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }
    }
    return merged.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [results]);

  const filtered = useMemo(() => {
    const cutoff = last30
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const sq = search.toLowerCase();

    return allItems.filter((item) => {
      if (sq && !item.title.toLowerCase().includes(sq) && !item.summary.toLowerCase().includes(sq)) {
        return false;
      }
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((t) => item.tags.includes(t))
      ) {
        return false;
      }
      if (selectedRegion && item.sourceRegion !== selectedRegion) return false;
      if (cutoff && item.publishedAt < cutoff) return false;
      return true;
    });
  }, [allItems, search, selectedTags, selectedRegion, last30]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6fb]">
      {/* Header */}
      <header
        style={{ background: "linear-gradient(135deg, #3EB2ED 0%, #1a8fc7 100%)" }}
        className="text-white py-10 px-6 shadow-lg"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📡</span>
            <h1 className="font-display font-bold text-3xl tracking-tight">
              Radar Argentina
            </h1>
          </div>
          <p className="text-white/80 text-base ml-12 font-light tracking-wide">
            Regulaciones &amp; Certificaciones · Actualizaciones públicas con posible impacto en Argentina
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Text search */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por título o resumen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3EB2ED]/40 focus:border-[#3EB2ED] transition"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Región
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3EB2ED]/40 focus:border-[#3EB2ED] transition bg-white"
              >
                <option value="">Todas</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Filtrar por tema
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  active={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>

          {/* Toggle */}
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <div
              onClick={() => setLast30((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                last30 ? "bg-[#3EB2ED]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  last30 ? "translate-x-5" : ""
                }`}
              />
            </div>
            <span className="text-sm text-slate-600">Últimos 30 días</span>
          </label>
        </section>

        {/* Status bar */}
        {loading && (
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
            <span className="inline-block w-4 h-4 border-2 border-[#3EB2ED] border-t-transparent rounded-full animate-spin" />
            Cargando fuentes… ({loadedCount}/{sources.length})
          </div>
        )}

        <SourceStatus results={results} />

        {/* Count */}
        {!loading && (
          <p className="text-sm text-slate-400 mb-4 mt-2">
            Mostrando{" "}
            <span className="font-semibold text-slate-600">{filtered.length}</span> noticias
            de {allItems.length} totales
          </p>
        )}

        {/* News grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-display font-semibold">Sin resultados</p>
            <p className="text-sm mt-1">Intentá con otros filtros o términos de búsqueda.</p>
          </div>
        ) : null}
      </main>

      <footer className="text-center text-xs text-slate-400 py-8 border-t border-slate-200 mt-8">
        Radar Argentina · Fuentes públicas oficiales · Sin datos propietarios
      </footer>
    </div>
  );
}
