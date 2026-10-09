import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticate } from '../auth.js';
import { db } from '../db.js';

export const aiRouter = Router();

// Initialize GoogleGenAI server-side with required headers
let aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// POST /api/ai/describe - AI Listing Description Assistant
aiRouter.post('/describe', authenticate, async (req, res) => {
  const { title, categoryId, condition, keyPoints, originalPrice } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Product title is required to generate a description.' });
    return;
  }

  const category = categoryId ? db.getCategoryById(categoryId)?.name : 'General Student Essential';

  // If Gemini API is available, generate via gemini-3.8-flash
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are the CampusCart AI Listing Assistant for a college student-to-student marketplace.
Help the student seller draft a clear, concise, honest listing description.

Item Details:
- Title: ${title}
- Category: ${category}
- Condition: ${condition || 'Good'}
- Key notes from seller: ${keyPoints || 'None specified'}
- Original Price: ${originalPrice ? '₹' + originalPrice : 'Not specified'}

Guidelines:
1. Keep the description honest, realistic, and tailored for university students (e.g., semester coursework, study utility, hostel living).
2. Do NOT invent fake warranty, imaginary serial numbers, or false promises.
3. Structure with 2 short paragraphs: What the item is and its condition, followed by why it's useful for campus peers and handover friendliness.
4. Output plain text without markdown asterisks or excessive fluff.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const generated = response.text?.trim();
      if (generated) {
        res.json({
          description: generated,
          isAiGenerated: true,
          model: 'gemini-3.8-flash',
        });
        return;
      }
    } catch (err) {
      console.warn('Gemini API call encountered error, using smart fallback generator:', err);
    }
  }

  // Graceful rule-based fallback if API key is not present or quota exceeded
  const fallback = `${title} in ${condition || 'Good'} condition, ideal for college coursework and hostel use. ${
    keyPoints ? `Key details: ${keyPoints}. ` : ''
  }All components are well maintained and ready for immediate campus pickup. Perfect for juniors or peers looking for an affordable student deal.`;

  res.json({
    description: fallback,
    isAiGenerated: false,
    model: 'smart-template-engine',
    note: 'Generated using student template engine. Configure GEMINI_API_KEY in Secrets for live Gemini model synthesis.',
  });
});

// POST /api/ai/suggest-category - Smart Category Suggestions
aiRouter.post('/suggest-category', authenticate, async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required.' });
    return;
  }

  const categories = db.getCategories();
  const categoryNames = categories.map((c) => `${c.id}: ${c.name}`).join('\n');

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Given this college marketplace product:
Title: "${title}"
Description: "${description || ''}"

Choose the single best matching category ID from this list:
${categoryNames}

Reply ONLY with the exact category ID (e.g. "cat-books" or "cat-electronics"). Nothing else.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const suggestedId = response.text?.trim();
      const matched = categories.find((c) => c.id === suggestedId);
      if (matched) {
        res.json({ categoryId: matched.id, categoryName: matched.name });
        return;
      }
    } catch (err) {
      console.warn('Category suggestion Gemini error:', err);
    }
  }

  // Smart heuristic fallback
  const lower = `${title} ${description || ''}`.toLowerCase();
  let selected = categories[0];
  if (lower.includes('book') || lower.includes('edition') || lower.includes('notes') || lower.includes('author') || lower.includes('grewal') || lower.includes('algorithms')) {
    selected = categories.find((c) => c.id === 'cat-books') || selected;
  } else if (lower.includes('calculator') || lower.includes('casio') || lower.includes('fx-')) {
    selected = categories.find((c) => c.id === 'cat-calculators') || selected;
  } else if (lower.includes('laptop') || lower.includes('mouse') || lower.includes('keyboard') || lower.includes('headphone') || lower.includes('monitor') || lower.includes('electronics')) {
    selected = categories.find((c) => c.id === 'cat-electronics') || selected;
  } else if (lower.includes('lamp') || lower.includes('chair') || lower.includes('table') || lower.includes('hostel') || lower.includes('kettle')) {
    selected = categories.find((c) => c.id === 'cat-furniture') || selected;
  } else if (lower.includes('lab') || lower.includes('coat') || lower.includes('multimeter') || lower.includes('breadboard')) {
    selected = categories.find((c) => c.id === 'cat-lab-equip') || selected;
  } else if (lower.includes('badminton') || lower.includes('racket') || lower.includes('bat') || lower.includes('football') || lower.includes('sports')) {
    selected = categories.find((c) => c.id === 'cat-sports') || selected;
  }

  res.json({ categoryId: selected.id, categoryName: selected.name });
});

// POST /api/ai/quality-check - Listing Quality Assistant
aiRouter.post('/quality-check', authenticate, async (req, res) => {
  const { title, description, price, condition, pickupLocation } = req.body;

  const suggestions = [];
  let score = 100;

  if (!title || title.length < 10) {
    suggestions.push('Add more specifics to the title (e.g., brand, model, or textbook edition).');
    score -= 20;
  }
  if (!description || description.length < 40) {
    suggestions.push('Provide a more detailed description including physical wear and why you are selling.');
    score -= 25;
  }
  if (!pickupLocation || pickupLocation.length < 8) {
    suggestions.push('Specify a clear campus meetup location (e.g., library reception, hostel block, or academic quad).');
    score -= 15;
  }
  if (!condition) {
    suggestions.push('Select an accurate item condition.');
    score -= 10;
  }
  if (price === undefined || Number(price) <= 0) {
    suggestions.push('Verify the selling price is set appropriately.');
    score -= 15;
  }

  res.json({
    qualityScore: Math.max(20, score),
    suggestions: suggestions.length > 0 ? suggestions : ['Listing looks complete, clear, and ready to post!'],
    isReady: score >= 70,
  });
});
