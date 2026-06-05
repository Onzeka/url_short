export interface HistoryItem {
  id: string;
  slug: string;
  originalUrl: string;
  shortenedUrl: string;
  clicks: number;
  createdAt: string;
}

export interface Visit {
  visitedAt: string;
  userAgent: string | null;
  ipAddress: string | null;
  referrer: string | null;
}

export interface Analytics {
  clicks: number;
  visits: Visit[];
}

export class ApiService {
  constructor(private readonly baseUrl: string = 'http://localhost:3000') {}

  async shortenUrl(originalUrl: string, customSlug?: string): Promise<HistoryItem> {
    const res = await fetch(`${this.baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        originalUrl,
        customSlug: customSlug || undefined
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to shorten URL.');
    }

    return {
      id: data.id,
      slug: data.slug,
      originalUrl: data.originalUrl,
      shortenedUrl: data.shortenedUrl,
      clicks: data.clicks,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  async getAnalytics(slug: string): Promise<Analytics> {
    const res = await fetch(`${this.baseUrl}/api/analytics/${slug}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch analytics.');
    }

    return data;
  }
}
