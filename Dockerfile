# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client & run migrations
RUN npx prisma generate
RUN npx prisma migrate deploy

# Build the Next.js app
RUN npm run build

# 2. Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Environment defaults (can be overridden at runtime)
ENV DATABASE_URL="file:./prisma/dev.db"
ENV API_KEY="change-me-in-env"

# Copy runtime files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 3000

CMD ["npm", "start"]
