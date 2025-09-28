# Dear Diary Deployment Script for Windows
Write-Host "🚀 Starting Dear Diary Deployment..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "⚠️  Please edit .env file with your configuration before continuing." -ForegroundColor Yellow
    Write-Host "Press Enter when ready..."
    Read-Host
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images
Write-Host "🧹 Cleaning up old images..." -ForegroundColor Yellow
docker-compose down --rmi all

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run migrations
Write-Host "📊 Running database migrations..." -ForegroundColor Yellow
docker-compose exec backend npm run migrate

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application is available at:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📊 To view logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor White
