# This Dockerfile is used to build the production image for the frontend.

# The node version is specified as a build argument for ease of updating to the most
# stable version of Node.js in the future.
ARG NODE_VERSION=22-alpine

## INSTALL DEPENDENCIES
FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

## BUILD IMAGE
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN npm run build

## RUN APPLICATION
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy production assets
COPY --from=builder --chown=node:node /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Use the non-root "node" user
USER node

EXPOSE 3000

CMD ["node", "server.js"]
