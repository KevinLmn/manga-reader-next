# ----------- Build stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all relevant files from monorepo root
COPY .npmrc ./
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY tsconfig.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies (including hoisted ones)
RUN pnpm install --frozen-lockfile

# Copy full source after deps to maximize Docker cache
COPY . .

# Generate Prisma Client
RUN pnpm --filter backend prisma generate

# Build the backend app
RUN pnpm --filter backend build

# ----------- Production stage -----------
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/backend/package.json ./backend/
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma schema and generated client
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built assets from builder
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 3012

# Start the application
CMD ["node", "backend/dist/index.js"]
    