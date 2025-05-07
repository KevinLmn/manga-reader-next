# ----------- Build stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all relevant files from monorepo root
COPY .npmrc ./
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY tsconfig.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies (including hoisted ones)
RUN pnpm install --frozen-lockfile

# Copy full source after deps to maximize Docker cache
COPY . .

# Build the frontend app
RUN pnpm --filter frontend build

# ----------- Production stage -----------
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/frontend/package.json ./frontend/
RUN pnpm install --prod --frozen-lockfile

# Copy built assets from builder
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/next.config.js ./frontend/

# Set working directory to frontend
WORKDIR /app/frontend

EXPOSE 3011

# Start the application
ENV PORT=3011
CMD ["pnpm", "start"]