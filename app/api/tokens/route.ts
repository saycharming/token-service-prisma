import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  validateCreateTokenRequest,
  TokenResponse,
} from '@/lib/validation';
import { computeExpiresAt, isTokenExpired } from '@/lib/token';

function toTokenResponse(token: {
  id: string;
  userId: string;
  scopes: string;
  createdAt: Date;
  expiresAt: Date;
  token: string;
}): TokenResponse {
  let parsedScopes: string[];

  try {
    parsedScopes = JSON.parse(token.scopes);
  } catch {
    parsedScopes = [];
  }

  return {
    id: token.id,
    userId: token.userId,
    scopes: parsedScopes,
    createdAt: token.createdAt.toISOString(),
    expiresAt: token.expiresAt.toISOString(),
    token: token.token,
  };
}

function authorize(req: NextRequest): NextResponse | null {
  const configuredKey = process.env.API_KEY;
  const headerKey = req.headers.get('x-api-key');

  if (!configuredKey) {
    console.warn('API_KEY is not set. Rejecting request.');
    return NextResponse.json(
      { error: 'Service not configured' },
      { status: 500 }
    );
  }

  if (!headerKey || headerKey !== configuredKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}

// POST /api/tokens
export async function POST(req: NextRequest) {
  const authError = authorize(req);
  if (authError) return authError;

  try {
    const json = await req.json();
    const result = validateCreateTokenRequest(json);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const { userId, scopes, expiresInMinutes } = result.value;
    const now = new Date();
    const expiresAt = computeExpiresAt(now, expiresInMinutes);

    const tokenValue = randomBytes(32).toString('hex');

    const token = await prisma.token.create({
      data: {
        userId,
        scopes: JSON.stringify(scopes),
        createdAt: now,
        expiresAt,
        token: tokenValue,
      },
    });

    return NextResponse.json(toTokenResponse(token), { status: 201 });
  } catch (err) {
    console.error('POST /api/tokens failed', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/tokens?userId=123
export async function GET(req: NextRequest) {
  const authError = authorize(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || userId.trim().length === 0) {
      return NextResponse.json(
        { error: '`userId` query parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date();

    const tokens = await prisma.token.findMany({
      where: {
        userId: userId.trim(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const activeTokens = tokens.filter(t => !isTokenExpired(t.expiresAt, now));

    const response: TokenResponse[] = activeTokens.map(toTokenResponse);

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('GET /api/tokens failed', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
