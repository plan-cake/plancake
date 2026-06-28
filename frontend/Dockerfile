# This Dockerfile is used to build the production image for the frontend.

# BUILD IMAGE
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy project files and build
COPY . .
RUN npm run build

# PRODUCTION IMAGE
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]