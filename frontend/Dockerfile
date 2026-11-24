# This Dockerfile is used to build the production image for the frontend.

# The node version is specified as a build argument for ease of updating to the most
# stable version of Node.js in the future.
ARG NODE_VERSION=22-alpine

## INSTALL DEPENDENCIES
FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

# Install dependencies. The patches are needed for the patch-package postinstall step.
COPY package.json package-lock.json* ./
COPY patches ./patches
RUN npm ci

## BUILD IMAGE
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# NEXT_PUBLIC_* variables are inlined into the client bundle at build time, so they
# must be passed in as build arguments (.env is excluded from the build context).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_FEEDBACK_FORM_URL
ARG NEXT_PUBLIC_DEBUG=false
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY} \
    NEXT_PUBLIC_FEEDBACK_FORM_URL=${NEXT_PUBLIC_FEEDBACK_FORM_URL} \
    NEXT_PUBLIC_DEBUG=${NEXT_PUBLIC_DEBUG} \
    NEXT_STANDALONE=true

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
