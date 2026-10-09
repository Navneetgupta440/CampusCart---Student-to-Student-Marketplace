import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_CATEGORIES,
  INITIAL_LISTINGS,
} from './data/initialData.js';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../.data');
const DATA_FILE = path.join(DATA_DIR, 'campuscart.json');

class DatabaseManager {
  constructor() {
    this.state = {
      users: [],
      categories: [],
      listings: [],
      wishlists: [],
      enquiries: [],
      reports: [],
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        // Ensure all arrays exist and user notification preferences are set
        this.state.users = (this.state.users || []).map((u) => ({
          ...u,
          emailNotifications: {
            newEnquiries: true,
            enquiryReplies: true,
            listingStatusUpdates: true,
            priceDrops: true,
            campusAlerts: false,
            ...(u.emailNotifications || {}),
          },
        }));
        this.state.categories = this.state.categories || [];
        this.state.listings = this.state.listings || [];
        this.state.wishlists = this.state.wishlists || [];
        this.state.enquiries = this.state.enquiries || [];
        this.state.reports = this.state.reports || [];
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.error('Error loading database, seeding defaults:', err);
      this.seedInitialData();
    }

    if (this.state.categories.length === 0 || this.state.listings.length === 0 || this.state.users.length === 0) {
      this.seedInitialData();
    }
  }

