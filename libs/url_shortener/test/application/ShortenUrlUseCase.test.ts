import { describe, test, expect } from 'bun:test';
import { ShortenUrlUseCase } from '../../src/application/ShortenUrlUseCase.js';
import { UrlRepository, UrlAnalytics, VisitRecordProps } from '../../src/domain/UrlRepository.js';
import { SlugGenerator } from '../../src/domain/SlugGenerator.js';
import { ShortenedUrl } from '../../src/domain/ShortenedUrl.js';
import { LongUrl } from '../../src/domain/LongUrl.js';
import { ShortSlug } from '../../src/domain/ShortSlug.js';
import { SlugCollisionException } from '../../src/domain/exceptions.js';

class MockUrlRepository implements UrlRepository {
  public urls = new Map<string, ShortenedUrl>();
  public visits = new Map<string, Omit<VisitRecordProps, 'visitedAt'>[]>();

  public async save(url: ShortenedUrl): Promise<void> {
    this.urls.set(url.getSlug().getValue(), url);
  }

  public async findBySlug(slug: string): Promise<ShortenedUrl | null> {
    return this.urls.get(slug) || null;
  }

  public async recordVisit(id: string, visit: Omit<VisitRecordProps, 'visitedAt'>): Promise<void> {
    const list = this.visits.get(id) || [];
    list.push(visit);
    this.visits.set(id, list);

    for (const url of this.urls.values()) {
      if (url.getId() === id) {
        url.incrementClicks();
      }
    }
  }

  public async getAnalytics(slug: string): Promise<UrlAnalytics | null> {
    const url = this.urls.get(slug);
    if (!url) return null;
    const visits = this.visits.get(url.getId()) || [];
    return {
      clicks: url.getClicks(),
      visits: visits.map(v => ({ ...v, visitedAt: new Date() }))
    };
  }
}

class MockSlugGenerator implements SlugGenerator {
  public generatedSlugs: string[];
  public index = 0;

  constructor(slugs: string[]) {
    this.generatedSlugs = slugs;
  }

  public generate(): string {
    const val = this.generatedSlugs[this.index % this.generatedSlugs.length];
    this.index++;
    return val;
  }
}

describe('ShortenUrlUseCase', () => {
  test('should shorten a URL successfully', async () => {
    const repo = new MockUrlRepository();
    const generator = new MockSlugGenerator(['ABCDEF']);
    const useCase = new ShortenUrlUseCase(repo, generator);

    const result = await useCase.execute('https://stoik.com');
    expect(result.getSlug().getValue()).toBe('ABCDEF');
    expect(result.getOriginalUrl().getValue()).toBe('https://stoik.com/');

    const saved = await repo.findBySlug('ABCDEF');
    expect(saved).not.toBeNull();
    expect(saved?.getOriginalUrl().getValue()).toBe('https://stoik.com/');
  });

  test('should retry and handle slug collisions', async () => {
    const repo = new MockUrlRepository();
    const existing = new ShortenedUrl({
      id: '123',
      originalUrl: LongUrl.create('https://google.com'),
      slug: ShortSlug.create('ABCDEF'),
    });
    await repo.save(existing);

    const generator = new MockSlugGenerator(['ABCDEF', 'FEDCBA']);
    const useCase = new ShortenUrlUseCase(repo, generator);

    const result = await useCase.execute('https://stoik.com');
    expect(result.getSlug().getValue()).toBe('FEDCBA');
    expect(repo.urls.size).toBe(2);
  });

  test('should fail if max retries reached due to collisions', async () => {
    const repo = new MockUrlRepository();
    const existing = new ShortenedUrl({
      id: '123',
      originalUrl: LongUrl.create('https://google.com'),
      slug: ShortSlug.create('ABCDEF'),
    });
    await repo.save(existing);

    const generator = new MockSlugGenerator(['ABCDEF']);
    const useCase = new ShortenUrlUseCase(repo, generator);

    expect(useCase.execute('https://stoik.com')).rejects.toThrow(SlugCollisionException);
  });

  test('should shorten with a valid custom slug', async () => {
    const repo = new MockUrlRepository();
    const generator = new MockSlugGenerator(['ABCDEF']);
    const useCase = new ShortenUrlUseCase(repo, generator);

    const result = await useCase.execute('https://stoik.com', 'CUSTOM');
    expect(result.getSlug().getValue()).toBe('CUSTOM');
    expect(repo.urls.has('CUSTOM')).toBe(true);
  });

  test('should throw if custom slug is already taken', async () => {
    const repo = new MockUrlRepository();
    const existing = new ShortenedUrl({
      id: '123',
      originalUrl: LongUrl.create('https://google.com'),
      slug: ShortSlug.create('CUSTOM'),
    });
    await repo.save(existing);

    const generator = new MockSlugGenerator(['ABCDEF']);
    const useCase = new ShortenUrlUseCase(repo, generator);

    expect(useCase.execute('https://stoik.com', 'CUSTOM')).rejects.toThrow();
  });
});
