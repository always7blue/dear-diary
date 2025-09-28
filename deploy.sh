#!/bin/bash

# Dear Diary Deployment Script
echo "🚀 Starting Dear Diary Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "Press Enter when ready..."
    read
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images
echo "🧹 Cleaning up old images..."
docker-compose down --rmi all

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec backend npm run migrate

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Deployment completed!"
echo ""
echo "🌐 Application is available at:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:5000"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
