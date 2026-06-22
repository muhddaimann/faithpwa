# ===== Stage 1: build the static web bundle =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only the dependency manifests first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Bake the public API base path into the bundle at build time
ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# Copy the rest of the source and export the web build to /app/dist
COPY . .
RUN npx expo export --platform web --output-dir dist

# ===== Stage 2: serve the bundle with nginx =====
FROM nginx:1.27-alpine

# Default backend; override at runtime with -e BACKEND_URL=... or compose env.
# Ensures envsubst always has a value so nginx never starts with an empty proxy.
ENV BACKEND_URL=https://endpoint.daythree.ai/faithMobile/routes

# nginx renders this template (envsubst) into a real config at startup
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Ship only the static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
