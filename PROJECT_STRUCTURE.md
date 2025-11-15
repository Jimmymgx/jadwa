# Jadwa Platform - Project Structure

## 📁 Directory Structure

```
jadwa/
├── app/                    # Next.js App Router (Frontend)
│   ├── dashboard/
│   │   └── client/
│   ├── login/
│   ├── register/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/             # Reusable React components (Frontend)
│   └── DashboardLayout.tsx
│
├── lib/                    # Frontend utilities (Frontend)
│   ├── api.ts             # HTTP API client
│   ├── auth.ts            # Authentication helpers
│   └── types.ts           # TypeScript types
│
├── backend/                # Backend API Server (ALL BACKEND CODE HERE)
│   ├── config/
│   │   └── database.js     # Prisma Client configuration
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   └── api.js         # Generic CRUD routes
│   ├── utils/
│   │   └── queryBuilder.js # Query building utilities
│   ├── prisma/
│   │   └── schema.prisma  # Database schema (Prisma)
│   ├── server.js          # Main Express server with Socket.io
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
│
├── mysql/                  # MySQL migration files
│   └── migrations/
│       └── 001_create_core_tables.sql
│
├── package.json           # Frontend dependencies (Next.js)
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── README.md             # Main project documentation
```

## 🔑 Key Points

### Frontend (Next.js App)
- **Location**: Root directory (`app/`, `components/`, `lib/`)
- **Dependencies**: Only frontend packages (Next.js, React, Tailwind, Socket.io-client)
- **No Backend Code**: Frontend only makes HTTP API calls via `lib/api.ts`
- **No Database Access**: Frontend never directly accesses MySQL or Prisma

### Backend (Express + Prisma)
- **Location**: `backend/` directory
- **All Backend Code**: Everything is in `backend/`
- **Prisma**: Only used in backend, not in frontend
- **Database**: MySQL accessed via Prisma in backend only
- **Socket.io**: Server-side WebSocket handling in `backend/server.js`

## 🚫 What's NOT Included

- ❌ No Prisma in frontend `package.json`
- ❌ No Supabase anywhere
- ❌ No `server/` folder (all backend in `backend/`)
- ❌ No direct database access from frontend

## 📦 Dependencies

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "next": "^15.1.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.17",
    "socket.io-client": "^4.8.1",
    // ... other frontend deps
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "express": "^4.21.1",
    "mysql2": "^3.11.5",
    "socket.io": "^4.8.1",
    "prisma": "^5.22.0",
    // ... other backend deps
  }
}
```

## 🔄 How It Works

1. **Frontend** (Next.js) makes HTTP requests to `http://localhost:3000/api/*`
2. **Backend** (`backend/server.js`) handles requests and uses Prisma to query MySQL
3. **Socket.io** enables real-time chat (client connects to backend WebSocket server)
4. **No Direct DB Access**: Frontend never touches the database directly

## ✅ Clean Separation

- ✅ All backend code in `backend/` directory
- ✅ Prisma only in backend
- ✅ Frontend is pure Next.js with API calls
- ✅ No mixing of concerns
