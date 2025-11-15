/**
 * Admin Routes
 * Administrative operations for managing consultations, payments, and assignments
 */

const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (clients and consultants) for admin
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.query; // Optional filter by role
    
    const where = role && role !== 'all' 
      ? { role } 
      : { role: { in: ['client', 'consultant'] } }; // Only get clients and consultants by default

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
});

// Get single user by ID
router.get('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        consultantProfile: {
          select: {
            id: true,
            specialization: true,
            experienceYears: true,
            bio: true,
            rating: true,
            totalReviews: true,
            hourlyRate: true,
            verifiedDocs: true,
            available: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

// Update user
router.put('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, status, verified, consultantProfile } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email is being changed, check if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update user
    const updateData = {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(status && { status }),
      ...(verified !== undefined && { verified }),
    };

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Update consultant profile if provided and user is consultant
    if (consultantProfile && existingUser.role === 'consultant') {
      await prisma.consultant.updateMany({
        where: { userId: id },
        data: {
          ...(consultantProfile.specialization && { specialization: consultantProfile.specialization }),
          ...(consultantProfile.experienceYears !== undefined && { experienceYears: parseInt(consultantProfile.experienceYears) || 0 }),
          ...(consultantProfile.bio !== undefined && { bio: consultantProfile.bio || null }),
          ...(consultantProfile.hourlyRate !== undefined && { hourlyRate: parseFloat(consultantProfile.hourlyRate) || 0 }),
          ...(consultantProfile.verifiedDocs !== undefined && { verifiedDocs: consultantProfile.verifiedDocs }),
          ...(consultantProfile.available !== undefined && { available: consultantProfile.available }),
        },
      });
    }

    // Create admin log
    await prisma.adminLog.create({
      data: {
        id: require('crypto').randomUUID(),
        adminId: req.user.userId,
        action: 'update_user',
        targetType: 'user',
        targetId: id,
        details: { changes: Object.keys(updateData) },
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        id: require('crypto').randomUUID(),
        adminId: req.user.userId,
        action: 'delete_user',
        targetType: 'user',
        targetId: id,
        details: { email: user.email, role: user.role },
      },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Get analytics data
router.get('/analytics', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { period } = req.query; // '7d', '30d', '90d', 'all'
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Total revenue from completed payments
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: startDate },
      },
    });
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Revenue from last period for comparison
    const lastPeriodStart = new Date(startDate);
    const periodDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    lastPeriodStart.setDate(lastPeriodStart.getDate() - periodDays);
    
    const lastPeriodPayments = await prisma.payment.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: lastPeriodStart, lt: startDate },
      },
    });
    const lastPeriodRevenue = lastPeriodPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueChange = lastPeriodRevenue > 0 
      ? ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? '100' : '0';

    // Active users (users with status 'active')
    const activeUsers = await prisma.user.count({
      where: {
        status: 'active',
        role: { in: ['client', 'consultant'] },
      },
    });

    // Users created in current period
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        role: { in: ['client', 'consultant'] },
      },
    });

    // Last period users for comparison
    const lastPeriodUsers = await prisma.user.count({
      where: {
        createdAt: { gte: lastPeriodStart, lt: startDate },
        role: { in: ['client', 'consultant'] },
      },
    });
    const userGrowth = lastPeriodUsers > 0 
      ? ((newUsers - lastPeriodUsers) / lastPeriodUsers * 100).toFixed(1)
      : newUsers > 0 ? '100' : '0';

    // Consultations
    const totalConsultations = await prisma.consultation.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    const thisMonthConsultations = await prisma.consultation.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });

    // Average rating
    const ratings = await prisma.rating.findMany({});
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : '0.0';

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthPayments = await prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });
      
      revenueByMonth.push({
        month: months[monthStart.getMonth()],
        revenue: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      });
    }

    // User growth by month
    const userGrowthByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthUsers = await prisma.user.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          role: { in: ['client', 'consultant'] },
        },
      });
      
      userGrowthByMonth.push({
        month: months[monthStart.getMonth()],
        users: monthUsers,
      });
    }

    // Consultation types breakdown
    const videoConsultations = await prisma.consultation.count({
      where: { type: 'video' },
    });
    const chatConsultations = await prisma.consultation.count({
      where: { type: 'chat' },
    });

    // User distribution
    const clientsCount = await prisma.user.count({ where: { role: 'client' } });
    const consultantsCount = await prisma.user.count({ where: { role: 'consultant' } });
    const adminsCount = await prisma.user.count({ where: { role: 'admin' } });

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      revenueChange,
      activeUsers,
      userGrowth,
      totalConsultations,
      thisMonthConsultations,
      avgRating,
      totalReviews: ratings.length,
      revenueByMonth,
      userGrowthByMonth,
      consultationTypes: {
        video: videoConsultations,
        chat: chatConsultations,
      },
      userDistribution: {
        clients: clientsCount,
        consultants: consultantsCount,
        admins: adminsCount,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics', details: error.message });
  }
});

// Get all consultations for admin (with filter for requests vs active)
router.get('/consultations', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { type } = req.query; // 'requests' or 'active'

    let where = {};
    
    if (type === 'requests') {
      // Consultation requests: pending status, payment may or may not be completed
      where = {
        status: 'pending',
      };
    } else if (type === 'active') {
      // Active consultations: confirmed, in_progress, or completed
      where = {
        status: { in: ['confirmed', 'in_progress', 'completed'] },
      };
    }
    // If no type specified, return all

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        consultant: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      },
    });

    // Get payment status for each consultation
    const consultationsWithPayment = await Promise.all(
      consultations.map(async (consultation) => {
        const payment = await prisma.payment.findFirst({
          where: {
            relatedId: consultation.id,
            relatedType: 'consultation',
          },
          orderBy: { createdAt: 'desc' },
        });
        return { ...consultation, payment };
      })
    );

    res.json(consultationsWithPayment);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to get consultations' });
  }
});

