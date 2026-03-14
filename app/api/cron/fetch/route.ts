import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase-server";
import sourcesRaw from "../../../../data/sources.json";
import { detectTags } from "../../../../lib/tagging";
import { Source } from "../../../../lib/types";

const sources: Source[] = sourcesRaw as Source[];

// ─── Seguridad: el cron solo responde si viene con el token correcto ──────────
const CRON_SECRET = process.env.CRON_SECRET;

// ─── Parser RSS ───────────────────────────────────────────────────────────────
interface ParsedItem {
  title: string;
  link: string;
  pubDate: string | null;
  summary: string;
  image: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function extractImage(block: string): string | null {
  const media = /media:content[^>]+url="([^"]+)"/.exec(block);
  if (media) return media[1];
  const thumb = /media:thumbnail[^>]+url="([^"]+)"/.exec(block);
  if (thumb) return thumb[1];
  const enc = /enclosure[^>]+type="image\/[^"]*"[^>]+url="([^"]+)"/.exec(block)
    || /enclosure[^>]+url="([^"]+)"[^>]+type="image\/[^"]*"/.exec(block);
  if (enc) return enc[1];
  const img = /<img[^>]+src="([^"]+)"/.exec(block);
  if (img && !img[1].includes("pixel") && !img[1].includes("tracker")) return img[1];
  return null;
}

function extractTag(xml: string, tag: string): string | null {
  const cd = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i").exec(xml);
  if (cd) return cd[1].trim();
  const pl = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  return pl ? pl[1].trim() : null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const m = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, "i").exec(xml);
  return m ? m[1] : null;
}

function decodeEntities(str: string): string {
  if (!str) return str;
  function pass(s: string): string {
    return s
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#8220;/g, "\u201C").replace(/&#8221;/g, "\u201D")
      .replace(/&#8216;/g, "\u2018").replace(/&#8217;/g, "\u2019")
      .replace(/&#8211;/g, "\u2013").replace(/&#8212;/g, "\u2014")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&[a-zA-Z]+;/g, "");
  }
  return pass(pass(str));
}

function extractItems(xmlText: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const b = match[1];
    const title   = decodeEntities(extractTag(b, "title") ?? "(sin título)");
    const link    = extractTag(b, "link") ?? extractAttr(b, "link", "href") ?? extractTag(b, "guid") ?? "";
    const pubDate = extractTag(b, "pubDate") ?? extractTag(b, "published") ?? extractTag(b, "updated") ?? null;
    const rawSum  = extractTag(b, "description") ?? extractTag(b, "summary") ?? extractTag(b, "content") ?? "";
    const summary = decodeEntities(stripHtml(rawSum).slice(0, 400));
    const image   = extractImage(b);
    items.push({ title: stripHtml(title), link: link.trim(), pubDate, summary, image });
  }
  return items;
}

// ─── Fetch de una fuente ──────────────────────────────────────────────────────
async function fetchSource(source: Source): Promise<{ sourceId: string; items: ParsedItem[]; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RadarArgentina/1.0)" },
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return { sourceId: source.id, items: extractItems(text) };
  } catch (err: unknown) {
    return { sourceId: source.id, items: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Upsert en batches para evitar límites de payload ────────────────────────
const BATCH_SIZE = 100;

async function upsertInBatches(rows: object[]): Promise<{ inserted: number; error: string | null }> {
  let inserted = 0;
  for (let b = 0; b < rows.length; b += BATCH_SIZE) {
    const batch = rows.slice(b, b + BATCH_SIZE);
    const { error } = await supabaseServer
      .from("news_items")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      return { inserted, error: error.message };
    }
    inserted += batch.length;
  }
  return { inserted, error: null };
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Verificar token de seguridad
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (CRON_SECRET && token !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const results: { source: string; new: number; error?: string }[] = [];

  // Procesar fuentes en paralelo (grupos de 4)
  const concurrency = 4;
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < sources.length) {
      const source = sources[i++];
      const { items, error } = await fetchSource(source);

      if (error) {
        results.push({ source: source.name, new: 0, error });
        continue;
      }

      if (items.length === 0) {
        results.push({ source: source.name, new: 0 });
        continue;
      }

      // Preparar rows para upsert
      const now = new Date().toISOString();
      const rows = items.map((item, idx) => {
        const title = item.title;
        const summary = item.summary;
        const autoTags = detectTags(`${title} ${summary}`);
        const allTags = Array.from(new Set([...source.tags, ...autoTags]));
        // 32 chars de base64url para minimizar colisiones de ID
        const raw = item.link || `${source.id}-${idx}`;
        const id = `${source.id}-${Buffer.from(raw).toString("base64url").slice(0, 32)}`;
        return {
          id,
          title,
          link: item.link,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : now,
          source_id: source.id,
          source_name: source.name,
          source_region: source.region,
          tags: allTags,
          summary,
          image: item.image ?? null,
        };
      });

      // Upsert en batches de 100 para evitar límites de payload
      const { inserted, error: upsertError } = await upsertInBatches(rows);

      if (upsertError) {
        results.push({ source: source.name, new: inserted, error: upsertError });
      } else {
        results.push({ source: source.name, new: inserted });
      }
    }
  });

  await Promise.all(workers);

  // Limpiar noticias de más de 90 días
  await supabaseServer
    .from("news_items")
    .delete()
    .lt("published_at", new Date(Date.now() - 90 * 86400000).toISOString());

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  const totalNew = results.reduce((acc, r) => acc + r.new, 0);
  const errors = results.filter(r => r.error);

  return NextResponse.json({
    ok: true,
    elapsed: `${elapsed}s`,
    totalNew,
    sources: results,
    errors: errors.length,
  });
}
