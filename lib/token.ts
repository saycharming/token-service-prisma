/**
 * Compute expiry date from now and a duration in minutes.
 */
export function computeExpiresAt(now: Date, expiresInMinutes: number): Date {
  return new Date(now.getTime() + expiresInMinutes * 60_000);
}

/**
 * Returns true if the token is expired at `now`.
 */
export function isTokenExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}
