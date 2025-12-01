# Token Service – Fullstack TypeScript Mini Project

This is a small token management service built with **Next.js (App Router)** and **TypeScript**.

It demonstrates:

- A minimal token API with persistence
- Basic header-based authentication using a local API key
- Simple domain logic with unit tests
- Dockerized runtime

There is **no `src/` directory** – the app uses the default Next.js structure:

- `app/` – routes and pages
- `lib/` – reusable logic (Prisma client, token helpers, validation, etc.)
- `prisma/` – Prisma schema and migrations
- `generated/` – Prisma client output (Prisma 7)

---

## Features

### API Endpoints

- `POST /api/tokens`  
  Create a token for a given user with scopes and expiry.

- `GET /api/tokens?userId=...`  
  List all **non-expired** tokens for a given user.

Both endpoints are protected by a simple API key header:

```http
x-api-key: <your-api-key>
```

The value must match the `API_KEY` environment variable configured on the server.

---

## Local API Key

For local development, the API key is stored in the project’s `.env` file.

Example `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
API_KEY="local-dev-api-key"
```

- `API_KEY` is the local secret used to protect the token endpoints.
- Every request to `/api/tokens` must include:

```http
x-api-key: local-dev-api-key
```

(or whatever value you set in `API_KEY`).

If the header is missing or incorrect, the API returns `401 Unauthorized`.

---

## Data Model

Tokens are stored in a SQLite database via Prisma 7:

```prisma
model Token {
  id        String   @id @default(cuid())
  userId    String
  scopes    String   // JSON stringified array of scopes, e.g. ["read","write"]
  createdAt DateTime @default(now())
  expiresAt DateTime
  token     String   @unique
}
```

---

## Token Logic

Core token logic is extracted into `lib/token.ts`:

- `computeExpiresAt(now, minutes)` – calculates expiry time from a base date and a duration in minutes.
- `isTokenExpired(expiresAt, now)` – checks if a token is expired at a given time.

These functions are covered by unit tests.

---

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Prisma 7** + SQLite
- **Tailwind CSS** for a minimal UI (optional)
- **Jest + ts-jest** for unit testing
- **Docker** for containerized runtime

---

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
API_KEY="local-dev-api-key"
```

### 3. Prisma client & migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> `prisma/schema.prisma` defines the data model.  
> `DATABASE_URL` points to a local SQLite file under `prisma/dev.db`.

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at:

- `http://localhost:3000` – optional UI
- `http://localhost:3000/api/tokens` – token API

---

## API Usage

All requests must include the API key header:

```http
x-api-key: local-dev-api-key
```

### POST /api/tokens

**URL**

```http
POST http://localhost:3000/api/tokens
```

**Headers**

```http
Content-Type: application/json
x-api-key: local-dev-api-key
```

**Request body**

```json
{
  "userId": "123",
  "scopes": ["read", "write"],
  "expiresInMinutes": 60
}
```

Validation rules:

- `userId`: non-empty string
- `scopes`: non-empty array of strings
- `expiresInMinutes`: positive integer

**Sample `curl`**

```bash
curl -X POST http://localhost:3000/api/tokens   -H "Content-Type: application/json"   -H "x-api-key: local-dev-api-key"   -d '{
    "userId": "123",
    "scopes": ["read", "write"],
    "expiresInMinutes": 60
  }'
```

---

### GET /api/tokens?userId=123

**URL**

```http
GET http://localhost:3000/api/tokens?userId=123
```

**Headers**

```http
x-api-key: local-dev-api-key
```

**Response**

Returns all non-expired tokens for the given `userId`:

```json
[
  {
    "id": "clxyz...",
    "userId": "123",
    "scopes": ["read", "write"],
    "createdAt": "2025-12-01T12:00:00.000Z",
    "expiresAt": "2025-12-01T13:00:00.000Z",
    "token": "a-long-hex-string..."
  }
]
```

Tokens where `expiresAt <= now` are excluded.

---

## Tests

Core token logic is tested with Jest.

### 1. Test config

- Tests live under `tests/`
- Jest is configured via `jest.config.cjs`
- `ts-jest` is used to run TypeScript tests

### 2. Run tests

```bash
npm test
```

This will run the suite, including tests for:

- `computeExpiresAt` – time arithmetic correctness
- `isTokenExpired` – behaviour before/after expiry and at the exact boundary

---

## Docker

The project includes a `Dockerfile` to build and run the service in a container.

### 1. Build the image

```bash
docker build -t token-service .
```

### 2. Run the container

```bash
docker run -p 3000:3000   -e DATABASE_URL="file:./prisma/dev.db"   -e API_KEY="local-dev-api-key"   token-service
```

This will:

- Expose the app on `http://localhost:3000`
- Use the SQLite database at `prisma/dev.db` inside the container
- Protect the API with the provided `API_KEY`

### 3. Call the API in Docker

Example `curl` against the running container:

```bash
curl -X POST http://localhost:3000/api/tokens   -H "Content-Type: application/json"   -H "x-api-key: local-dev-api-key"   -d '{
    "userId": "123",
    "scopes": ["read", "write"],
    "expiresInMinutes": 60
  }'
```

and:

```bash
curl -X GET "http://localhost:3000/api/tokens?userId=123"   -H "x-api-key: local-dev-api-key"
```