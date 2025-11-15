/**
 * Generic API Routes
 * 
 * Provides CRUD operations for all database tables
 * Mimics Supabase-like REST API interface
 */

const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { buildSelectQuery } = require('../utils/queryBuilder');

const router = express.Router();

// Map table names to Prisma models
const modelMap = {
  users: prisma.user,
  consultants: prisma.consultant,
  consultations: prisma.consultation,
  messages: prisma.message,
  study_requests: prisma.studyRequest,
  payments: prisma.payment,
  payouts: prisma.payout,
  support_tickets: prisma.supportTicket,
  notifications: prisma.notification,
  ratings: prisma.rating,
  admin_logs: prisma.adminLog,
};

/**
 * GET /api/:table
 * Query records from a table
 */
router.get('/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const model = modelMap[table];

    if (!model) {
      return res.status(404).json({ error: `Table ${table} not found` });
    }

    // Build query from request parameters
    const { select, order, limit, join, ...filters } = req.query;

    // Build Prisma where clause
    const where = {};
    for (const [key, value] of Object.entries(filters)) {
      if (key.endsWith('__in')) {
        const column = key.replace('__in', '');
        where[column] = { in: Array.isArray(value) ? value : JSON.parse(value) };
      } else {
        where[key] = value;
      }
    }

    // Build select clause
    const selectFields = select && select !== '*' 
      ? select.split(',').reduce((acc, field) => {
          acc[field.trim()] = true;
          return acc;
        }, {})
      : undefined;

    // Build orderBy clause
    const orderBy = order ? (() => {
      const [column, direction] = order.split(':');
      return { [column]: direction?.toLowerCase() || 'asc' };
    })() : undefined;

    // Execute query
    const data = await model.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      select: selectFields,
      orderBy,
      take: limit ? parseInt(limit) : undefined,
      // Include relations if specified in join
      include: buildIncludes(join, table),
    });

    res.json(data);
  } catch (error) {
    console.error(`Query error for ${req.params.table}:`, error);
    res.status(500).json({ error: error.message || 'Query failed' });
  }
});

/**
 * POST /api/:table
 * Create a new record
 */
router.post('/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const model = modelMap[table];

    if (!model) {
      return res.status(404).json({ error: `Table ${table} not found` });
    }

    // Handle UUID generation for tables that need it
    const data = { ...req.body };
    if (!data.id && table !== 'users') {
      // For users, ID is generated in auth route
      const { randomUUID } = require('crypto');
      data.id = randomUUID();
    }

    const result = await model.create({
      data,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(`Create error for ${req.params.table}:`, error);
    res.status(500).json({ error: error.message || 'Create failed' });
  }
});

/**
 * PUT /api/:table
 * Update a record
 */
router.put('/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const { id, ...updateData } = req.body;
    const model = modelMap[table];

    if (!model) {
      return res.status(404).json({ error: `Table ${table} not found` });
    }

    if (!id) {
      return res.status(400).json({ error: 'ID is required for update' });
    }

    const result = await model.update({
      where: { id },
      data: updateData,
    });

    res.json(result);
  } catch (error) {
    console.error(`Update error for ${req.params.table}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(500).json({ error: error.message || 'Update failed' });
  }
});

/**
 * DELETE /api/:table
 * Delete a record
 */
router.delete('/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const { id, ...filters } = req.query;
    const model = modelMap[table];

    if (!model) {
      return res.status(404).json({ error: `Table ${table} not found` });
    }

    if (id) {
      // Delete by ID
      await model.delete({
        where: { id },
      });
    } else {
      // Delete by filters (first find, then delete)
      const where = {};
      for (const [key, value] of Object.entries(filters)) {
        where[key] = value;
      }

      if (Object.keys(where).length === 0) {
        return res.status(400).json({ error: 'ID or filter required for delete' });
      }

      await model.deleteMany({
        where,
      });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(`Delete error for ${req.params.table}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(500).json({ error: error.message || 'Delete failed' });
  }
});

/**
 * Helper function to build includes for relations
 */
function buildIncludes(joinParam, table) {
  if (!joinParam) return undefined;

  const include = {};
  const joins = Array.isArray(joinParam) ? joinParam : [joinParam];

  // Map common joins
  joins.forEach((join) => {
    const [relation] = join.split(':');
    
    // Add relation based on table
    switch (table) {
      case 'consultants':
        if (relation === 'users') {
          include.user = true;
        }
        break;
      case 'consultations':
        if (relation === 'users') {
          include.client = true;
          include.consultant = true;
        }
        break;
      // Add more cases as needed
    }
  });

  return Object.keys(include).length > 0 ? include : undefined;
}

module.exports = router;
