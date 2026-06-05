import { InvalidSlugException } from './exceptions.js';

export class ShortSlug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public static create(slug: string): ShortSlug {
    if (!slug || typeof slug !== 'string') {
      throw new InvalidSlugException('Slug must be a non-empty string.');
    }

    const trimmed = slug.trim();
    // Validate length 4 to 10 and Base62 alphabet (alphanumeric)
    const base62Regex = /^[a-zA-Z0-9]{4,10}$/;
    if (!base62Regex.test(trimmed)) {
      throw new InvalidSlugException('Slug must be 4 to 10 alphanumeric characters.');
    }

    return new ShortSlug(trimmed);
  }
}
