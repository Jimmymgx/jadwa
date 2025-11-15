# Setup Guide - Jadwa Platform

## 📋 Quick Start

### 1. Backend Setup (All in `backend/` directory)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MySQL credentials:
# DATABASE_URL="mysql://root:password@localhost:3306/jadwa"
# JWT_SECRET="your-secret-key"
# PORT=3000
# FRONTEND_URL="http://localhost:3001"

# Create MySQL database
# Run: CREATE DATABASE jadwa;

# Generate Prisma Client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Frontend Setup (Next.js in root directory)

```bash
# From project root
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Start Next.js development server
npm run dev
```

Frontend will run on `http://localhost:3001`

## 📁 Directory Structure

```
jadwa/
├── app/              # Next.js frontend (App Router)
├── components/       # React components
├── lib/             # Frontend utilities (API client, auth, types)
├── backend/         # ALL BACKEND CODE HERE
│   ├── server.js    # Express server with Socket.io
│   ├── routes/      # API routes
│   ├── prisma/      # Prisma schema
│   └── ...
└── package.json     # Frontend dependencies only
```

## 🔑 Important Notes

- ✅ **No Prisma in frontend** - Only in `backend/`
- ✅ **No Supabase** - Completely removed
- ✅ **No server folder** - All backend in `backend/`
- ✅ **Clean separation** - Frontend only uses HTTP API calls

## 🚀 Running the Application

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2** - Frontend:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3001` in your browser

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="mysql://root:password@localhost:3306/jadwa"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
FRONTEND_URL="http://localhost:3001"
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## ✅ Verification

- Backend running: `http://localhost:3000/health`
- Frontend running: `http://localhost:3001`
- Backend logs: Check terminal for "✓ Database connected successfully via Prisma"