  seedInitialData() {
    const adminPass = hashPassword('Admin@123');
    const studentPass = hashPassword('Student@123');

    const defaultUsers = [
      {
        id: 'user-admin',
        displayName: 'CampusCart Moderation Admin',
        email: 'admin@campuscart.edu',
        passwordHash: adminPass.hash,
        salt: adminPass.salt,
        college: 'CampusCart Central University Network',
        department: 'Academic Operations & Governance',
        course: 'System Administration',
        yearOfStudy: 'Staff / Admin',
        profileImage: '',
        bio: 'Official CampusCart campus marketplace compliance and student community safety desk.',
        role: 'admin',
        accountStatus: 'active',
        emailVerified: true,
        emailNotifications: {
          newEnquiries: true,
          enquiryReplies: true,
          listingStatusUpdates: true,
          priceDrops: true,
          campusAlerts: true,
        },
        createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
        updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
      },
      {
        id: 'user-aravind',
        displayName: 'Aravind Swaminathan',
        email: 'aravind.cse@campuscart.edu',
        passwordHash: studentPass.hash,
        salt: studentPass.salt,
        college: 'National Institute of Technology, Trichy',
        department: 'Computer Science and Engineering',
        course: 'B.Tech CSE',
        yearOfStudy: '4th Year',
        profileImage: '',
        bio: 'Senior year CSE student graduating this May. Selling core textbooks, lab kits and hostel essentials.',
        role: 'student',
        accountStatus: 'active',
        emailVerified: true,
        emailNotifications: {
          newEnquiries: true,
          enquiryReplies: true,
          listingStatusUpdates: true,
          priceDrops: true,
          campusAlerts: false,
        },
        createdAt: new Date('2026-08-15T08:00:00Z').toISOString(),
        updatedAt: new Date('2026-08-15T08:00:00Z').toISOString(),
      },
      {
        id: 'user-priya',
        displayName: 'Priya Sharma',
        email: 'priya.ece@campuscart.edu',
        passwordHash: studentPass.hash,
        salt: studentPass.salt,
        college: 'Indian Institute of Technology, Delhi',
        department: 'Electronics and Communication',
        course: 'B.Tech ECE',
        yearOfStudy: '3rd Year',
        profileImage: '',
        bio: 'Passionate about embedded systems and algorithms. Reusing textbooks to support juniors!',
        role: 'student',
        accountStatus: 'active',
        emailVerified: true,
        emailNotifications: {
          newEnquiries: true,
          enquiryReplies: true,
          listingStatusUpdates: true,
          priceDrops: true,
          campusAlerts: false,
        },
        createdAt: new Date('2026-08-20T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-08-20T10:00:00Z').toISOString(),
      },
      {
        id: 'user-rohit',
        displayName: 'Rohit Verma',
        email: 'rohit.mech@campuscart.edu',
        passwordHash: studentPass.hash,
        salt: studentPass.salt,
        college: 'BITS Pilani',
        department: 'Mechanical Engineering',
        course: 'B.E. Mechanical',
        yearOfStudy: '2nd Year',
        profileImage: '',
        bio: 'Hostel 3 resident. Sports enthusiast and maker. Clean items, negotiable for freshers.',
        role: 'student',
        accountStatus: 'active',
        emailVerified: true,
        emailNotifications: {
          newEnquiries: true,
          enquiryReplies: true,
          listingStatusUpdates: true,
          priceDrops: true,
          campusAlerts: false,
        },
        createdAt: new Date('2026-08-25T12:00:00Z').toISOString(),
        updatedAt: new Date('2026-08-25T12:00:00Z').toISOString(),
      },
    ];

    this.state = {
      users: defaultUsers,
      categories: INITIAL_CATEGORIES,
      listings: INITIAL_LISTINGS,
      wishlists: [
        {
          id: 'wish-demo-1',
          userId: 'user-aravind',
          listingId: 'list-003', // Casio calculator saved in Aravind's wishlist
          createdAt: new Date('2026-10-02T10:00:00Z').toISOString(),
        },
        {
          id: 'wish-demo-2',
          userId: 'user-priya',
          listingId: 'list-004', // Laptop stand saved in Priya's wishlist
          createdAt: new Date('2026-10-03T11:00:00Z').toISOString(),
        },
      ],
      enquiries: [
        {
          id: 'enq-001',
          listingId: 'list-003',
          listingTitle: 'Casio FX-991EX ClassWiz Non-Programmable Scientific Calculator',
          buyerId: 'user-aravind',
          buyerName: 'Aravind Swaminathan',
          buyerEmail: 'aravind.cse@campuscart.edu',
          sellerId: 'user-rohit',
          sellerName: 'Rohit Verma',
          message: 'Hi Rohit, is this calculator still available? Can we meet at the SAC tomorrow afternoon?',
          status: 'Replied',
          replyMessage: 'Hey Aravind! Yes, still available. 2 PM at SAC works great for me.',
          repliedAt: new Date('2026-10-02T14:30:00Z').toISOString(),
          createdAt: new Date('2026-10-02T11:20:00Z').toISOString(),
          updatedAt: new Date('2026-10-02T14:30:00Z').toISOString(),
        },
      ],
      reports: [
        {
          id: 'rep-001',
          reporterId: 'user-priya',
          reporterName: 'Priya Sharma',
          targetType: 'listing',
          listingId: 'list-009',
          listingTitle: 'Yonex Muscle Power Badminton Racket',
          reason: 'Duplicate listing inquiry check',
          description: 'Checked whether string condition was verified. Resolved with seller.',
          status: 'resolved',
          adminResolution: 'Seller clarified racket string tension was freshly inspected.',
          createdAt: new Date('2026-10-03T10:00:00Z').toISOString(),
          resolvedAt: new Date('2026-10-03T11:00:00Z').toISOString(),
        },
      ],
    };

    this.persist();
  }

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // User queries
  getUsers() {
    return this.state.users;
  }

  getUserById(id) {
    const user = this.state.users.find((u) => u.id === id);
    if (!user) return undefined;
    if (!user.emailNotifications) {
      user.emailNotifications = {
        newEnquiries: true,
        enquiryReplies: true,
        listingStatusUpdates: true,
        priceDrops: true,
        campusAlerts: false,
      };
    } else if (user.emailNotifications.priceDrops === undefined) {
      user.emailNotifications.priceDrops = true;
    }
    return user;
  }

