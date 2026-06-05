import { describe, test, expect } from 'bun:test';
import { LongUrl } from '../../src/domain/LongUrl.js';
import { InvalidUrlException } from '../../src/domain/exceptions.js';

describe('LongUrl Value Object', () => {
  test('should accept valid HTTP and HTTPS URLs', () => {
    const url1 = LongUrl.create('https://www.google.com');
    expect(url1.getValue()).toBe('https://www.google.com/');

    const url2 = LongUrl.create('http://stoik.io/blog');
    expect(url2.getValue()).toBe('http://stoik.io/blog');
  });

  test('should auto-prepend https:// if protocol is missing', () => {
    const url = LongUrl.create('google.com');
    expect(url.getValue()).toBe('https://google.com/');
  });

  test('should reject invalid URL patterns', () => {
    expect(() => LongUrl.create('')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('not-a-url')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('ftp://google.com')).toThrow(InvalidUrlException);
  });

  test('should block loopback hosts', () => {
    expect(() => LongUrl.create('http://localhost')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://127.0.0.1')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://[::1]')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://0.0.0.0')).toThrow(InvalidUrlException);
  });

  test('should block private network ranges', () => {
    // Class A private
    expect(() => LongUrl.create('http://10.0.0.1')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://10.255.255.255')).toThrow(InvalidUrlException);
    // Class B private
    expect(() => LongUrl.create('http://172.16.0.1')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://172.31.255.255')).toThrow(InvalidUrlException);
    // Class C private
    expect(() => LongUrl.create('http://192.168.1.100')).toThrow(InvalidUrlException);
    // Link-local
    expect(() => LongUrl.create('http://169.254.1.1')).toThrow(InvalidUrlException);
  });

  test('should block private network range IPv6 addresses', () => {
    expect(() => LongUrl.create('http://[fc00::1]')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://[fd12:3456:789a::1]')).toThrow(InvalidUrlException);
    expect(() => LongUrl.create('http://[fe80::1]')).toThrow(InvalidUrlException);
  });
});
