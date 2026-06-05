import { InvalidUrlException } from './exceptions.js';

export class LongUrl {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public static create(url: string): LongUrl {
    if (!url || typeof url !== 'string') {
      throw new InvalidUrlException('URL must be a non-empty string.');
    }

    let trimmed = url.trim();
    // Support auto-prepending protocol if missing
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new InvalidUrlException('Invalid URL format.');
    }

    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      throw new InvalidUrlException('Only HTTP and HTTPS protocols are supported.');
    }

    const hostname = parsed.hostname.toLowerCase();

    // 1. Syntactic host dot validation (public domains must have a TLD/dot, preventing internal/local names)
    if (!hostname.includes('.') && !hostname.startsWith('[') && hostname !== 'localhost') {
      throw new InvalidUrlException('Invalid domain or host format.');
    }

    // 2. Literal host checks
    if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '[::1]' || hostname === '') {
      throw new InvalidUrlException('Loopback or empty hostnames are blocked for security.');
    }

    // 3. IPv4 pattern check
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = hostname.match(ipv4Regex);
    if (ipv4Match) {
      const parts = ipv4Match.slice(1).map(x => parseInt(x, 10));
      if (parts.some(x => x > 255)) {
        throw new InvalidUrlException('Invalid IP address in URL.');
      }
      const [a, b, c, d] = parts;

      // Loopback: 127.0.0.0/8
      if (a === 127) {
        throw new InvalidUrlException('Loopback addresses are blocked.');
      }
      // Private Class A: 10.0.0.0/8
      if (a === 10) {
        throw new InvalidUrlException('Private networks are blocked.');
      }
      // Private Class B: 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) {
        throw new InvalidUrlException('Private networks are blocked.');
      }
      // Private Class C: 192.168.0.0/16
      if (a === 192 && b === 168) {
        throw new InvalidUrlException('Private networks are blocked.');
      }
      // Link-local: 169.254.0.0/16
      if (a === 169 && b === 254) {
        throw new InvalidUrlException('Link-local networks are blocked.');
      }
    }

    // 4. IPv6 loopback / private prefix checks
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      const ip6 = hostname.slice(1, -1);
      const firstSegment = ip6.split(':')[0].toLowerCase();

      // Loopback ::1
      if (ip6 === '::1') {
        throw new InvalidUrlException('Private or loopback IPv6 networks are blocked.');
      }
      // Unique Local Addresses (ULA): fc00::/7 (covers fc00 to fdff)
      if (firstSegment.startsWith('fc') || firstSegment.startsWith('fd')) {
        throw new InvalidUrlException('Private or loopback IPv6 networks are blocked.');
      }
      // Link-local: fe80::/10 (covers fe80 to febf)
      if (
        firstSegment.startsWith('fe8') ||
        firstSegment.startsWith('fe9') ||
        firstSegment.startsWith('fea') ||
        firstSegment.startsWith('feb')
      ) {
        throw new InvalidUrlException('Private or loopback IPv6 networks are blocked.');
      }
    }

    return new LongUrl(parsed.toString());
  }
}
