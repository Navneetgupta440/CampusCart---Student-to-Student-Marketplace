import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../auth.js';

export const wishlistRouter = Router();

// GET /api/wishlist
wishlistRouter.get('/', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const items = db.getWishlistByUserId(req.user.id);
  const listingsMap = new Map(db.getListings().map((l) => [l.id, l]));

  // Embed active listing details
  const enriched = items
    .map((item) => {
      const listing = listingsMap.get(item.listingId);
      return {
        ...item,
        listing: listing || null,
      };
    })
    .filter((item) => item.listing !== null);

  res.json({ wishlist: enriched, count: enriched.length });
});

// POST /api/wishlist
wishlistRouter.post('/', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { listingId } = req.body;
  if (!listingId) {
    res.status(400).json({ error: 'listingId is required.' });
    return;
  }

  const listing = db.getListingById(listingId);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  const item = db.addToWishlist(req.user.id, listingId);
  res.status(201).json({ wishlist: item, message: 'Added to your wishlist.' });
});

// DELETE /api/wishlist/:listingId
wishlistRouter.delete('/:listingId', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { listingId } = req.params;
  const removed = db.removeFromWishlist(req.user.id, listingId);
  if (!removed) {
    res.status(404).json({ error: 'Item was not in your wishlist.' });
    return;
  }

  res.json({ message: 'Removed from your wishlist.' });
});
