# ----------- Build stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY .npmrc ./
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY tsconfig.json ./
COPY backend/package.json ./backend/

# Install all deps (hoisted)
RUN pnpm install --frozen-lockfile

RUN pnpm add -w prisma

# Copy the rest (schema + sources)
COPY . .


# 🔧 Generate Prisma from monorepo root
RUN pnpm exec prisma generate --schema=backend/prisma/schema.prisma

# 🔨 Build backend
RUN pnpm --filter backend build

# ----------- Runtime stage -----------
FROM node:20-alpine

WORKDIR /app

# Install curl and postgresql-client for database checks
RUN apk add --no-cache curl postgresql-client

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/backend/package.json ./backend/
RUN pnpm install --prod --frozen-lockfile

# ✅ Copy both Prisma parts from hoisted root
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema
COPY --from=builder /app/backend/prisma ./backend/prisma

# Copy built code
COPY --from=builder /app/backend/dist ./backend/dist

# Copy and set up scripts
COPY backend/start.sh /app/start.sh
COPY backend/init-db.sh /app/init-db.sh
RUN chmod +x /app/start.sh /app/init-db.sh

# Create necessary directories
RUN mkdir -p /app/backend/cache /var/log

EXPOSE 3012

# Start the application using the start script
CMD ["/app/start.sh"]
    