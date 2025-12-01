# Token Service – Fullstack TypeScript Mini Project

This is a small token management service built with **Next.js (App Router)** and **TypeScript**.

It demonstrates:

- A minimal token API with persistence
- Basic header-based authentication
- Simple domain logic with unit tests
- Dockerized runtime

There is **no `src/` directory** – the app uses the default Next.js structure:

- `app/` – routes and pages
- `lib/` – reusable logic (Prisma client, token helpers, validation, etc.)
- `prisma/` – Prisma schema and migrations
- `generated/` – Prisma client (Prisma 7)

---

## Features

### API Endpoints

- `POST /api/tokens`  
  Create a token for a given user with scopes and expiry.

- `GET /api/tokens?userId=...`  
  List all **non-expired** tokens for a given user.

Both endpoints require an API key header:

```http
x-api-key: <your-api-key>
