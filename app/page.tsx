'use client';

import { useState } from 'react';

interface TokenResponse {
  id: string;
  userId: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  token: string;
}

export default function HomePage() {
  const [userId, setUserId] = useState('');
  const [scopesInput, setScopesInput] = useState('read,write');
  const [expiresIn, setExpiresIn] = useState(60);
  const [tokens, setTokens] = useState<TokenResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateToken = async () => {
    setError(null);
    setLoading(true);

    try {
      const scopes = scopesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          scopes,
          expiresInMinutes: expiresIn,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to create token');
      }

      const data = (await res.json()) as TokenResponse;
      setTokens(prev => [data, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTokens = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/tokens?userId=${encodeURIComponent(userId)}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to fetch tokens');
      }

      const data = (await res.json()) as TokenResponse[];
      setTokens(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Token Service Demo</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">User ID</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="123"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Scopes (comma separated)
            </label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              value={scopesInput}
              onChange={e => setScopesInput(e.target.value)}
              placeholder="read,write"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Expires in (minutes)</label>
            <input
              type="number"
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              value={expiresIn}
              onChange={e => setExpiresIn(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateToken}
              disabled={loading}
              className="px-4 py-2 rounded bg-emerald-500 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Working…' : 'Create Token'}
            </button>
            <button
              onClick={handleFetchTokens}
              disabled={loading}
              className="px-4 py-2 rounded bg-slate-700 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Working…' : 'List Tokens'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-2">Active Tokens</h2>
          {tokens.length === 0 && (
            <p className="text-sm text-slate-400">No tokens yet.</p>
          )}
          <ul className="space-y-3 max-h-64 overflow-auto">
            {tokens.map(t => (
              <li
                key={t.id}
                className="border border-slate-800 rounded-lg p-3 text-xs bg-slate-900/70"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[11px] text-slate-300">
                    {t.id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(t.expiresAt) < new Date()
                      ? 'Expired'
                      : 'Active'}
                  </span>
                </div>
                <div className="text-slate-400">
                  <div>User: {t.userId}</div>
                  <div>Scopes: {t.scopes.join(', ')}</div>
                  <div className="mt-1 break-all">
                    Token: <span className="font-mono">{t.token}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
