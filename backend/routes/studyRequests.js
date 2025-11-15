/**
 * Study Requests Routes
 * Handles feasibility studies, analyses and reports lifecycle
 */

const express = require('express');
const { randomUUID } = require('crypto');
const prisma = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// List current user's study requests
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;

    const where = role === 'consultant'
      ? { consultantId: userId }
      : { clientId: userId };

    const requests = await prisma.studyRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    console.error('List study requests error:', error);
    res.status(500).json({ error: 'Failed to list study requests' });
  }
});

// Create a request (client)
router.post('/', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { type, title, description, details, attachments } = req.body;
    if (!type || !title || !description) {
      return res.status(400).json({ error: 'type, title and description are required' });
    }

    const created = await prisma.studyRequest.create({
      data: {
        id: randomUUID(),
        clientId: req.user.userId,
        consultantId: null,
        type,
        title,
        description,
        details: details || {},
        attachments: attachments || [],
        status: 'pending',
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create study request error:', error);
    res.status(500).json({ error: 'Failed to create study request' });
  }
});

// Consultant quotes a request
router.put('/:id/quote', authenticateToken, requireRole('consultant', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { price, durationDays } = req.body;
    if (price == null || durationDays == null) {
      return res.status(400).json({ error: 'price and durationDays are required' });
    }

    const existing = await prisma.studyRequest.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    // Only assigned consultant or admin can quote; allow self-assign if none
    let consultantId = existing.consultantId;
    if (!consultantId) consultantId = req.user.userId;
    if (req.user.role !== 'admin' && consultantId !== req.user.userId) {
      return res.status(403).json({ error: 'Not allowed to quote this request' });
    }

    const updated = await prisma.studyRequest.update({
      where: { id },
      data: {
        consultantId,
        price,
        durationDays,
        status: 'quoted',
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Quote study request error:', error);
    res.status(500).json({ error: 'Failed to quote request' });
  }
});

// Client approves quoted request
router.put('/:id/approve', authenticateToken, requireRole('client', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.studyRequest.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (req.user.role !== 'admin' && existing.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Not allowed to approve this request' });
    }

    const updated = await prisma.studyRequest.update({
      where: { id },
      data: { status: 'approved' },
    });
    res.json(updated);
  } catch (error) {
    console.error('Approve study request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Consultant marks as completed with deliverables
router.put('/:id/complete', authenticateToken, requireRole('consultant', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { deliverables } = req.body;
    const existing = await prisma.studyRequest.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (req.user.role !== 'admin' && existing.consultantId !== req.user.userId) {
      return res.status(403).json({ error: 'Not allowed to complete this request' });
    }

    const updated = await prisma.studyRequest.update({
      where: { id },
      data: {
        status: 'completed',
        deliverables: deliverables || [],
        completedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Complete study request error:', error);
    res.status(500).json({ error: 'Failed to complete request' });
  }
});

module.exports = router;


