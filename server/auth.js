import crypto from 'crypto';
import { db } from './db.js';

const SESSIONS = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password, salt) {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password, hash, salt) {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function destroySession(token) {
  SESSIONS.delete(token);
}

export function getUserFromToken(token) {
  const session = SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    return null;
  }
  const user = db.getUserById(session.userId);
  if (!user || user.accountStatus === 'suspended') return null;
  return user;
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    return;
  }

  req.user = user;
  req.token = token;
  next();
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = getUserFromToken(token);
    if (user) {
      req.user = user;
      req.token = token;
    }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}
