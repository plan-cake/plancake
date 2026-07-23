# Plancake

A scheduling website that solves the logistics problem of figuring out when everyone is available to meet.

## Tech Stack

| Layer            | Technology                           |
| :--------------- | :----------------------------------- |
| Frontend         | Next.js (React, TypeScript)          |
| Backend          | Django (ASGI, served via Uvicorn)    |
| Database         | PostgreSQL                           |
| Cache / Pub-Sub  | Redis (live updates + Celery broker) |
| Background Tasks | Celery (worker + beat)               |

## Project Structure

This is a monorepo containing both the frontend client and the backend API service.

```bash
plancake/
├── backend/    # Django API server
└── frontend/   # Next.js application
```

## Getting Started

This project can be run either natively or via Docker. Docker is the fastest way to get a consistent environment running locally; native setup is useful if you need finer-grained control over each service (e.g. running Celery, debugging with your IDE's native tooling).

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose (for the Docker setup)
- Node.js and Python (for native setup — see the linked READMEs below for versions)
- A PostgreSQL database (local, or a hosted option like [Supabase](https://supabase.com))

### `.env` Files

Copy the contents of the respective `.env.example` files in each folder into its own `.env`:

- [`backend/.env.example`](backend/.env.example) → `backend/.env`
- [`frontend/.env.example`](frontend/.env.example) → `frontend/.env`

The same `.env` setup is used both natively and in Docker. For more details about the database connection, see the [Backend Setup](backend/README.md) guide.

### Native Setup

For native setup, follow the setup instructions in these READMEs:

- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)

### Docker Setup

The project uses Docker Compose alongside a set of `make` commands that wrap common workflows. The Compose stack includes:

| Service    | Description                                                |
| :--------- | :--------------------------------------------------------- |
| `frontend` | Next.js dev server, hot-reloaded via a bind mount          |
| `backend`  | Django API server (Uvicorn), hot-reloaded via a bind mount |
| `redis`    | Backs live updates (pub/sub) and the Celery broker         |

> **Note:** PostgreSQL and Celery (worker/beat) are not included in the Compose stack. The backend connects to whatever database you configure in `backend/.env` (local or hosted), and scheduled background tasks (e.g. expired session cleanup) won't run unless you start Celery separately — see the [Backend Setup](backend/README.md) guide.

For a deeper look at how the Docker setup works — architecture, images, CI/CD, and known gaps — see [`docs/docker.md`](docs/docker.md).

#### Quick Start

```bash
make up
```

This pulls the latest published images and starts the stack in the background. Once it's running:

- Local: http://localhost:3000
- Network: printed to the terminal, for testing on other devices on your network

#### Make Commands

The most commonly used commands:

| Task         | Command        | Description                                                                   |
| :----------- | :------------- | :---------------------------------------------------------------------------- |
| Start/Resume | `make up`      | Pulls the latest images and starts the containers in the background           |
| Full Rebuild | `make build`   | Rebuilds images from source (bypasses the registry) and starts the containers |
| Stop         | `make down`    | Stops and removes containers and networks                                     |
| Restart      | `make restart` | Restarts containers without rebuilding (useful for `.env` changes)            |

See [`docs/docker.md`](docs/docker.md#makefile) for the full command list (logs, shells, migrations, and more) and run `make help` at any time to see it from the terminal.

_(To exit log streams, press `Ctrl+C`. To exit shell sessions, type `exit` or press `Ctrl+D`.)_

Named volumes are used to persist data like `node_modules` and the Redis cache across restarts — see [`docs/docker.md`](docs/docker.md#named-volumes) for details on wiping them.