  getUserByEmail(email) {
    const user = this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return undefined;
    if (!user.emailNotifications) {
      user.emailNotifications = {
        newEnquiries: true,
        enquiryReplies: true,
        listingStatusUpdates: true,
        priceDrops: true,
        campusAlerts: false,
      };
    } else if (user.emailNotifications.priceDrops === undefined) {
      user.emailNotifications.priceDrops = true;
    }
    return user;
  }

  createUser(user) {
    this.state.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = {
      ...this.state.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.state.users[idx];
  }

  // Categories
  getCategories() {
    return this.state.categories;
  }

  getCategoryById(id) {
    return this.state.categories.find((c) => c.id === id);
  }

  createCategory(category) {
    this.state.categories.push(category);
    this.persist();
    return category;
  }

  updateCategory(id, updates) {
    const idx = this.state.categories.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.state.categories[idx] = {
      ...this.state.categories[idx],
      ...updates,
    };
    this.persist();
    return this.state.categories[idx];
  }

  deleteCategory(id) {
    const initialLen = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    if (this.state.categories.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Listings
  getListings() {
    return this.state.listings;
  }

  getListingById(id) {
    return this.state.listings.find((l) => l.id === id);
  }

  createListing(listing) {
    this.state.listings.unshift(listing);
    this.persist();
    return listing;
  }

  updateListing(id, updates) {
    const idx = this.state.listings.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.state.listings[idx] = {
      ...this.state.listings[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.state.listings[idx];
  }

  deleteListing(id) {
    const initialLen = this.state.listings.length;
    this.state.listings = this.state.listings.filter((l) => l.id !== id);
    // Also remove any wishlist entries referencing this listing
    this.state.wishlists = this.state.wishlists.filter((w) => w.listingId !== id);
    if (this.state.listings.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Wishlist
  getWishlistByUserId(userId) {
    return this.state.wishlists.filter((w) => w.userId === userId);
  }

  addToWishlist(userId, listingId) {
    const existing = this.state.wishlists.find((w) => w.userId === userId && w.listingId === listingId);
    if (existing) return existing;
    const item = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      listingId,
      createdAt: new Date().toISOString(),
    };
    this.state.wishlists.push(item);
    this.persist();
    return item;
  }

  removeFromWishlist(userId, listingId) {
    const initialLen = this.state.wishlists.length;
    this.state.wishlists = this.state.wishlists.filter((w) => !(w.userId === userId && w.listingId === listingId));
    if (this.state.wishlists.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  getWishlistUsersForListing(listingId) {
    return this.state.wishlists
      .filter((w) => w.listingId === listingId)
      .map((w) => w.userId);
  }

  // Enquiries
  getEnquiriesForUser(userId) {
    return this.state.enquiries.filter((e) => e.buyerId === userId || e.sellerId === userId);
  }

  getEnquiriesAll() {
    return this.state.enquiries;
  }

  getEnquiryById(id) {
    return this.state.enquiries.find((e) => e.id === id);
  }

  createEnquiry(enquiry) {
    this.state.enquiries.unshift(enquiry);
    this.persist();
    return enquiry;
  }

  updateEnquiry(id, updates) {
    const idx = this.state.enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    this.state.enquiries[idx] = {
      ...this.state.enquiries[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.state.enquiries[idx];
  }

  // Reports
  getReports() {
    return this.state.reports;
  }

  getReportById(id) {
    return this.state.reports.find((r) => r.id === id);
  }

  createReport(report) {
    this.state.reports.unshift(report);
    this.persist();
    return report;
  }

  updateReport(id, updates) {
    const idx = this.state.reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.state.reports[idx] = {
      ...this.state.reports[idx],
      ...updates,
    };
    this.persist();
    return this.state.reports[idx];
  }

  // Reset to initial seed data
  resetToSeed() {
    this.seedInitialData();
  }
}

export const db = new DatabaseManager();
