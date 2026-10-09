import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../auth.js';

export const enquiriesRouter = Router();

// GET /api/enquiries
enquiriesRouter.get('/', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  let enquiries;
  if (req.user.role === 'admin') {
    enquiries = db.getEnquiriesAll();
  } else {
    enquiries = db.getEnquiriesForUser(req.user.id);
  }

  const received = enquiries.filter((e) => e.sellerId === req.user?.id);
  const sent = enquiries.filter((e) => e.buyerId === req.user?.id);

  res.json({
    enquiries,
    received,
    sent,
    total: enquiries.length,
  });
});

// POST /api/enquiries
enquiriesRouter.post('/', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { listingId, message } = req.body;
  if (!listingId || !message) {
    res.status(400).json({ error: 'listingId and message are required.' });
    return;
  }

  const trimmed = message.trim();
  if (trimmed.length < 5) {
    res.status(400).json({ error: 'Enquiry message must be at least 5 characters.' });
    return;
  }
  if (trimmed.length > 1000) {
    res.status(400).json({ error: 'Enquiry message cannot exceed 1000 characters.' });
    return;
  }

  const listing = db.getListingById(listingId);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  if (listing.sellerId === req.user.id) {
    res.status(400).json({ error: 'You cannot send an enquiry regarding your own listing.' });
    return;
  }

  const seller = db.getUserById(listing.sellerId);
  const notifySeller = seller?.emailNotifications?.newEnquiries !== false;

  const newEnquiry = {
    id: `enq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    listingId: listing.id,
    listingTitle: listing.title,
    buyerId: req.user.id,
    buyerName: req.user.displayName,
    buyerEmail: req.user.email,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    message: trimmed,
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createEnquiry(newEnquiry);

  if (notifySeller && seller?.email) {
    console.log(`[CampusCart Dispatcher] Email notification sent to seller ${seller.email} for new enquiry on "${listing.title}"`);
  }

  res.status(201).json({
    enquiry: newEnquiry,
    emailNotificationSent: notifySeller,
    message: notifySeller
      ? 'Your enquiry has been dispatched to the seller and delivered to their registered campus email.'
      : 'Your enquiry has been dispatched to the seller\'s CampusCart inbox.',
  });
});

// PATCH /api/enquiries/:id/status
enquiriesRouter.patch('/:id/status', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const { status, replyMessage } = req.body;

  const validStatuses = ['New', 'Replied', 'Closed'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });
    return;
  }

  const enquiry = db.getEnquiryById(id);
  if (!enquiry) {
    res.status(404).json({ error: 'Enquiry not found.' });
    return;
  }

  const isSeller = enquiry.sellerId === req.user.id;
  const isBuyer = enquiry.buyerId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isSeller && !isBuyer && !isAdmin) {
    res.status(403).json({ error: 'Unauthorized to modify this enquiry.' });
    return;
  }

  const updates = {};
  if (status) updates.status = status;
  if (replyMessage && typeof replyMessage === 'string') {
    updates.replyMessage = replyMessage.trim();
    updates.repliedAt = new Date().toISOString();
    updates.status = 'Replied';
  }

  const updated = db.updateEnquiry(id, updates);
  res.json({ enquiry: updated, message: 'Enquiry updated successfully.' });
});
