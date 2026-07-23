# SharePlate - How to Run

## Prerequisites

- **Node.js** 20+ (Download from [nodejs.org](https://nodejs.org))
- **Docker & Docker Compose** (Download from [docker.com](https://docker.com))
- **PostgreSQL 16** (if running manually)
- **Redis 7** (if running manually)

## Option 1: Docker Compose (Recommended - One Command)

The fastest way to run everything:

```bash
# 1. Navigate to project root
cd shareplate

# 2. Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# 3. Run database migrations and seed
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed

# 4. Open in browser
# Frontend: http://localhost
# Backend API: http://localhost:4000
# API Docs: http://localhost:4000/api/v1/docs
```

To stop:
```bash
docker-compose down
```

To rebuild after code changes:
```bash
docker-compose up -d --build
```

---

## Option 2: Manual Setup (Development)

### Step 1: Start Infrastructure

**Using Docker for just the database and cache:**
```bash
docker-compose up -d postgres redis
```

**Or install PostgreSQL and Redis manually on your system.**

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual API keys (optional for basic running)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server (with hot reload)
npm run dev

# Or build and run production
npm run build
npm start
```

Backend runs on **http://localhost:4000**

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Option 3: Using the Root Package (Monorepo)

```bash
cd shareplate

# Install all dependencies (backend + frontend)
npm install

# Start infrastructure
docker-compose up -d postgres redis

# Run backend migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start both backend and frontend simultaneously
npm run dev
```

---

## Default Login Credentials

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shareplate.org | SharePlate@Admin2024! |
| Donor | donor@example.com | Donor@2024! |
| NGO | ngo@example.com | Ngo@2024! |
| Volunteer | volunteer@example.com | Volunteer@2024! |

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Create account |
| `POST /api/v1/auth/login` | Login |
| `POST /api/v1/auth/verify-email` | Verify email with OTP |
| `POST /api/v1/auth/refresh` | Refresh access token |
| `POST /api/v1/auth/logout` | Logout |
| `GET /api/v1/donations` | List donations |
| `POST /api/v1/donations` | Create donation |
| `GET /api/v1/ngos` | List NGOs |
| `GET /api/v1/volunteers` | List volunteers |
| `GET /api/v1/health` | Health check |

Full API documentation at: **http://localhost:4000/api/v1/docs**

---

## Environment Variables

Key variables in `.env`:

```
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/shareplate
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Optional (for full features)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
SMTP_USER=...
SMTP_PASS=...
```

---

## Troubleshooting

### Port already in use
```bash
# Kill processes on port 4000 (backend) or 5173 (frontend)
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database connection failed
```bash
# Ensure PostgreSQL is running
docker-compose up -d postgres

# Or check PostgreSQL service
pg_isready -h localhost -p 5432
```

### Redis connection failed
```bash
# Ensure Redis is running
docker-compose up -d redis

# Test Redis
redis-cli ping
```

### Prisma errors
```bash
# Reset and regenerate
cd backend
npx prisma generate
npx prisma migrate reset
npx prisma db seed
```

### Node modules issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or manually:
cd backend && npm run build
cd frontend && npm run build
```

---

## Project Structure

```
shareplate/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/      # Database, Redis, Email, etc.
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Database access
│   │   ├── middleware/  # Auth, validation, rate limiting
│   │   ├── validators/  # Zod schemas
│   │   ├── routes/      # API routes
│   │   └── utils/       # Helpers, errors, response
│   └── prisma/
│       └── schema.prisma # Database schema
├── frontend/         # React 19 + Vite + TypeScript
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── store/       # Redux state management
│       └── api/         # API client
└── docker-compose.yml # Infrastructure orchestration
```
