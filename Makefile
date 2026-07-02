
.PHONY: help up down restart logs-api logs-web shell-api shell-web migrate makemigrations

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  up                Starts the environment in the background and prints out the URLs for local and network access."
	@echo "  down              Stops the environment completely and removes the connected containers, networks, and volumes."
	@echo "  restart           Restarts the containers without rebuilding them. Use this for things like env changes."
	@echo "  logs-api          Stream the Django backend logs."
	@echo "  logs-web          Stream the Next.js frontend logs."
	@echo "  shell-api         Open a terminal inside the backend container."
	@echo "  shell-web         Open a terminal inside the frontend container."
	@echo "  migrate           Run Django migrations inside the running container."
	@echo "  makemigrations    Generate new Django migrations inside the running container."

# Starts the enviroment in the background and prints out the URLs for the local and
# network access. The command includes a build flag to ensure that the latest changes
# are reflected in the containers.
up:
	@docker compose up -d --build && \
	echo "" && \
	echo "Plancake Industries" && \
	echo "   - Local:   http://localhost:3000" && \
	echo "   - Network: $$(node scripts/print-ip.js)" && \
	echo ""

# Stops the environment completely and removes the connected containers, networks,
# and volumes.
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

# Run Django migrations inside the running container
migrate:
	docker compose exec backend python manage.py migrate

# Generate new Django migrations inside the running container
makemigrations:
	docker compose exec backend python manage.py makemigrations
