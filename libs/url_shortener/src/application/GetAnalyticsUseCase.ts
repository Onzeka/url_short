import { UrlRepository, UrlAnalytics } from '../domain/UrlRepository.js';
import { ShortSlug } from '../domain/ShortSlug.js';
import { UrlNotFoundException } from '../domain/exceptions.js';

export class GetAnalyticsUseCase {
  constructor(private readonly urlRepository: UrlRepository) {}

  public async execute(slug: string): Promise<UrlAnalytics> {
    const shortSlug = ShortSlug.create(slug);
    const analytics = await this.urlRepository.getAnalytics(shortSlug.getValue());
    if (!analytics) {
      throw new UrlNotFoundException(slug);
    }
    return analytics;
  }
}
