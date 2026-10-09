import { Router } from 'express';
import { db } from '../db.js';
import {
  authenticate,
  requireAdmin,
} from '../auth.js';

export const reportsRouter = Router();

// POST /api/reports (Authenticated students can report)
reportsRouter.post('/', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { targetType, listingId, reportedUserId, reason, description } = req.body;

  if (!reason || !description) {
    res.status(400).json({ error: 'Please specify the reason and description for this report.' });
    return;
  }

  let listingTitle;
  let reportedUserName;

  if (targetType === 'listing' && listingId) {
    const listing = db.getListingById(listingId);
    if (listing) {
      listingTitle = listing.title;
    }
  } else if (targetType === 'user' && reportedUserId) {
    const user = db.getUserById(reportedUserId);
    if (user) {
      reportedUserName = user.displayName;
    }
  }

  const newReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reporterId: req.user.id,
    reporterName: req.user.displayName,
    targetType: targetType === 'user' ? 'user' : 'listing',
    listingId,
    listingTitle,
    reportedUserId,
    reportedUserName,
    reason: reason.trim(),
    description: description.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.createReport(newReport);
  res.status(201).json({ report: newReport, message: 'Report submitted for administrator review.' });
});

// GET /api/admin/reports (Admin only)
reportsRouter.get('/admin', authenticate, requireAdmin, (req, res) => {
  const reports = db.getReports();
  res.json({ reports });
});

// PATCH /api/admin/reports/:id (Admin only)
reportsRouter.patch('/admin/:id', authenticate, requireAdmin, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const { status, resolutionNote } = req.body;

  const validStatuses = ['pending', 'resolved', 'dismissed'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid report status. Must be one of: ${validStatuses.join(', ')}.` });
    return;
  }

  const report = db.getReportById(id);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const updates = {};
  if (status) updates.status = status;
  if (resolutionNote) updates.resolutionNote = resolutionNote.trim();
  updates.moderatorId = req.user.id;
  updates.resolvedAt = new Date().toISOString();

  const updated = db.updateReport(id, updates);
  res.json({ report: updated, message: `Report marked as ${status}.` });
});
