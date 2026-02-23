import { NextRequest, NextResponse } from "next/server";

// In-memory cache: url -> { data, expiresAt }
const cache = new Map<string, { data: ParsedItem[]; expiresAt: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface ParsedItem {
  title: string;
  link: string;
  pubDate: string | null;
  summary: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractItems(xmlText: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // Support both RSS <item> and Atom <entry>
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];

    const title = extractTag(block, "title") ?? "(sin título)";
    const link =
      extractTag(block, "link") ??
      extractAttr(block, "link", "href") ??
      extractTag(block, "guid") ??
      "";
    const pubDate =
      extractTag(block, "pubDate") ??
      extractTag(block, "published") ??
      extractTag(block, "updated") ??
      null;
    const rawSummary =
      extractTag(block, "description") ??
      extractTag(block, "summary") ??
      extractTag(block, "content") ??
      "";

    const summary = stripHtml(rawSummary).slice(0, 400);

    items.push({ title: stripHtml(title), link: link.trim(), pubDate, summary });
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  // Try CDATA first, then plain text
  const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\/${tag}>`, "i");
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i");
  const cdataMatch = cdataRe.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = plainRe.exec(xml);
  if (plainMatch) return plainMatch[1].trim();
  return null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, "i");
  const m = re.exec(xml);
  return m ? m[1] : null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ items: cached.data, cached: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "RadarArgentina/1.0 (RSS aggregator)" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const items = extractItems(text);

    cache.set(url, { data: items, expiresAt: Date.now() + CACHE_TTL });

    return NextResponse.json({ items, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, items: [] }, { status: 200 });
  }
}
