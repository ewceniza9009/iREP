# #!/bin/bash

# # Exit immediately if a command exits with a non-zero status.
# set -e

# echo "🚀 Starting iREP development environment..."

# # Start infrastructure services in the background
# echo "🔧 Initializing infrastructure (PostgreSQL, MongoDB, Redis)..."
# docker-compose up -d postgres mongo redis

# # Wait a few seconds for databases to be ready
# echo "⏳ Waiting for infrastructure services to stabilize..."
# sleep 10

# # Run services in development mode with hot-reloading
# # Using concurrently to run all services in parallel
# npm install -g concurrently

# echo "🔥 Starting all services with hot-reload..."

# concurrently \
#   "cd services/api-gateway && npm run start:dev" \
#   "cd services/listings-service && npm run start:dev" \
#   "cd services/projects-service && npm run start:dev" \
#   "cd services/accounting-service && npm run start:dev" \
#   "cd services/tenants-service && npm run start:dev" \
#   "cd services/realtime-gateway && dotnet watch run" \
#   "cd frontend && npm run dev"

#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting iREP development environment..."

# The 'up' command will automatically respect the health checks and dependencies
# defined in the docker-compose.yml file. This is the most reliable way to start.
echo "🔧 Initializing all services via docker-compose..."
docker-compose --profile dev up --build --force-recreate

echo "✅ iREP development environment is now running. Check container logs for details."