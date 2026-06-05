import { ShortenedUrl } from './ShortenedUrl.js';

export interface VisitRecordProps {
  visitedAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  referrer: string | null;
}

export interface UrlAnalytics {
  clicks: number;
  visits: VisitRecordProps[];
}

export interface UrlRepository {
  save(url: ShortenedUrl): Promise<void>;
  findBySlug(slug: string): Promise<ShortenedUrl | null>;
  recordVisit(id: string, visit: Omit<VisitRecordProps, 'visitedAt'>): Promise<void>;
  getAnalytics(slug: string): Promise<UrlAnalytics | null>;
}
