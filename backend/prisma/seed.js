/**
 * Database Seeder for Jadwa Platform
 * Creates test users with different roles
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out to keep existing data)
  // await prisma.message.deleteMany();
  // await prisma.consultation.deleteMany();
  // await prisma.consultant.deleteMany();
  // await prisma.user.deleteMany();

  // Password for all test users: "password123"
  const defaultPassword = 'password123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jadwa.com' },
    update: {},
    create: {
      id: randomUUID(),
      fullName: 'Admin User',
      email: 'admin@jadwa.com',
      phone: '+966501234567',
      passwordHash: passwordHash,
      role: 'admin',
      verified: true,
      status: 'active',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Note: Only client, consultant, and admin roles are available in the schema

  // Create Client Users
  const client1 = await prisma.user.upsert({
    where: { email: 'client@jadwa.com' },
    update: {},
    create: {
      id: randomUUID(),
      fullName: 'Ahmed Al-Rashid',
      email: 'client@jadwa.com',
      phone: '+966501234569',
      passwordHash: passwordHash,
      role: 'client',
      verified: true,
      status: 'active',
    },
  });
  console.log('✅ Created client user:', client1.email);

  const client2 = await prisma.user.upsert({
    where: { email: 'client2@jadwa.com' },
    update: {},
    create: {
      id: randomUUID(),
      fullName: 'Fatima Al-Zahra',
      email: 'client2@jadwa.com',
      phone: '+966501234570',
      passwordHash: passwordHash,
      role: 'client',
      verified: true,
      status: 'active',
    },
  });
  console.log('✅ Created client user:', client2.email);

  // Create Consultant Users
  const consultant1 = await prisma.user.upsert({
    where: { email: 'consultant@jadwa.com' },
    update: {},
    create: {
      id: randomUUID(),
      fullName: 'Dr. Mohammed Al-Hassan',
      email: 'consultant@jadwa.com',
      phone: '+966501234571',
      passwordHash: passwordHash,
      role: 'consultant',
      verified: true,
      status: 'active',
    },
  });
  
  await prisma.consultant.upsert({
    where: { userId: consultant1.id },
    update: {},
    create: {
      id: randomUUID(),
      userId: consultant1.id,
      specialization: 'Business Consulting & Strategic Planning',
      experienceYears: 15,
      bio: 'Experienced business consultant with expertise in strategic planning, market analysis, and organizational development.',
      rating: 4.8,
      totalReviews: 42,
      hourlyRate: 500.00,
      verifiedDocs: true,
      certificates: [],
      available: true,
    },
  });
  console.log('✅ Created consultant user:', consultant1.email);

  const consultant2 = await prisma.user.upsert({
    where: { email: 'consultant2@jadwa.com' },
    update: {},
    create: {
      id: randomUUID(),
      fullName: 'Eng. Sara Al-Mutairi',
      email: 'consultant2@jadwa.com',
      phone: '+966501234572',
      passwordHash: passwordHash,
      role: 'consultant',
      verified: true,
      status: 'active',
    },
  });
  
  await prisma.consultant.upsert({
    where: { userId: consultant2.id },
    update: {},
    create: {
      id: randomUUID(),
      userId: consultant2.id,
      specialization: 'Financial Analysis & Investment Advisory',
      experienceYears: 12,
      bio: 'Certified financial analyst specializing in investment strategies, risk management, and financial planning.',
      rating: 4.9,
      totalReviews: 67,
      hourlyRate: 600.00,
      verifiedDocs: true,
      certificates: [],
      available: true,
    },
  });
  console.log('✅ Created consultant user:', consultant2.email);

  console.log('\n📋 Created Users Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin User:');
  console.log('   Email: admin@jadwa.com');
  console.log('   Password: password123');
  console.log('\n👤 Client Users:');
  console.log('   Email: client@jadwa.com');
  console.log('   Password: password123');
  console.log('   Email: client2@jadwa.com');
  console.log('   Password: password123');
  console.log('\n👤 Consultant Users:');
  console.log('   Email: consultant@jadwa.com');
  console.log('   Password: password123');
  console.log('   Email: consultant2@jadwa.com');
  console.log('   Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

