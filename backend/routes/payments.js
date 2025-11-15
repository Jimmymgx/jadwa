/**
 * Payment Routes
 * Handle payment creation, confirmation, and status updates
 */

const express = require('express');
const { randomUUID } = require('crypto');
const prisma = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create payment for consultation
router.post('/create', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const { consultationId, amount, paymentMethod, transactionId } = req.body;

    if (!consultationId || !amount) {
      return res.status(400).json({ error: 'consultationId and amount are required' });
    }

    // Verify consultation exists and belongs to user
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.clientId !== req.user.userId) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        id: randomUUID(),
        userId: req.user.userId,
        relatedId: consultationId,
        relatedType: 'consultation',
        amount,
        currency: 'SAR',
        status: 'pending',
        paymentMethod: paymentMethod || null,
        transactionId: transactionId || null,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Admin confirms payment
router.put('/:id/confirm', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status: 'completed' },
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        id: randomUUID(),
        adminId: req.user.userId,
        action: 'confirm_payment',
        targetType: 'payment',
        targetId: id,
        details: { paymentId: id, amount: payment.amount },
      },
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payments for consultation
router.get('/consultation/:consultationId', authenticateToken, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const payments = await prisma.payment.findMany({
      where: {
        relatedId: consultationId,
        relatedType: 'consultation',
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

module.exports = router;

