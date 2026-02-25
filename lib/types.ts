export interface Source {
  id: string;
  name: string;
  url: string;
  type: "rss" | "atom";
  region: string;
  tags: string[];
  priority: number;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  sourceName: string;
  sourceRegion: string;
  tags: string[];
  summary: string;
  image?: string;
  translatedTitle?: string;
  translatedSummary?: string;
}

export interface FetchResult {
  sourceId: string;
  sourceName: string;
  items: NewsItem[];
  error?: string;
}
