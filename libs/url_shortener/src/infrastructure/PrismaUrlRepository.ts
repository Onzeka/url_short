import { PrismaClient } from '@stoik/database';
import { UrlRepository, UrlAnalytics, VisitRecordProps } from '../domain/UrlRepository.js';
import { ShortenedUrl } from '../domain/ShortenedUrl.js';
import { LongUrl } from '../domain/LongUrl.js';
import { ShortSlug } from '../domain/ShortSlug.js';

export class PrismaUrlRepository implements UrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(url: ShortenedUrl): Promise<void> {
    await this.prisma.shortenedUrl.create({
      data: {
        id: url.getId(),
        originalUrl: url.getOriginalUrl().getValue(),
        slug: url.getSlug().getValue(),
        clicks: url.getClicks(),
        createdAt: url.getCreatedAt(),
        updatedAt: url.getUpdatedAt(),
      },
    });
  }

  public async findBySlug(slug: string): Promise<ShortenedUrl | null> {
    const record = await this.prisma.shortenedUrl.findUnique({
      where: { slug },
    });

    if (!record) {
      return null;
    }

    return new ShortenedUrl({
      id: record.id,
      originalUrl: LongUrl.create(record.originalUrl),
      slug: ShortSlug.create(record.slug),
      clicks: record.clicks,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public async recordVisit(
    id: string,
    visit: Omit<VisitRecordProps, 'visitedAt'>
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.shortenedUrl.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      }),
      this.prisma.urlVisit.create({
        data: {
          shortenedUrlId: id,
          userAgent: visit.userAgent,
          ipAddress: visit.ipAddress,
          referrer: visit.referrer,
        },
      }),
    ]);
  }

  public async getAnalytics(slug: string): Promise<UrlAnalytics | null> {
    const record = await this.prisma.shortenedUrl.findUnique({
      where: { slug },
      include: {
        visits: {
          orderBy: { visitedAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      clicks: record.clicks,
      visits: record.visits.map((v) => ({
        visitedAt: v.visitedAt,
        userAgent: v.userAgent,
        ipAddress: v.ipAddress,
        referrer: v.referrer,
      })),
    };
  }
}
