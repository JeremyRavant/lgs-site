const express = require('express');
const router = express.Router();

const Category = require('../models/Category');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// ==========================
// Cache en mémoire (par catégorie)
// ==========================
const TTL_MS = 24 * 60 * 60 * 1000; // ✅ 24h (change ici si tu veux)
const cacheByCategory = new Map();  // key: categoryTitle -> { img: "/uploads/xxx.webp", ts: Date.now() }

const buildImagePath = (p) => {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  if (p.startsWith('/uploads/')) return p;
  if (p.startsWith('uploads/')) return `/${p}`;
  return `/uploads/${p.replace(/^\/+/, '')}`;
};

// ======================================================
// GET /api/categories/with-random-image
// Image stable pendant TTL_MS puis change
// ======================================================
router.get('/with-random-image', async (req, res) => {
  try {
    const categories = await Category.find();

    const galleries = await Gallery.find(
      {},
      { category: 1, pictures: 1, _id: 0 }
    );

    const picsByCat = new Map();

    for (const g of galleries) {
      const cat = (g.category || '').trim();
      if (!cat) continue;

      if (!picsByCat.has(cat)) picsByCat.set(cat, []);
      const arr = picsByCat.get(cat);

      for (const p of (g.pictures || [])) {
        if (typeof p === 'string' && p.trim()) arr.push(p.trim());
      }
    }

    const now = Date.now();

    const result = categories.map((c) => {
      const catName = (c.title || '').trim();
      const pics = picsByCat.get(catName) || [];

      // 1) Si on a un cache encore valide => on garde la même image
      const cached = cacheByCategory.get(catName);
      if (cached && (now - cached.ts) < TTL_MS) {
        return {
          ...c.toObject(),
          randomImageUrl: cached.img,
        };
      }

      // 2) Sinon on choisit une nouvelle image et on met en cache
      const random = pics.length
        ? pics[Math.floor(Math.random() * pics.length)]
        : null;

      const img = buildImagePath(random);

      cacheByCategory.set(catName, {
        img,
        ts: now,
      });

      return {
        ...c.toObject(),
        randomImageUrl: img,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('GET /api/categories/with-random-image error:', error);
    return res.status(500).json({ message: error.message });
  }
});


// ======================================================
// POST /api/categories (protégé)
// Crée une nouvelle catégorie depuis le panneau admin
// ======================================================
router.post('/', auth, async (req, res) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const description =
      typeof req.body?.description === 'string' ? req.body.description.trim() : '';

    if (!title) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Category.findOne({
      title: { $regex: `^${escapedTitle}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(409).json({ message: 'Cette catégorie existe déjà' });
    }

    const category = await Category.create({
      title,
      description,
      cover: '',
    });

    cacheByCategory.delete(title);
    return res.status(201).json(category);
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
  }
});

// ======================================================
// GET /api/categories
// ======================================================
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    return res.json(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;