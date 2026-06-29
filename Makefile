# Makefile

.PHONY: up down restart logs-api logs-web shell-api shell-web migrate makemigrations

# Start the environment in the background
up:
	@docker-compose up -d --build && \
	echo "" && \
	echo "Plancake Industries" && \
	echo "   - Local:   http://localhost:3000" && \
	echo "   - Network: $$(node scripts/print-ip.js)" && \
	echo ""

# Stop the environment completely
down:
	docker-compose down

# Restart the containers quickly
restart:
	docker-compose restart

# --- LOGS ---

# Stream the Django backend logs
logs-api:
	docker-compose logs -f backend

# Stream the Next.js frontend logs
logs-web:
	docker-compose logs -f frontend

# --- SHELLS & COMMANDS ---

# Open a terminal inside the Django container
shell-api:
	docker-compose exec backend /bin/bash

# Open a terminal inside the Next.js container
shell-web:
	docker-compose exec frontend /bin/sh

# Run Django migrations inside the running container
migrate:
	docker-compose exec backend python manage.py migrate

# Generate new Django migrations inside the running container
makemigrations:
	docker-compose exec backend python manage.py makemigrations