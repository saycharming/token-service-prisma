export interface CreateTokenRequest {
  userId: string;
  scopes: string[];
  expiresInMinutes: number;
}

export interface TokenResponse {
  id: string;
  userId: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  token: string;
}

export function validateCreateTokenRequest(
  body: unknown
): { ok: true; value: CreateTokenRequest } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Body must be an object' };
  }

  const { userId, scopes, expiresInMinutes } = body as Partial<CreateTokenRequest>;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return { ok: false, error: '`userId` must be a non-empty string' };
  }

  if (!Array.isArray(scopes) || scopes.length === 0 || !scopes.every(s => typeof s === 'string')) {
    return { ok: false, error: '`scopes` must be a non-empty array of strings' };
  }

  if (
    typeof expiresInMinutes !== 'number' ||
    !Number.isInteger(expiresInMinutes) ||
    expiresInMinutes <= 0
  ) {
    return { ok: false, error: '`expiresInMinutes` must be a positive integer' };
  }

  return {
    ok: true,
    value: {
      userId: userId.trim(),
      scopes,
      expiresInMinutes,
    },
  };
}
