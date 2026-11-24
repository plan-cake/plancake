
.PHONY: help up build down restart logs-api logs-web shell-api shell-web migrate makemigrations url

# Determine the Docker image tag based on the current Git branch. If the branch is not
# "main", use the version from the frontend package.json to identify the Docker image.
# Otherwise, default to latest.
CURRENT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
IMAGE_TAG := latest
ifneq ($(CURRENT_BRANCH),main)
  # Get the version from the frontend package.json for identifying the Docker image.
  PKG_VERSION := $(shell node -p "require('./frontend/package.json').version")
  IMAGE_TAG := v$(PKG_VERSION)
endif

# Allow `make migrate <migration>` (e.g. `make migrate 0027`). The extra word is captured
# as the target migration and turned into a no-op target so make doesn't try to build it.
ifeq (migrate,$(firstword $(MAKECMDGOALS)))
  MIGRATION := $(word 2,$(MAKECMDGOALS))
  ifneq ($(MIGRATION),)
    $(eval $(MIGRATION):;@:)
  endif
endif

# Your host user and group IDs. Commands that write files into the bind-mounted source
# tree run as this user, so the files aren't owned by root on Linux hosts.
HOST_USER := $(shell id -u):$(shell id -g)

# --- COMMANDS ---

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  up                Pulls the images for this version and starts the environment in the background."
	@echo "                    Falls back to a local build if the image isn't published."
	@echo "  build             Creates a full local rebuild from scratch (bypasses the registry) and prints out the URLs for local and network access."
	@echo "  down              Stops the environment completely and removes the connected containers and networks."
	@echo "  restart           Restarts the containers without rebuilding them. Use this for things like env changes."
	@echo "  logs-api          Stream the Django backend logs."
	@echo "  logs-web          Stream the Next.js frontend logs."
	@echo "  url               Print the local and network URLs."
	@echo "  shell-api         Open a terminal inside the backend container."
	@echo "  shell-web         Open a terminal inside the frontend container."
	@echo "  migrate [target]  Run Django migrations inside the running container."
	@echo "                    Pass a migration to migrate the api app to it, e.g. 'make migrate 0027' or 'make migrate zero'."
	@echo "  makemigrations    Generate new Django migrations inside the running container."

# Pulls the image from the registry and starts the containers in the background. If the
# image for this tag isn't published (e.g. a new version branch that hasn't been pushed),
# Compose builds it locally from the `build:` section instead.
up:
	@IMAGE_TAG=$(IMAGE_TAG) docker compose pull --ignore-pull-failures
	@IMAGE_TAG=$(IMAGE_TAG) docker compose up -d && \
	echo "" && \
	echo "Using image tag $(IMAGE_TAG)" && \
	echo "" && \
	echo "Plancake Industries" && \
	echo "   - Local:   http://localhost:3000" && \
	echo "   - Network: $$(node scripts/print-ip.js)" && \
	echo ""

# Creates a full local rebuild from scratch (bypasses the registry)
build:
	@IMAGE_TAG=$(IMAGE_TAG) docker compose up -d --build && \
	echo "" && \
	echo "Plancake Industries" && \
	echo "   - Local:   http://localhost:3000" && \
	echo "   - Network: $$(node scripts/print-ip.js)" && \
	echo ""

# Stops the environment completely and removes the connected containers and networks.
down:
	docker compose down

# Restarts the containers without rebuilding them. Use this for things like env changes.
restart:
	docker compose restart

# --- LOGS ---

# Stream the Django backend logs
logs-api:
	docker compose logs -f backend

# Stream the Next.js frontend logs
logs-web:
	docker compose logs -f frontend

# --- SHELLS & COMMANDS ---

# Print out the URLs for the local and network access.
url:
	@echo "" && \
	echo "Plancake Industries" && \
	echo "   - Local:   http://localhost:3000" && \
	echo "   - Network: $$(node scripts/print-ip.js)" && \
	echo ""

# Open a terminal inside the frontend container
shell-web:
	docker compose exec -it frontend /bin/sh

# Open a terminal inside the backend container
shell-api:
	docker compose exec -it backend /bin/bash

# Run Django migrations inside the running container. With a target migration, migrates
# the api app to it.
migrate:
	docker compose exec backend python manage.py migrate $(if $(MIGRATION),api $(MIGRATION))

# Generate new Django migrations inside the running container. Runs as your host user so
# the new migration files aren't owned by root on Linux.
makemigrations:
	docker compose exec --user $(HOST_USER) backend python manage.py makemigrations api
