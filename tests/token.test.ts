import { computeExpiresAt, isTokenExpired } from '../lib/token';

describe('token expiry logic', () => {
  it('computes expiry based on minutes', () => {
    const base = new Date('2025-01-01T00:00:00.000Z');
    const expires = computeExpiresAt(base, 30);

    expect(expires.toISOString()).toBe('2025-01-01T00:30:00.000Z');
  });

  it('isTokenExpired returns false when expiresAt is in the future', () => {
    const now = new Date('2025-01-01T00:00:00.000Z');
    const expires = new Date('2025-01-01T00:10:00.000Z');

    expect(isTokenExpired(expires, now)).toBe(false);
  });

  it('isTokenExpired returns true when expiresAt is in the past', () => {
    const now = new Date('2025-01-01T00:10:00.000Z');
    const expires = new Date('2025-01-01T00:00:00.000Z');

    expect(isTokenExpired(expires, now)).toBe(true);
  });

  it('treats exact boundary (expiresAt == now) as expired', () => {
    const now = new Date('2025-01-01T00:10:00.000Z');
    const expires = new Date('2025-01-01T00:10:00.000Z');

    expect(isTokenExpired(expires, now)).toBe(true);
  });
});
