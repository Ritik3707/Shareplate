# SharePlate

> **"Reducing Food Waste. Feeding Lives."**

SharePlate is an enterprise-grade food donation platform connecting food donors (restaurants, hotels, grocery stores, households) with NGOs, shelters, and volunteers to deliver surplus food to people in need.

## Features

- **Multi-Role Platform**: Donors, NGOs, Volunteers, and Admins
- **Real-time Tracking**: Live donation status and volunteer location
- **AI-Powered Matching**: Smart food-to-NGO matching and demand prediction
- **Google Maps Integration**: Route optimization and geofencing
- **Secure Authentication**: JWT, Google OAuth, role-based access
- **Payment Processing**: Stripe integration for NGO donations
- **Analytics Dashboard**: Impact tracking and waste analytics
- **Mobile-Responsive**: Works on all devices

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis (caching & rate limiting)
- Socket.io (real-time)
- JWT + Google OAuth (authentication)

### Frontend
- React 19 + Vite + TypeScript
- Tailwind CSS + Material UI
- Redux Toolkit + React Query
- React Router + Framer Motion

### Infrastructure
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Cloudinary (image storage)
- Firebase Cloud Messaging (notifications)

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (if not using Docker)
- Redis 7 (if not using Docker)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/shareplate.git
cd shareplate

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost
# Backend API: http://localhost:4000
# API Docs: http://localhost:4000/api/v1/docs
```

### Manual Setup

```bash
# Install dependencies
npm install

# Setup database
cp .env.example .env
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

## Project Structure

```
shareplate/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database access
│   │   ├── middleware/     # Express middleware
│   │   ├── validators/     # Input validation
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration
│   │   ├── events/         # Event handlers
│   │   ├── jobs/           # Background jobs
│   │   ├── utils/          # Utilities
│   │   ├── interfaces/     # TypeScript interfaces
│   │   ├── constants/      # Constants
│   │   └── types/          # Type definitions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── tests/              # Test suites
├── frontend/
│   ├── src/
│   │   ├── api/            # API clients
│   │   ├── hooks/          # Custom hooks
│   │   ├── components/     # React components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route definitions
│   │   ├── contexts/       # React contexts
│   │   ├── store/          # Redux store
│   │   ├── services/       # Frontend services
│   │   ├── constants/      # Constants
│   │   ├── utils/          # Utilities
│   │   └── types/          # Type definitions
│   └── public/             # Static assets
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── docker-compose.yml      # Docker orchestration
```

## API Documentation

Once the backend is running, visit `/api/v1/docs` for interactive Swagger documentation.

## Authentication

- **Email/Password**: Register with email, verify via OTP
- **Google OAuth**: One-click login with Google
- **JWT**: Access tokens (15min) + Refresh tokens (7 days)
- **Role-Based**: Donor, NGO, Volunteer, Admin permissions

## Roles & Permissions

| Role | Description | Key Features |
|------|-------------|--------------|
| **Guest** | Unauthenticated visitor | Browse, view donations |
| **Donor** | Food donor | Create donations, track pickups, impact dashboard |
| **NGO** | Non-profit organization | Receive donations, manage volunteers, distribution reports |
| **Volunteer** | Delivery volunteer | Accept pickups, route navigation, performance tracking |
| **Admin** | Platform administrator | User management, fraud detection, analytics |

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend
```

## Deployment

### Production Checklist
- [ ] Change all default secrets
- [ ] Configure SSL certificates
- [ ] Setup production database
- [ ] Configure CDN for static assets
- [ ] Setup monitoring and alerting
- [ ] Configure backup strategy

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## License

MIT License - see LICENSE file for details.

## Contributing

We welcome contributions! Please read our Contributing Guide and Code of Conduct.

## Support

For support, email support@shareplate.org or join our Discord community.

---

Built with love for a world without hunger.
