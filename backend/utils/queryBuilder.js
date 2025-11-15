/**
 * Query Builder Utilities
 * 
 * Utility functions for building Prisma queries dynamically
 * from request parameters.
 */

/**
 * Build Prisma where clause from query parameters
 */
function buildWhereClause(filters) {
  const where = {};

  for (const [key, value] of Object.entries(filters)) {
    if (key === 'select' || key === 'order' || key === 'limit' || key === 'join') {
      continue; // Skip query builder parameters
    }

    if (key.endsWith('__in')) {
      const column = key.replace('__in', '');
      const values = Array.isArray(value) ? value : JSON.parse(value);
      where[column] = { in: values };
    } else if (key.endsWith('__gt')) {
      const column = key.replace('__gt', '');
      where[column] = { gt: value };
    } else if (key.endsWith('__gte')) {
      const column = key.replace('__gte', '');
      where[column] = { gte: value };
    } else if (key.endsWith('__lt')) {
      const column = key.replace('__lt', '');
      where[column] = { lt: value };
    } else if (key.endsWith('__lte')) {
      const column = key.replace('__lte', '');
      where[column] = { lte: value };
    } else if (key.endsWith('__contains')) {
      const column = key.replace('__contains', '');
      where[column] = { contains: value };
    } else {
      where[key] = value;
    }
  }

  return where;
}

/**
 * Build Prisma select clause from select parameter
 */
function buildSelectClause(selectParam) {
  if (!selectParam || selectParam === '*') {
    return undefined;
  }

  return selectParam.split(',').reduce((acc, field) => {
    acc[field.trim()] = true;
    return acc;
  }, {});
}

/**
 * Build Prisma orderBy clause from order parameter
 */
function buildOrderByClause(orderParam) {
  if (!orderParam) {
    return undefined;
  }

  const [column, direction] = orderParam.split(':');
  return {
    [column]: direction?.toLowerCase() || 'asc',
  };
}

module.exports = {
  buildWhereClause,
  buildSelectClause,
  buildOrderByClause,
};