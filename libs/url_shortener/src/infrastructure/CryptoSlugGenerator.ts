import { SlugGenerator } from '../domain/SlugGenerator.js';
import { randomBytes } from 'crypto';

export class CryptoSlugGenerator implements SlugGenerator {
  private readonly chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  public generate(): string {
    const length = 8;
    let result = '';
    while (result.length < length) {
      const byte = randomBytes(1)[0];
      // 62 * 4 = 248. By ignoring values >= 248, we eliminate any modulo bias.
      if (byte < 248) {
        result += this.chars[byte % 62];
      }
    }
    return result;
  }
}
