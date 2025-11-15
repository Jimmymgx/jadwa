/**
 * Profile Routes
 * Allows users to update their own profile information
 */

const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user's profile (with consultant profile if applicable)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        consultantProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
});

// Update current user's profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { fullName, phone, consultantProfile } = req.body;

    // Update user basic info
    const updateData = {
      ...(fullName && { fullName }),
      ...(phone !== undefined && { phone: phone || null }),
    };

    const user = await prisma.user.update({
      where: { id: userId },
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
    if (consultantProfile && user.role === 'consultant') {
      await prisma.consultant.updateMany({
        where: { userId },
        data: {
          ...(consultantProfile.specialization !== undefined && { specialization: consultantProfile.specialization }),
          ...(consultantProfile.experienceYears !== undefined && { experienceYears: parseInt(consultantProfile.experienceYears) || 0 }),
          ...(consultantProfile.bio !== undefined && { bio: consultantProfile.bio || null }),
          ...(consultantProfile.hourlyRate !== undefined && { hourlyRate: parseFloat(consultantProfile.hourlyRate) || 0 }),
          ...(consultantProfile.available !== undefined && { available: consultantProfile.available }),
          // verifiedDocs can only be updated by admin
        },
      });
    }

    // Fetch updated user with consultant profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        consultantProfile: true,
      },
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
        consultantProfile: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

module.exports = router;


