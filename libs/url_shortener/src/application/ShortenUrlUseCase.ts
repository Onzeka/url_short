import { UrlRepository } from '../domain/UrlRepository.js';
import { SlugGenerator } from '../domain/SlugGenerator.js';
import { LongUrl } from '../domain/LongUrl.js';
import { ShortSlug } from '../domain/ShortSlug.js';
import { ShortenedUrl } from '../domain/ShortenedUrl.js';
import { SlugCollisionException, DomainException } from '../domain/exceptions.js';

export class ShortenUrlUseCase {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly slugGenerator: SlugGenerator
  ) {}

  public async execute(originalUrl: string, customSlug?: string): Promise<ShortenedUrl> {
    const longUrl = LongUrl.create(originalUrl);

    let slug = '';

    if (customSlug) {
      // Validate custom slug format
      const shortSlug = ShortSlug.create(customSlug);
      slug = shortSlug.getValue();

      // Check if custom slug is already taken
      const existing = await this.urlRepository.findBySlug(slug);
      if (existing) {
        throw new DomainException(`The custom alias "${slug}" is already taken.`);
      }
    } else {
      let isUnique = false;
      let retries = 0;
      const maxRetries = 5;

      while (!isUnique && retries < maxRetries) {
        slug = this.slugGenerator.generate();
        const existing = await this.urlRepository.findBySlug(slug);
        if (!existing) {
          isUnique = true;
        } else {
          retries++;
        }
      }

      if (!isUnique) {
        throw new SlugCollisionException();
      }
    }

    const shortSlug = ShortSlug.create(slug);
    const shortenedUrl = new ShortenedUrl({
      originalUrl: longUrl,
      slug: shortSlug,
    });

    await this.urlRepository.save(shortenedUrl);
    return shortenedUrl;
  }
}
