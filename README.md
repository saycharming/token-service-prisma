# Token Service – Fullstack TypeScript Mini Project

This is a small token management service built with **Next.js (App Router)** and **TypeScript**.

It implements:

- `POST /api/tokens` – create a new token for a user with scopes and expiry
- `GET /api/tokens?userId=...` – list all non-expired tokens for a user

Tokens are persisted in a SQLite database using Prisma.

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma ORM + SQLite
- Tailwind CSS for a minimal UI

## Running locally

```bash
npm install
npx prisma migrate dev --name init
npm run dev
