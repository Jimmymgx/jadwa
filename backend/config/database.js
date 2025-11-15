/**
 * Database Configuration
 * 
 * Prisma Client configuration for the Jadwa platform.
 * Provides a single instance of Prisma Client for the application.
 */

const { PrismaClient } = require('@prisma/client');

// Create Prisma Client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('✓ Database connected successfully via Prisma');
  })
  .catch((error) => {
    console.error('✗ Database connection error:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
  });

module.exports = prisma;