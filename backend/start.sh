#!/bin/sh

echo "Checking for Python dependency updates..."
pip install -r requirements.txt

echo "Applying database migrations..."
python manage.py migrate

echo "Starting Uvicorn server..."
exec uvicorn api.asgi:application --host 0.0.0.0 --port 8000 --reload
