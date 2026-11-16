#!/usr/bin/env bash
set -e

echo "============================================="
echo "   Cement Plant Digital Twin - Docker Start   "
echo "============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker and Docker Compose."
    exit 1
fi

# Create .env from .env.example if missing
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Building and starting all containers in the background..."
docker compose up --build -d

echo ""
echo "============================================="
echo "  All services started successfully!"
echo "============================================="
echo "  • Main Dashboard:   http://localhost:5174"
echo "  • Gypsum Widget:    http://localhost:5174/gypsum"
echo "  • Materials Widget: http://localhost:5174/materials"
echo "  • Backend API:      http://localhost:4000/api/items"
echo "  • MQTT Broker:      localhost:1883"
echo "============================================="
echo "To view logs:   docker compose logs -f"
echo "To stop:        docker compose down"
echo "============================================="

