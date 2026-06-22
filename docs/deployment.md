# Deployment Guide

How to build, run, and deploy FAITH Mobile (the web/PWA build) with Docker and
Dokploy. No project-specific tooling is required on the host beyond Docker.

---

## 1. Architecture at a glance

FAITH Mobile is an **Expo Router web app** exported to static files and served
by **nginx** inside a single container. nginx also proxies API calls to the
existing PHP backend, so the browser only ever talks to one origin.

```
Browser
  │  GET /home/leave      → index.html (Expo Router handles the route)
  │  GET /api/login       → nginx proxies → ${BACKEND_URL}/login (PHP backend)
  ▼
nginx container (static dist/ + /api proxy)
```

Build happens in two stages (see `Dockerfile`):

```
Stage 1 (node:20-alpine)   npm ci → expo export → /app/dist
Stage 2 (nginx:1.27-alpine) copy dist/ + config → serve on port 80
```

The final image contains only nginx and the static bundle (~30 MB); Node and
`node_modules` are discarded with the builder stage.

---

## 2. Files in this setup

| File                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `Dockerfile`                  | Multi-stage build: export web bundle, serve via nginx |
| `nginx/default.conf.template` | nginx config (SPA fallback + `/api` proxy)           |
| `.dockerignore`               | Keeps build context small and secrets out of the image |
| `docker-compose.yml`          | One-command local build + run                        |
| `.env.example`                | Template of required environment variables           |

---

## 3. Environment variables

Copy the template and fill in values:

```bash
cp .env.example .env
```

| Variable              | When      | Description                                                        | Example                                              |
| --------------------- | --------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | Build     | Base path the frontend calls; **baked into the JS bundle**.        | `/api`                                               |
| `BACKEND_URL`         | Run       | Where nginx proxies `/api/*` (the PHP backend, no trailing slash). | `https://endpoint.daythree.ai/faithMobile/routes`    |
| `PORT`                | Run (local) | Host port to expose the app on.                                  | `8080`                                               |

**Build-time vs run-time matters:** `EXPO_PUBLIC_API_URL` is compiled into the
bundle during the build and cannot be changed afterwards without rebuilding.
`BACKEND_URL` is read by nginx at container start, so the same image can point
at different backends just by changing the env var.

---

## 4. Local deployment (Docker Compose)

```bash
# 1. Configure
cp .env.example .env        # then edit values if needed

# 2. Build the image and start the container
docker compose up --build

# 3. Open the app
#    http://localhost:8080
```

Useful commands:

```bash
docker compose logs -f       # follow container logs
docker compose up -d --build # run in the background (detached)
docker compose down          # stop and remove the container
docker compose build --no-cache   # force a clean rebuild
```

### Without Compose (raw Docker)

```bash
docker build -t faithpwa --build-arg EXPO_PUBLIC_API_URL=/api .
docker run -p 8080:80 -e BACKEND_URL=https://endpoint.daythree.ai/faithMobile/routes faithpwa
```

---

## 5. Dokploy deployment

Dokploy builds the image from this repository on its own server and runs the
container — you do not push images manually.

1. **Create the application**
   - In Dokploy, create a new **Application** and connect this Git repository
     (provider + branch, e.g. `main`).
2. **Select the build type**
   - Choose **Dockerfile** as the build method. Dokploy detects the root
     `Dockerfile` automatically.
3. **Set environment variables**
   - In the application's **Environment** settings, add:
     - `EXPO_PUBLIC_API_URL=/api`
     - `BACKEND_URL=https://endpoint.daythree.ai/faithMobile/routes`
   - `EXPO_PUBLIC_API_URL` must be available at **build** time. If Dokploy's
     build args are separate from runtime env in your version, also add it as a
     **Build Argument**.
4. **Set the port**
   - The container serves on port **80**. Configure the application/proxy to
     forward to container port `80`.
5. **Domain & SSL**
   - Attach a domain and enable HTTPS from the Dokploy dashboard.
6. **Deploy**
   - Trigger **Deploy**. Dokploy clones the repo, runs `docker build`, and
     starts the container.

### Redeploying

Push to the connected branch (or click **Redeploy**). Dokploy rebuilds the
image and replaces the running container. Enable auto-deploy on push if desired.

```
git push  →  Dokploy  →  docker build  →  run container  →  live URL
```

---

## 6. Verifying a deployment

- App loads at the configured URL and renders the login screen.
- Refreshing on a deep route (e.g. `/home/leave`) loads the app, not a 404
  (confirms the SPA fallback).
- Login succeeds (confirms `/api` proxying reaches the PHP backend).
- `docker compose logs` / Dokploy logs show no nginx or proxy errors.

---

## 7. Assumptions & limitations

- **Web/PWA only.** This pipeline ships the Expo **web** export. Native
  iOS/Android builds are out of scope (handled via Expo/EAS separately).
- **Backend is external.** The PHP backend and its database are not part of this
  container; the app proxies to whatever `BACKEND_URL` points at.
- **Stateless container.** The frontend stores nothing on disk, so no volumes
  are required; containers can be recreated freely.
- **`EXPO_PUBLIC_*` values are public.** They are embedded in the client bundle
  and must never hold secrets.
- **CORS.** Because the browser calls the same origin (`/api`) and nginx proxies
  server-side, no CORS configuration is needed in production.
