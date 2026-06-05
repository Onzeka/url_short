import { describe, test, expect } from 'bun:test';
import { ShortSlug } from '../../src/domain/ShortSlug.js';
import { InvalidSlugException } from '../../src/domain/exceptions.js';

describe('ShortSlug Value Object', () => {
  test('should accept valid slugs', () => {
    const slug1 = ShortSlug.create('abcd');
    expect(slug1.getValue()).toBe('abcd');

    const slug2 = ShortSlug.create('A1B2C3d4e5');
    expect(slug2.getValue()).toBe('A1B2C3d4e5');
  });

  test('should reject invalid length slugs', () => {
    expect(() => ShortSlug.create('abc')).toThrow(InvalidSlugException);
    expect(() => ShortSlug.create('abcdefghijk')).toThrow(InvalidSlugException);
  });

  test('should reject non-alphanumeric characters', () => {
    expect(() => ShortSlug.create('abc-def')).toThrow(InvalidSlugException);
    expect(() => ShortSlug.create('abc_def')).toThrow(InvalidSlugException);
    expect(() => ShortSlug.create('abc def')).toThrow(InvalidSlugException);
  });
});
