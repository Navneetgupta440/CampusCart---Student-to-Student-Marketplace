import { Router } from 'express';
import { db } from '../db.js';
import {
  authenticate,
  requireAdmin,
} from '../auth.js';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', (req, res) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// POST /api/categories (Admin only)
categoriesRouter.post('/', authenticate, requireAdmin, (req, res) => {
  const { name, description, isActive = true } = req.body;
  if (!name || !description) {
    res.status(400).json({ error: 'Name and description are required for category.' });
    return;
  }

  const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
  const newCat = {
    id,
    name: name.trim(),
    description: description.trim(),
    isActive: Boolean(isActive),
    createdAt: new Date().toISOString(),
  };

  db.createCategory(newCat);
  res.status(201).json({ category: newCat, message: 'Category created successfully.' });
});

// PUT /api/categories/:id (Admin only)
categoriesRouter.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const updates = {};
  if (name) updates.name = name.trim();
  if (description) updates.description = description.trim();
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  const updated = db.updateCategory(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }

  res.json({ category: updated, message: 'Category updated successfully.' });
});

// DELETE /api/categories/:id (Admin only)
categoriesRouter.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteCategory(id);
  if (!deleted) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  res.json({ message: 'Category deleted successfully.' });
});
