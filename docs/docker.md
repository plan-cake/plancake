# Docker System Overview

This document explains how Plancake's Docker setup is put together: the services, the images, the `make` workflow, and the CI pipelines that build and publish them.

For quick-start commands, read alongside the [root README](../README.md).

## Architecture

```
                ┌────────────┐        ┌────────────┐
   :3000  ───▶  │  frontend  │──────▶ │  backend   │  ───▶  :8000
                │  (Next.js) │        │  (Django,  │
                └────────────┘        │  Uvicorn)  │
                                      └─────┬──────┘
                                            │
                                      ┌─────▼──────┐
                                      │   redis    │
                                      └────────────┘
```

- **frontend** — Next.js dev server. Talks to the backend over the internal Docker network (`http://backend:8000`).
- **backend** — Django served via Uvicorn. Talks to Redis for live updates and the Celery broker, and to whatever PostgreSQL database is configured in `backend/.env`.
- **redis** — backs two things: the pub/sub channel used for live updates on the results page, and the Celery broker (`CELERY_BROKER_URL`).

**Not included in the Compose stack:** PostgreSQL and Celery (worker/beat).

- The database is expected to already exist — locally installed, or hosted (e.g. Supabase) — and is configured entirely through `backend/.env`. Containerizing it wasn't necessary since most contributors are already pointed at a hosted dev database.
- Celery only drives the `daily_duties` scheduled task (session/token/reset-code cleanup at midnight). It's not required for day-to-day feature work, so it's left out to keep the stack lighter. If you need it, run it natively alongside the containers (`backend/README.md` has the commands) — its broker URL already matches redis's Docker port (`redis://localhost:6379/0`), so it'll happily connect to the containerized Redis.

## Images

### Backend (`backend/Dockerfile` and `backend/Dockerfile.dev`)

Single-stage image based on `python:3.13-slim`. Installs `requirements.txt`, copies the app, and drops to a non-root user before running Uvicorn. The production and dev images are very similar, with the only difference being the use of the non-root user.

In Compose, the `Dockerfile.dev` is used for local dev and `docker-compose.yml` overrides its `command` to run `backend/start.sh` instead (which re-installs dependencies and runs with `--reload`), and bind-mounts the local `./backend` directory over `/app` so code changes are picked up live.

### Frontend (`frontend/Dockerfile` and `frontend/Dockerfile.dev`)

Two separate images, matching the prod/dev split:

- **`Dockerfile`** — multi-stage production build (`dependencies` → `builder` → `runner`). Uses Next.js's standalone output to keep the final image small, and runs as the built-in non-root `node` user.
- **`Dockerfile.dev`** — single-stage, installs deps and runs `npm run dev` directly. This is what Compose builds locally, and also what's built and published by CI (see below).

### `.dockerignore`

Both `backend/` and `frontend/` have a `.dockerignore` to keep build contexts small — excluding things like `node_modules`, `.next`, virtualenvs, `__pycache__`, logs, and env files. Worth checking when adding new local-only directories so they don't bloat build context/image size.

## `docker-compose.yml`

- Both `backend` and `frontend` declare an `image:` (pointed at the registry) **and** a `build:` context. This means:
  - `docker compose pull` / `make up` pulls the pre-built image for the given `IMAGE_TAG`.
  - `docker compose up --build` / `make build` builds locally from source instead, ignoring the registry.
- `env_file` pulls in `backend/.env` and `frontend/.env` — the same files used for native setup.
- A few environment variables are set directly in the compose file rather than `.env`, because they depend on the container network rather than the developer's machine (e.g. `INTERNAL_API_URL=http://backend:8000`, `CELERY_BROKER_URL`, `LIVE_UPDATES_URL`).

### Named Volumes

Three named volumes are declared: `redis_data`, `node_modules`, and `next_cache`. They persist state across `make down`/`make up` cycles so you're not reinstalling `node_modules` or losing Redis data every restart, and so dangling anonymous volumes don't build up on your machine every time `make down` runs.

If you ever need to wipe all data and start fresh, remove the volumes with:

```bash
docker compose down -v
```

## `Makefile`

The `Makefile` wraps the common Compose commands so contributors don't need to remember Compose flags or env vars. Run `make help` to see the full list. A few worth calling out:

- `make up` vs `make build` — `up` pulls published images (fast, no local build); `build` builds from your working tree (needed if you've changed a Dockerfile or want to test uncommitted backend/frontend changes without publishing).
- `IMAGE_TAG` — determines which image tag is pulled/built. Currently pinned to `latest`; the intent (see the commented-out logic above it) is to eventually derive this from the branch/`package.json` version so non-`main` branches can pull their own tagged images. That branch-based logic isn't wired up yet — flagging this here as a known follow-up rather than finished behavior.
- `make shell-api` / `make shell-web` — open a shell in the running container for one-off debugging (`python manage.py shell`, inspecting `node_modules`, etc.) without needing to rebuild.

This is the full list current supported commands:

| Task              | Command               | Description                                                                   |
| :---------------- | :-------------------- | :---------------------------------------------------------------------------- |
| Start/Resume      | `make up`             | Pulls the latest images and starts the containers in the background           |
| Full Rebuild      | `make build`          | Rebuilds images from source (bypasses the registry) and starts the containers |
| Stop              | `make down`           | Stops and removes containers and networks                                     |
| Restart           | `make restart`        | Restarts containers without rebuilding (useful for `.env` changes)            |
| Backend Logs      | `make logs-api`       | Streams the backend Django logs                                               |
| Frontend Logs     | `make logs-web`       | Streams the frontend Next.js logs                                             |
| URLs              | `make url`            | Displays local and network URLs                                               |
| API Shell         | `make shell-api`      | Opens a shell in the backend container                                        |
| Frontend Shell    | `make shell-web`      | Opens a shell in the frontend container                                       |
| Run Migrations    | `make migrate`        | Runs Django migrations inside the running container                           |
| Create Migrations | `make makemigrations` | Generates new Django migrations inside the running container                  |

## CI/CD Workflows

### `publish-images.yml`

Runs on every push to `main` or a version branch (`v*.*.*`). Builds and pushes both images to GHCR using Buildx, multi-platform (`linux/amd64,linux/arm64`) via QEMU, with GitHub Actions cache (`cache-from`/`cache-to`) to speed up repeat builds.

- Backend is built from `backend/Dockerfile` (the production image).
- Frontend is built from `frontend/Dockerfile.dev` — **not** the production `Dockerfile`. This was to get a working image published quickly during development; before this goes out as the "real" published image, it should probably be switched to build from the production Dockerfile instead.
- Tags: `type=ref,event=branch` (branch name) plus `latest` on the default branch, via `docker/metadata-action`.

### `clean-up.yml`

This cleaning job runs weekly every Sunday night and also can be manually enabled. It uses `snok/container-retention-policy` to delete old images from GHCR, keeping the 3 most recent per image and anything newer than a week.

### `merge-protect.yml`

Not Docker-specific, but lives with these workflows: gates PRs into `main` so they can only come from a version branch (`vX.Y.Z`) whose name matches `frontend/package.json`'s version. Keeps `main` (and therefore the `latest` tag published by `publish-images.yml`) in sync with an actual release version.

## Known Gaps / Follow-ups

- No Celery worker/beat service in Compose — daily cleanup task won't run unless started natively.
- No PostgreSQL service in Compose — a database must already exist and be reachable from `backend/.env`.
- Frontend CI publishes the dev image (`Dockerfile.dev`), not the production build.

These aren't blockers for local development, but should be resolved before treating the published images as production-ready.
