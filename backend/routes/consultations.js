/**
 * Consultation Routes
 * Business logic for creating and managing video/chat consultations
 */

const express = require('express');
const { randomUUID } = require('crypto');
const prisma = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// List consultations for current user (client or consultant)
// For chat, only show confirmed consultations with assigned consultant
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { type } = req.query;

    let where = {};
    
    if (role === 'consultant') {
      where = { 
        consultantId: userId,
        // For chat, only show confirmed/in_progress/completed
        ...(type === 'chat' ? {
          status: { in: ['confirmed', 'in_progress', 'completed'] }
        } : {})
      };
    } else {
      where = { 
        clientId: userId,
        // For chat, only show consultations with assigned consultant and payment confirmed
        ...(type === 'chat' ? {
          consultantId: { not: null },
          status: { in: ['confirmed', 'in_progress', 'completed'] }
        } : {})
      };
    }

    // Add type filter if provided
    if (type) {
      where.type = type;
    }

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, fullName: true, avatarUrl: true } },
        consultant: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    // For chat consultations, verify payment is completed
    if (type === 'chat') {
      const consultationsWithPayment = await Promise.all(
        consultations.map(async (consultation) => {
          const payment = await prisma.payment.findFirst({
            where: {
              relatedId: consultation.id,
              relatedType: 'consultation',
              status: 'completed',
            },
          });
          return payment ? consultation : null;
        })
      );
      return res.json(consultationsWithPayment.filter(c => c !== null));
    }

    res.json(consultations);
  } catch (error) {
    console.error('List consultations error:', error);
    res.status(500).json({ error: 'Failed to list consultations' });
  }
});

// Create a booking (client) - for chat, consultantId is optional (admin will assign)
router.post('/book', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { consultantId, type, scheduledAt, durationMinutes = 60, price, notes } = req.body;

    if (!type || !price) {
      return res.status(400).json({ error: 'type and price are required' });
    }

    // For chat consultations, consultantId is optional (admin assigns later)
    // For video, consultantId may be required
    if (type === 'video' && !consultantId) {
      return res.status(400).json({ error: 'consultantId is required for video consultations' });
    }

    const consultationId = randomUUID();
    
    // Create consultation
    // For chat consultations, consultantId can be null (admin assigns later)
    // For video, consultantId is required
    const consultation = await prisma.consultation.create({
      data: {
        id: consultationId,
        clientId: req.user.userId,
        consultantId: type === 'chat' ? null : consultantId, // Null for chat, admin assigns
        type,
        status: 'pending',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        durationMinutes,
        price,
        notes: notes || null,
      },
    });

    // Create pending payment
    const payment = await prisma.payment.create({
      data: {
        id: randomUUID(),
        userId: req.user.userId,
        relatedId: consultationId,
        relatedType: 'consultation',
        amount: price,
        currency: 'SAR',
        status: 'pending',
      },
    });

    res.status(201).json({ consultation, payment });
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

// Update status with role checks
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingLink } = req.body;
    const { role, userId } = req.user;

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

    // Authorization: consultants can confirm/in_progress/complete/cancel; clients can cancel
    const consultantOwned = consultation.consultantId === userId;
    const clientOwned = consultation.clientId === userId;

    const allowedByRole = (
      (role === 'consultant' && consultantOwned && ['confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) ||
      (role === 'client' && clientOwned && status === 'cancelled') ||
      (role === 'admin')
    );

    if (!allowedByRole) return res.status(403).json({ error: 'Not allowed to update status' });

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        status,
        meetingLink: meetingLink ?? consultation.meetingLink,
        completedAt: status === 'completed' ? new Date() : consultation.completedAt,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Admin assigns consultant to consultation (after payment confirmation)
router.put('/:id/assign-consultant', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { consultantId } = req.body;

    if (!consultantId) {
      return res.status(400).json({ error: 'consultantId is required' });
    }

    // Verify consultation exists
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
      return res.status(400).json({ error: 'Payment must be confirmed before assigning consultant' });
    }

    // Verify consultant exists and is active
    const consultant = await prisma.user.findUnique({
      where: { id: consultantId },
      include: { consultantProfile: true },
    });

    if (!consultant || consultant.role !== 'consultant' || consultant.status !== 'active') {
      return res.status(400).json({ error: 'Invalid or inactive consultant' });
    }

    // Update consultation
    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        consultantId,
        status: 'confirmed',
      },
      include: {
        client: { select: { id: true, fullName: true, avatarUrl: true } },
        consultant: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    // Create notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          id: randomUUID(),
          userId: consultation.clientId,
          title: 'Consultant Assigned',
          message: `A consultant has been assigned to your ${consultation.type} consultation.`,
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
        action: 'assign_consultant',
        targetType: 'consultation',
        targetId: id,
        details: { consultantId, consultationId: id },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Assign consultant error:', error);
    res.status(500).json({ error: 'Failed to assign consultant' });
  }
});

module.exports = router;


