import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';

export const adminRouter = Router();

// Apply auth + requireAdmin to all admin endpoints
adminRouter.use(authenticate, requireAdmin);

// GET /api/admin/overview
adminRouter.get('/overview', (req, res) => {
  const users = db.getUsers();
  const listings = db.getListings();
  const reports = db.getReports();
  const enquiries = db.getEnquiriesAll();

  const totalUsers = users.length;
  const activeListings = listings.filter((l) => l.status === 'Active').length;
  const soldListings = listings.filter((l) => l.status === 'Sold').length;
  const unavailableListings = listings.filter((l) => l.status === 'Unavailable').length;
  const removedListings = listings.filter((l) => l.status === 'Removed').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  const recentActivities = [];

  listings.slice(0, 5).forEach((l) => {
    recentActivities.push({
      id: `act-l-${l.id}`,
      type: 'listing',
      title: `Listing published: "${l.title}" by ${l.sellerName}`,
      timestamp: l.createdAt,
    });
  });

  reports.slice(0, 5).forEach((r) => {
    recentActivities.push({
      id: `act-r-${r.id}`,
      type: 'report',
      title: `Safety report submitted for ${r.targetType}: ${r.reason}`,
      timestamp: r.createdAt,
    });
  });

  enquiries.slice(0, 5).forEach((e) => {
    recentActivities.push({
      id: `act-e-${e.id}`,
      type: 'enquiry',
      title: `Enquiry sent from ${e.buyerName} to ${e.sellerName}`,
      timestamp: e.createdAt,
    });
  });

  recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    stats: {
      totalUsers,
      activeListings,
      soldListings,
      unavailableListings,
      removedListings,
      pendingReports,
      totalEnquiries: enquiries.length,
    },
    recentActivities: recentActivities.slice(0, 8),
  });
});

// GET /api/admin/users
adminRouter.get('/users', (req, res) => {
  const users = db.getUsers().map((u) => {
    const userListings = db.getListings().filter((l) => l.sellerId === u.id);
    const { passwordHash, salt, ...safe } = u;
    return {
      ...safe,
      listingsCount: userListings.length,
      activeListingsCount: userListings.filter((l) => l.status === 'Active').length,
    };
  });

  res.json({ users });
});

// PATCH /api/admin/users/:id/status
adminRouter.patch('/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'Status must be "active" or "suspended".' });
    return;
  }

  const targetUser = db.getUserById(id);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (targetUser.role === 'admin' && status === 'suspended') {
    res.status(400).json({ error: 'Cannot suspend an administrator account.' });
    return;
  }

  const updated = db.updateUser(id, {
    accountStatus: status,
    suspensionReason: status === 'suspended' ? reason || 'Administrative policy suspension.' : undefined,
  });

  res.json({
    user: updated,
    message: `User account has been marked as ${status}.`,
  });
});

// POST /api/admin/reset-demo
adminRouter.post('/reset-demo', (req, res) => {
  db.resetToSeed();
  res.json({ message: 'Database successfully reset to initial demo seeds.' });
});
