# Plancake

A scheduling website that solves the logistics problem of figuring out when everyone is available to meet.

## Project Structure

This is a monorepo containing both the frontend client and the backend API service.

```bash
plancake/
├── backend/    # Django API server
└── frontend/   # Next.js application
```

## Getting Started

This project can be run either natively or via Docker.

#### `.env` Files

Copy the contents of the respective `.env.example` files in each folder into its own `.env`. The same `env` setup is used both natively and in Docker.

For more details about the database connection, take a look at the backend README linked below.

### Native Setup

For native setup, follow the setup instructions in these READMEs:

- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)

### Docker Setup

The project uses Docker Compose and a set of Make commands that help setup the developement enviroment. It includes the frontend, backend, and Redis services required to run and support live updates.

#### Make Commands

| Task              | Command               | Description                                           |
| :---------------- | :-------------------- | :---------------------------------------------------- |
| Start/Resume      | `make up`             | Starts the containers in the background with a build  |
| Stop              | `make down`           | Stops and removes containers and networks             |
| Restart           | `make restart`        | Restarts containers (useful for `.env` changes)       |
| Backend Logs      | `make logs-api`       | Streams the backend Django logs                       |
| Frontend Logs     | `make logs-web`       | Streams the frontend Next.js logs                     |
| URLs              | `make url`            | Displays local and network URLs                       |
| API Shell         | `make shell-api`      | Opens a bash shell in the backend container           |
| Frontend Shell    | `make shell-web`      | Opens a bash shell in the frontend container          |
| Run Migrations    | `make migrate`        | Runs Django migrations                                |
| Create Migrations | `make makemigrations` | Creates new Django migration inside running container |

_(Note: To exit log streams, just `Ctrl + C`. To exit shell sessions, type `exit` or `Ctrl + D`)_

#### Named Volumes

Named volumes are used to prevent the build up with dangling volumes on your machine every time `make down` is run. It persists cached data (like `node_modules` and the redis cache) through each new container instance.

If you ever need to completely wipe the data and start with a clean slate, the volumes must be removed with `docker compose down -v`.
