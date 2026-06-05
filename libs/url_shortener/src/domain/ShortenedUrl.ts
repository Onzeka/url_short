import { LongUrl } from './LongUrl.js';
import { ShortSlug } from './ShortSlug.js';

export interface ShortenedUrlProps {
  id?: string;
  originalUrl: LongUrl;
  slug: ShortSlug;
  clicks?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ShortenedUrl {
  private readonly id: string;
  private readonly originalUrl: LongUrl;
  private readonly slug: ShortSlug;
  private clicks: number;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(props: ShortenedUrlProps) {
    this.id = props.id || crypto.randomUUID();
    this.originalUrl = props.originalUrl;
    this.slug = props.slug;
    this.clicks = props.clicks || 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public getId(): string {
    return this.id;
  }

  public getOriginalUrl(): LongUrl {
    return this.originalUrl;
  }

  public getSlug(): ShortSlug {
    return this.slug;
  }

  public getClicks(): number {
    return this.clicks;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public incrementClicks(): void {
    this.clicks += 1;
  }
}
