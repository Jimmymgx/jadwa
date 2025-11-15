# Jadwa Consulting Platform - Full Stack Application

A comprehensive full-stack web application connecting clients with consultants, featuring video consultations, real-time chat, feasibility studies, and a powerful admin dashboard.

## 🧱 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **Framer Motion** - Smooth animations
- **Socket.io Client** - Real-time communication
- **Zustand** - State management

### Backend
- **Node.js + Express** - RESTful API server (located in `backend/` directory)
- **Prisma ORM** - Type-safe database access (backend only)
- **MySQL** - Database
- **Socket.io** - Real-time WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Features

### 👤 Client Interface
- ✅ Register/Login (email/password)
- ✅ Dashboard with statistics
- ✅ Video Consultation booking
- ✅ Real-time Chat Consultation
- ✅ Feasibility Study requests
- ✅ Economic Analysis & Reports
- ✅ My Requests tracking
- ✅ My Documents section
- ✅ Notifications
- ✅ Support Ticket System

### 👨‍🏫 Consultant Interface
- ✅ Login (admin-verified)
- ✅ Dashboard (sessions, chats, balance)
- ✅ Profile management
- ✅ Consultation management
- ✅ Chat with clients
- ✅ Study assignments
- ✅ Earnings tracking & payouts
- ✅ Ratings & reviews

### 🧑‍💼 Admin/Operator Dashboard
- ✅ Secure login with roles
- ✅ Dashboard overview (stats, revenue)
- ✅ Users Management
- ✅ Consultations oversight
- ✅ Finance management
- ✅ Reports & Analytics
- ✅ Support Center
- ✅ Content Management
- ✅ Notifications system
- ✅ Roles Management
- ✅ Activity Logs

## 📦 Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/jadwa"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
FRONTEND_URL="http://localhost:3001"
NODE_ENV=development
```

4. Set up database:
```sql
CREATE DATABASE jadwa;
```

5. Run Prisma migrations (in backend directory):
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

6. Start backend server:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3001`

## 📁 Project Structure

```
jadwa/
├── app/                    # Next.js App Router pages
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   │   ├── client/
│   │   ├── consultant/
│   │   └── admin/
│   └── layout.tsx
├── components/             # Reusable React components
├── lib/                    # Utilities (API, auth, types)
├── backend/                # Express backend
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── prisma/
│   └── server.js
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify JWT token

### Generic CRUD
- `GET /api/:table` - List records
- `POST /api/:table` - Create record
- `PUT /api/:table` - Update record
- `DELETE /api/:table` - Delete record

### Consultations
- `GET /api/consultations/my` - List current user's consultations
- `POST /api/consultations/book` - Create consultation booking (client)
- `PUT /api/consultations/:id/status` - Update status (consultant/client/admin)

### Study Requests
- `GET /api/study-requests/my` - List current user's study requests
- `POST /api/study-requests` - Create study/economic analysis/report request (client)
- `PUT /api/study-requests/:id/quote` - Quote (consultant/admin)
- `PUT /api/study-requests/:id/approve` - Approve quoted request (client/admin)
- `PUT /api/study-requests/:id/complete` - Mark as completed with deliverables (consultant/admin)

### Socket.io Events
- `authenticate` - Authenticate socket connection
- `join-consultation` - Join consultation room
- `send-message` - Send chat message
- `new-message` - Receive new message
- `mark-read` - Mark message as read

## 🎨 Design System

- **Colors**: Primary blue (#3b82f6), Gray scale
- **Font**: Inter
- **Components**: Modern cards, buttons, inputs
- **Animations**: Framer Motion transitions
- **Responsive**: Mobile-first design

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Input validation

## 📝 Development

### Backend
```bash
cd backend
npm run dev      # Development with nodemon
npm start        # Production
npm run prisma:studio  # Database GUI
```

### Frontend
```bash
npm run dev      # Development
npm run build    # Production build
npm start        # Production server
```

## 📄 License

Proprietary and confidential.

---

**Built with ❤️ for Jadwa Consulting Platform**