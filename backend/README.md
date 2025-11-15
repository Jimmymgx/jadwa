# Jadwa Backend API

Backend API server for the Jadwa consulting platform, built with Express.js, Prisma, and MySQL.

## Features

- RESTful API endpoints
- JWT authentication
- Prisma ORM for type-safe database queries
- MySQL database support
- Role-based access control
- CORS enabled for frontend integration

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/jadwa"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

### 3. Set Up Database

Create the MySQL database:
```sql
CREATE DATABASE jadwa;
```

### 4. Run Prisma Migrations

Generate Prisma Client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client based on the schema
- Create all tables in your MySQL database

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify` - Verify JWT token

### Generic CRUD Operations

All tables support the following operations:

- `GET /api/:table` - Query records (supports filters, ordering, pagination)
- `POST /api/:table` - Create a new record
- `PUT /api/:table` - Update a record
- `DELETE /api/:table` - Delete a record

### Available Tables

- `users` - User accounts
- `consultants` - Consultant profiles
- `consultations` - Consultation sessions
- `messages` - Chat messages
- `study_requests` - Feasibility studies
- `payments` - Payment transactions
- `payouts` - Consultant payouts
- `support_tickets` - Support tickets
- `notifications` - User notifications
- `ratings` - Consultant ratings
- `admin_logs` - Admin activity logs

## Query Parameters

### GET Requests

- `select` - Comma-separated list of fields to return
- `order` - Format: `field:asc` or `field:desc`
- `limit` - Maximum number of results
- `join` - Join relations (format: `table:condition`)
- Any field name - Filter by exact match (e.g., `?status=active`)
- Field with `__in` suffix - Filter by array (e.g., `?status__in=["active","pending"]`)

### Example Queries

```bash
# Get all active users
GET /api/users?status=active

# Get consultants with their user info
GET /api/consultants?join=users:consultants.user_id=users.id

# Get consultations ordered by date
GET /api/consultations?order=created_at:desc&limit=10
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Development

### Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

### Project Structure

```
backend/
├── config/
│   └── database.js      # Prisma Client configuration
├── middleware/
│   └── auth.js         # Authentication middleware
├── routes/
│   ├── auth.js         # Authentication routes
│   └── api.js          # Generic CRUD routes
├── utils/
│   └── queryBuilder.js # Query building utilities
├── prisma/
│   └── schema.prisma   # Database schema
├── server.js           # Main server file
├── .env.example       # Environment variables template
└── package.json       # Dependencies
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment-specific database credentials
5. Enable HTTPS
6. Set up process manager (PM2, etc.)

## License

Proprietary and confidential.
