import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: ParsedItem[]; expiresAt: number }>();
const CACHE_TTL = 30 * 60 * 1000;

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
  // 1. <media:content url="...">
  const media = /media:content[^>]+url="([^"]+)"/.exec(block);
  if (media) return media[1];

  // 2. <media:thumbnail url="...">
  const thumb = /media:thumbnail[^>]+url="([^"]+)"/.exec(block);
  if (thumb) return thumb[1];

  // 3. <enclosure type="image/..." url="...">
  const enc = /enclosure[^>]+type="image\/[^"]*"[^>]+url="([^"]+)"/.exec(block)
    || /enclosure[^>]+url="([^"]+)"[^>]+type="image\/[^"]*"/.exec(block);
  if (enc) return enc[1];

  // 4. First <img src="..."> inside description/content
  const img = /<img[^>]+src="([^"]+)"/.exec(block);
  if (img && !img[1].includes("pixel") && !img[1].includes("tracker")) return img[1];

  return null;
}

function extractItems(xmlText: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const b = match[1];
    const title   = extractTag(b, "title") ?? "(sin título)";
    const link    = extractTag(b, "link") ?? extractAttr(b, "link", "href") ?? extractTag(b, "guid") ?? "";
    const pubDate = extractTag(b, "pubDate") ?? extractTag(b, "published") ?? extractTag(b, "updated") ?? null;
    const rawSum  = extractTag(b, "description") ?? extractTag(b, "summary") ?? extractTag(b, "content") ?? "";
    const summary = stripHtml(rawSum).slice(0, 400);
    const image   = extractImage(b);

    items.push({ title: stripHtml(title), link: link.trim(), pubDate, summary, image });
  }
  return items;
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

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url param" }, { status: 400 });

  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ items: cached.data, cached: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RadarArgentina/1.0)" },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const items = extractItems(text);

    cache.set(url, { data: items, expiresAt: Date.now() + CACHE_TTL });
    return NextResponse.json({ items, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, items: [] }, { status: 200 });
  }
}
