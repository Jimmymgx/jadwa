/**
 * Backend API Server for Jadwa Platform
 * Enhanced with Socket.io for real-time chat
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const consultationsRoutes = require('./routes/consultations');
const studyRequestsRoutes = require('./routes/studyRequests');

// Import database to initialize connection
const prisma = require('./config/database');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware - Allow multiple origins in development
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// CORS configuration - more permissive in development
app.use(cors({
  origin: (origin, callback) => {
    // In development, allow requests with no origin (like Postman, curl, etc.)
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }
    
    // Allow requests from allowed origins
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, be more permissive - allow localhost on any port
      if (origin && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow in dev
      }
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/study-requests', studyRequestsRoutes);
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      // Verify token and get user
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(`user:${userId}`);
      
      console.log(`User ${userId} authenticated on socket ${socket.id}`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  socket.on('join-consultation', (consultationId) => {
    socket.join(`consultation:${consultationId}`);
    console.log(`Socket ${socket.id} joined consultation ${consultationId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { consultationId, message, fileUrl, fileName } = data;
      const senderId = socket.userId;

      if (!senderId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Save message to database
      const { randomUUID } = require('crypto');
      const savedMessage = await prisma.message.create({
        data: {
          id: randomUUID(),
          consultationId,
          senderId,
          message,
          fileUrl,
          fileName,
          read: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Emit to all users in the consultation room
      io.to(`consultation:${consultationId}`).emit('new-message', savedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('mark-read', async (data) => {
    try {
      const { messageId } = data;
      await prisma.message.update({
        where: { id: messageId },
        data: { read: true },
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Jadwa Platform API',
    version: '1.0.0',
    socketio: 'enabled',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
      },
      api: {
        list: 'GET /api/:table',
        create: 'POST /api/:table',
        update: 'PUT /api/:table',
        delete: 'DELETE /api/:table',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.io enabled on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  });
});