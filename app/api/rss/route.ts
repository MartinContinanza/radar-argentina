import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase-client";

// Devuelve noticias desde Supabase en lugar de fetchear RSS en tiempo real.
// El cron job (/api/cron/fetch) es el responsable de mantener la DB actualizada.

export async function GET(req: NextRequest) {
  const sourceId = req.nextUrl.searchParams.get("source");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "500");

  try {
    let query = supabase
      .from("news_items")
      .select("id, title, link, published_at, source_id, source_name, source_region, tags, summary, image")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (sourceId) {
      query = query.eq("source_id", sourceId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Mapear columnas snake_case a camelCase para mantener compatibilidad con el frontend
    const items = (data ?? []).map(row => ({
      id: row.id,
      title: row.title,
      link: row.link,
      publishedAt: row.published_at,
      sourceName: row.source_name,
      sourceRegion: row.source_region,
      tags: row.tags,
      summary: row.summary,
      image: row.image,
    }));

    return NextResponse.json({ items, source: "db" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, items: [] }, { status: 200 });
  }
}
