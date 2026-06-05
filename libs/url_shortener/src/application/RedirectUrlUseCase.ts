import { UrlRepository } from '../domain/UrlRepository.js';
import { ShortSlug } from '../domain/ShortSlug.js';
import { UrlNotFoundException } from '../domain/exceptions.js';

export interface RecordVisitData {
  userAgent: string | null;
  ipAddress: string | null;
  referrer: string | null;
}

export class RedirectUrlUseCase {
  constructor(private readonly urlRepository: UrlRepository) {}

  public async execute(slug: string, visitData: RecordVisitData): Promise<string> {
    // Validate slug syntactically first
    const shortSlug = ShortSlug.create(slug);
    const url = await this.urlRepository.findBySlug(shortSlug.getValue());
    if (!url) {
      throw new UrlNotFoundException(slug);
    }

    // Increment local clicks counter and notify repository
    url.incrementClicks();
    
    // Log visit details and save click count in database
    // Running this concurrently/asynchronously, but in typical web frameworks we can await or dispatch.
    // Let's await it to guarantee consistency, or defer it. Here we await for reliability.
    await this.urlRepository.recordVisit(url.getId(), visitData);

    return url.getOriginalUrl().getValue();
  }
}
