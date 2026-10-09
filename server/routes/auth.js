import { Router } from 'express';
import { db } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  authenticate,
} from '../auth.js';

export const authRouter = Router();

function sanitizeUser(user) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

// POST /api/auth/register
authRouter.post('/register', (req, res) => {
  const {
    displayName,
    email,
    password,
    confirmPassword,
    college,
    department,
    course,
    yearOfStudy,
  } = req.body;

  if (!displayName || !email || !password || !college) {
    res.status(400).json({ error: 'Please provide all required fields: name, email, password, and college.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  if (confirmPassword && password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const isCollegeDomain = email.toLowerCase().endsWith('.edu') || email.toLowerCase().includes('ac.in') || email.toLowerCase().includes('.college');

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    displayName: displayName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    salt,
    college: college.trim(),
    department: department ? department.trim() : 'General Studies',
    course: course ? course.trim() : 'Undergraduate',
    yearOfStudy: yearOfStudy || '1st Year',
    profileImage: '',
    role: 'student',
    accountStatus: 'active',
    emailVerified: isCollegeDomain,
    emailNotifications: {
      newEnquiries: true,
      enquiryReplies: true,
      listingStatusUpdates: true,
      priceDrops: true,
      campusAlerts: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  const token = createSession(newUser.id);

  res.status(201).json({
    token,
    user: sanitizeUser(newUser),
    message: isCollegeDomain
      ? 'Account created and verified via recognized academic email domain!'
      : 'Account created. Note: Academic verification pending.',
  });
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.accountStatus === 'suspended') {
    res.status(403).json({
      error: `Your account has been suspended: ${user.suspensionReason || 'Contact campus administration.'}`,
    });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = createSession(user.id);
  res.json({
    token,
    user: sanitizeUser(user),
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    destroySession(token);
  }
  res.json({ message: 'Signed out successfully.' });
});

// GET /api/auth/me
authRouter.get('/me', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  if (!req.user.emailNotifications) {
    req.user.emailNotifications = {
      newEnquiries: true,
      enquiryReplies: true,
      listingStatusUpdates: true,
      priceDrops: true,
      campusAlerts: false,
    };
  } else if (req.user.emailNotifications.priceDrops === undefined) {
    req.user.emailNotifications.priceDrops = true;
  }
  res.json({ user: sanitizeUser(req.user) });
});

// PUT /api/auth/profile
authRouter.put('/profile', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const { displayName, college, department, course, yearOfStudy, profileImage, bio, emailNotifications } = req.body;
  const updates = {};

  if (displayName) updates.displayName = displayName.trim();
  if (college) updates.college = college.trim();
  if (department !== undefined) updates.department = department.trim();
  if (course !== undefined) updates.course = course.trim();
  if (yearOfStudy) updates.yearOfStudy = yearOfStudy;
  if (profileImage !== undefined) updates.profileImage = profileImage;
  if (bio !== undefined) updates.bio = bio.trim();
  if (emailNotifications && typeof emailNotifications === 'object') {
    updates.emailNotifications = {
      newEnquiries: emailNotifications.newEnquiries !== undefined ? Boolean(emailNotifications.newEnquiries) : true,
      enquiryReplies: emailNotifications.enquiryReplies !== undefined ? Boolean(emailNotifications.enquiryReplies) : true,
      listingStatusUpdates: emailNotifications.listingStatusUpdates !== undefined ? Boolean(emailNotifications.listingStatusUpdates) : true,
      priceDrops: emailNotifications.priceDrops !== undefined ? Boolean(emailNotifications.priceDrops) : true,
      campusAlerts: emailNotifications.campusAlerts !== undefined ? Boolean(emailNotifications.campusAlerts) : false,
    };
  }

  const updated = db.updateUser(req.user.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ user: sanitizeUser(updated), message: 'Profile and notification preferences updated successfully.' });
});

// POST /api/auth/test-notification
authRouter.post('/test-notification', authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({
    message: `Test notification successfully dispatched to ${req.user.email}! (Simulated delivery via CampusCart Dispatch Service).`,
  });
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    res.json({ message: 'If an account exists with this email, password reset instructions have been dispatched.' });
    return;
  }
  res.json({
    message: `Password reset instructions dispatched to ${user.email}. (Demo environment: you may also sign in using the demo accounts).`,
  });
});