// Approve consultation request (moves from requests to active)
router.put('/consultations/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { consultantId } = req.body;

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Verify payment is completed
    const payment = await prisma.payment.findFirst({
      where: {
        relatedId: id,
        relatedType: 'consultation',
        status: 'completed',
      },
    });

    if (!payment) {
      return res.status(400).json({ error: 'Payment must be confirmed before approving consultation' });
    }

    // If consultantId provided and it's a chat consultation, assign consultant
    if (consultantId && consultation.type === 'chat' && !consultation.consultantId) {
      const consultant = await prisma.user.findUnique({
        where: { id: consultantId },
      });

      if (!consultant || consultant.role !== 'consultant' || consultant.status !== 'active') {
        return res.status(400).json({ error: 'Invalid consultant' });
      }

      const updated = await prisma.consultation.update({
        where: { id },
        data: {
          consultantId,
          status: 'confirmed',
        },
        include: {
          client: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
          consultant: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        },
      });

      // Create notifications
      const { randomUUID } = require('crypto');
      await Promise.all([
        prisma.notification.create({
          data: {
            id: randomUUID(),
            userId: consultation.clientId,
            title: 'Consultation Approved',
            message: `Your ${consultation.type} consultation has been approved and a consultant has been assigned.`,
            type: 'booking',
            status: 'unread',
            actionUrl: `/dashboard/client/${consultation.type}`,
          },
        }),
        prisma.notification.create({
          data: {
            id: randomUUID(),
            userId: consultantId,
            title: 'New Consultation Assignment',
            message: `You have been assigned to a ${consultation.type} consultation.`,
            type: 'booking',
            status: 'unread',
            actionUrl: `/dashboard/consultant/${consultation.type}`,
          },
        }),
      ]);

      // Create admin log
      await prisma.adminLog.create({
        data: {
          id: randomUUID(),
          adminId: req.user.userId,
          action: 'approve_consultation',
          targetType: 'consultation',
          targetId: id,
          details: { consultantId, consultationId: id },
        },
      });

      return res.json(updated);
    } else {
      // Just approve without assigning (for video consultations that already have consultant)
      const updated = await prisma.consultation.update({
        where: { id },
        data: {
          status: 'confirmed',
        },
        include: {
          client: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
          consultant: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        },
      });

      // Create notification
      const { randomUUID } = require('crypto');
      await prisma.notification.create({
        data: {
          id: randomUUID(),
          userId: consultation.clientId,
          title: 'Consultation Approved',
          message: `Your ${consultation.type} consultation has been approved.`,
          type: 'booking',
          status: 'unread',
          actionUrl: `/dashboard/client/${consultation.type}`,
        },
      });

      // Create admin log
      await prisma.adminLog.create({
        data: {
          id: randomUUID(),
          adminId: req.user.userId,
          action: 'approve_consultation',
          targetType: 'consultation',
          targetId: id,
          details: { consultationId: id },
        },
      });

      return res.json(updated);
    }
  } catch (error) {
    console.error('Approve consultation error:', error);
    res.status(500).json({ error: 'Failed to approve consultation' });
  }
});


// Create consultant (admin only)
router.post('/consultants', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, fullName, phone, specialization, experienceYears, bio, hourlyRate } = req.body;

    if (!email || !password || !fullName || !specialization) {
      return res.status(400).json({ error: 'Email, password, fullName, and specialization are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const bcrypt = require('bcryptjs');
    const { randomUUID } = require('crypto');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with consultant profile
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        fullName,
        phone: phone || null,
        passwordHash,
        role: 'consultant',
        verified: true,
        status: 'active',
        consultantProfile: {
          create: {
            specialization,
            experienceYears: experienceYears || 0,
            bio: bio || null,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
            verifiedDocs: true, // Admin-created consultants are pre-verified
            available: true,
          },
        },
      },
      include: {
        consultantProfile: true,
      },
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        id: randomUUID(),
        adminId: req.user.userId,
        action: 'create_consultant',
        targetType: 'user',
        targetId: user.id,
        details: { email, specialization },
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create consultant error:', error);
    res.status(500).json({ error: 'Failed to create consultant' });
  }
});

// Get all consultants for admin
router.get('/consultants', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const consultants = await prisma.user.findMany({
      where: {
        role: 'consultant',
      },
      include: {
        consultantProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedConsultants = consultants
      .filter(c => c.consultantProfile !== null) // Only include consultants with profiles
      .map(c => ({
        id: c.consultantProfile.id,
        userId: c.id,
        user: {
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          avatarUrl: c.avatarUrl,
        },
        specialization: c.consultantProfile.specialization || '',
        experienceYears: c.consultantProfile.experienceYears || 0,
        rating: Number(c.consultantProfile.rating) || 0,
        totalReviews: c.consultantProfile.totalReviews || 0,
        hourlyRate: Number(c.consultantProfile.hourlyRate) || 0,
        verifiedDocs: c.consultantProfile.verifiedDocs || false,
        available: c.consultantProfile.available || false,
      }));

    res.json(formattedConsultants);
  } catch (error) {
    console.error('Get consultants error:', error);
    res.status(500).json({ error: 'Failed to get consultants', details: error.message });
  }
});

module.exports = router;

