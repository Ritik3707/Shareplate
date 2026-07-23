#!/bin/bash
set -e

echo "🚀 SharePlate Quick Start"
echo "========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start infrastructure
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U shareplate > /dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL is ready"

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

cd ..

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

cd ..

# Start services
echo "🚀 Starting services..."
echo ""
echo "Backend will run on: http://localhost:4000"
echo "Frontend will run on: http://localhost:5173"
echo "API Docs: http://localhost:4000/api/v1/docs"
echo ""

# Run backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Run frontend in background
cd frontend && npm run dev &
FRONTEND_PID=$!

# Trap to kill processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

echo "✅ SharePlate is running!"
echo "Press Ctrl+C to stop all services"
wait
