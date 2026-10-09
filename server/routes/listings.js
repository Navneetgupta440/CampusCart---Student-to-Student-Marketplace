import { Router } from 'express';
import { db } from '../db.js';
import {
  authenticate,
  optionalAuthenticate,
} from '../auth.js';

export const listingsRouter = Router();

// GET /api/listings
listingsRouter.get('/', optionalAuthenticate, (req, res) => {
  const {
    search,
    category,
    condition,
    college,
    listingType,
    minPrice,
    maxPrice,
    sort = 'newest',
    status,
    sellerId,
    page = '1',
    limit = '12',
  } = req.query;

  let results = db.getListings();

  // Filter by seller if requested
  if (sellerId && typeof sellerId === 'string') {
    results = results.filter((item) => item.sellerId === sellerId);
  }

  // Filter by status:
  if (status && typeof status === 'string') {
    results = results.filter((item) => item.status.toLowerCase() === status.toLowerCase());
  } else if (!sellerId) {
    results = results.filter((item) => item.status !== 'Removed');
  }

  // Filter by search query (title, description, pickup location, college)
  if (search && typeof search === 'string') {
    const term = search.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.college.toLowerCase().includes(term) ||
        item.sellerName.toLowerCase().includes(term)
    );
  }

  // Filter by category
  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((item) => item.categoryId === category);
  }

  // Filter by condition
  if (condition && typeof condition === 'string' && condition !== 'all') {
    results = results.filter((item) => item.condition.toLowerCase() === condition.toLowerCase());
  }

  // Filter by college
  if (college && typeof college === 'string' && college !== 'all') {
    results = results.filter((item) => item.college.toLowerCase() === college.toLowerCase());
  }

  // Filter by listingType (Sale / Exchange / Donation)
  if (listingType && typeof listingType === 'string' && listingType !== 'all') {
    results = results.filter((item) => item.listingType.toLowerCase() === listingType.toLowerCase());
  }

  // Filter by price range
  if (minPrice && typeof minPrice === 'string') {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) results = results.filter((item) => item.price >= min);
  }
  if (maxPrice && typeof maxPrice === 'string') {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) results = results.filter((item) => item.price <= max);
  }

  // Sorting
  results.sort((a, b) => {
    if (sort === 'price-low') {
      return a.price - b.price;
    }
    if (sort === 'price-high') {
      return b.price - a.price;
    }
    // Default: newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const total = results.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    listings: paginated,
    total,
    page: pageNum,
    totalPages,
    limit: limitNum,
  });
});

// GET /api/listings/:id
listingsRouter.get('/:id', optionalAuthenticate, (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);

  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  // If listing is removed, only owner or admin can see it
  if (listing.status === 'Removed') {
    const isOwner = req.user && req.user.id === listing.sellerId;
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(404).json({ error: 'This listing has been removed by administration.' });
      return;
    }
  }

  // Attach sanitized seller profile
  const seller = db.getUserById(listing.sellerId);
  const sellerInfo = seller
    ? {
        id: seller.id,
        displayName: seller.displayName,
        college: seller.college,
        department: seller.department,
        course: seller.course,
        yearOfStudy: seller.yearOfStudy,
        emailVerified: seller.emailVerified,
        createdAt: seller.createdAt,
      }
    : {
        id: listing.sellerId,
        displayName: listing.sellerName,
        college: listing.sellerCollege,
        department: 'Student',
        course: '',
        yearOfStudy: '',
        emailVerified: false,
        createdAt: listing.createdAt,
      };

  // Find similar products in same category
  const similar = db
    .getListings()
    .filter((l) => l.categoryId === listing.categoryId && l.id !== listing.id && l.status === 'Active')
    .slice(0, 4);

  res.json({
    listing,
    seller: sellerInfo,
    similar,
  });
});

// POST /api/listings
listingsRouter.post('/', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const {
    title,
    description,
    categoryId,
    price,
    originalPrice,
    condition,
    images,
    college,
    pickupLocationDescription,
    listingType = 'Sale',
  } = req.body;

  // Validation
  if (!title || !description || !categoryId || price === undefined || !condition || !pickupLocationDescription) {
    res.status(400).json({
      error: 'Please complete all required fields: title, description, category, price, condition, and pickup location.',
    });
    return;
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 0) {
    res.status(400).json({ error: 'Price must be a valid non-negative number.' });
    return;
  }

  const validConditions = ['New', 'Like New', 'Good', 'Fair'];
  if (!validConditions.includes(condition)) {
    res.status(400).json({ error: `Condition must be one of: ${validConditions.join(', ')}.` });
    return;
  }

  const validTypes = ['Sale', 'Exchange', 'Donation'];
  if (!validTypes.includes(listingType)) {
    res.status(400).json({ error: `Listing type must be one of: ${validTypes.join(', ')}.` });
    return;
  }

  const verifiedCategory = db.getCategoryById(categoryId);
  if (!verifiedCategory) {
    res.status(400).json({ error: 'Invalid category selected.' });
    return;
  }

  let cleanedImages = Array.isArray(images) ? images : [];
  if (cleanedImages.length === 0) {
    cleanedImages = ['/images/items/default_item.svg'];
  } else if (cleanedImages.length > 5) {
    cleanedImages = cleanedImages.slice(0, 5);
  }

  const newListing = {
    id: `list-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sellerId: req.user.id,
    sellerName: req.user.displayName,
    sellerCollege: req.user.college,
    title: title.trim(),
    description: description.trim(),
    categoryId,
    price: numPrice,
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    condition,
    images: cleanedImages,
    college: college ? college.trim() : req.user.college,
    pickupLocationDescription: pickupLocationDescription.trim(),
    listingType,
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createListing(newListing);
  res.status(201).json({ listing: newListing, message: 'Listing published successfully!' });
});

// PUT /api/listings/:id
listingsRouter.put('/:id', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const listing = db.getListingById(id);

  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  const isOwner = listing.sellerId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Unauthorized. You do not own this listing.' });
    return;
  }

  const {
    title,
    description,
    categoryId,
    price,
    originalPrice,
    condition,
    images,
    college,
    pickupLocationDescription,
    listingType,
    status,
  } = req.body;

  let isPriceDrop = false;
  let priceDropSubscribersCount = 0;

  const updates = {};
  if (title) updates.title = title.trim();
  if (description) updates.description = description.trim();
  if (categoryId) updates.categoryId = categoryId;
  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400).json({ error: 'Price must be a valid non-negative number.' });
      return;
    }

    if (numPrice !== listing.price) {
      const previousPrice = listing.price;
      updates.price = numPrice;

      const history = listing.priceHistory ? [...listing.priceHistory] : [];
      history.push({
        price: numPrice,
        previousPrice,
        changedAt: new Date().toISOString(),
        note: numPrice < previousPrice
          ? `Price dropped from ₹${previousPrice} to ₹${numPrice} (-₹${previousPrice - numPrice})`
          : `Price adjusted from ₹${previousPrice} to ₹${numPrice}`,
      });
      updates.priceHistory = history;

      // Detect Price Drop and alert opted-in wishlist users
      if (numPrice < previousPrice) {
        isPriceDrop = true;
        const wishlistUserIds = db.getWishlistUsersForListing(listing.id);
        wishlistUserIds.forEach((uid) => {
          const subscriber = db.getUserById(uid);
          // Check if user has opted in for price drops (defaults to true)
          if (subscriber && subscriber.id !== req.user?.id && subscriber.emailNotifications?.priceDrops !== false) {
            priceDropSubscribersCount++;
            console.log(
              `[CampusCart Price Drop Alert] Notification dispatched to ${subscriber.email} for "${listing.title}": Price dropped from ₹${previousPrice} to ₹${numPrice} (Save ₹${previousPrice - numPrice})`
            );
          }
        });
      }
    }
  }
  if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
  if (condition) updates.condition = condition;
  if (images && Array.isArray(images)) updates.images = images.slice(0, 5);
  if (college) updates.college = college.trim();
  if (pickupLocationDescription) updates.pickupLocationDescription = pickupLocationDescription.trim();
  if (listingType) updates.listingType = listingType;
  if (status) updates.status = status;

  const updated = db.updateListing(id, updates);

  let successMessage = 'Listing updated successfully.';
  if (isPriceDrop) {
    successMessage = `Price updated to ₹${updates.price}. ${priceDropSubscribersCount} wishlist subscriber(s) alerted of the price drop!`;
  }

  res.json({
    listing: updated,
    isPriceDrop,
    priceDropSubscribersNotified: priceDropSubscribersCount,
    message: successMessage,
  });
});

// DELETE /api/listings/:id
listingsRouter.delete('/:id', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const listing = db.getListingById(id);

  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  const isOwner = listing.sellerId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Unauthorized. You do not have permission to delete this listing.' });
    return;
  }

  db.deleteListing(id);
  res.json({ message: 'Listing deleted successfully.' });
});

// PATCH /api/listings/:id/status
listingsRouter.patch('/:id/status', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ['Active', 'Sold', 'Unavailable', 'Removed'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });
    return;
  }

  const listing = db.getListingById(id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  const isOwner = listing.sellerId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Unauthorized. You cannot modify status of this listing.' });
    return;
  }

  if (status === 'Removed' && !isAdmin) {
    res.status(403).json({ error: 'Only an administrator can mark a listing as Removed.' });
    return;
  }

  const updates = { status };
  if (reason) updates.removalReason = reason;

  const updated = db.updateListing(id, updates);
  res.json({ listing: updated, message: `Listing marked as ${status}.` });
});
