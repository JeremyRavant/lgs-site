// server.js
require('dotenv').config();

console.log("MONGO_URL =", process.env.MONGO_URL);

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const mongoose = require('mongoose');

const app = express();

/* ------------------------ Connexion Mongo ------------------------ */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

/* ------------------------ Middlewares globaux ------------------------ */
// ------------------ Sécurité & middlewares de base ------------------
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ❌ NE PAS utiliser: app.use(mongoSanitize());  // incompatible avec Express 5

// Compression
app.use(compression());

// Body parsers (doivent arriver avant la sanitation)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// 1) logger très simple
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 2) route de test
app.get('/test', (_req, res) => {
  res.type('text').send('OK');
});


// ✅ Sanitize compatible Express 5 (on ne touche pas req.query)
app.use((req, _res, next) => {
  try {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
  } catch (_) {
    // ignore
  }
  next();
});

// ✅ hpp sans toucher req.query (sinon crash sur Express 5)
app.use(
  hpp({
    checkQuery: false, // IMPORTANT pour Express 5
  })
);


/* ---------------- Rate limit global (doucement) ---------------- */
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ---------------------- Fichiers statiques /uploads ---------------------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ------------------------------ Routes API ------------------------------ */
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/categories', require('./routes/categories')); // tes routes existantes
app.use('/api/galleries', require('./routes/galleries'));   // tes routes existantes

// (Optionnel) Google Reviews si tes env sont présents
const fetchFn =
  global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));
let reviewsCache = { data: null, ts: 0 };
const REVIEWS_TTL_MS = Number(process.env.REVIEWS_TTL_MS || 12 * 60 * 60 * 1000);

app.get('/api/google-reviews', async (_req, res) => {
  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_PLACE_ID) {
    return res.status(501).json({ error: 'NOT_CONFIGURED' });
  }
  try {
    if (reviewsCache.data && Date.now() - reviewsCache.ts < REVIEWS_TTL_MS) {
      return res.json(reviewsCache.data);
    }

    const fields = ['name', 'url', 'rating', 'user_ratings_total', 'reviews'].join(',');
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(process.env.GOOGLE_PLACE_ID)}` +
      `&fields=${encodeURIComponent(fields)}` +
      `&reviews_sort=newest&language=fr` +
      `&key=${encodeURIComponent(process.env.GOOGLE_API_KEY)}`;

    const r = await fetchFn(url);
    const json = await r.json();
    if (json.status !== 'OK') {
      return res.status(502).json({ error: json.status, details: json.error_message });
    }

    const result = json.result || {};
    const payload = {
      name: result.name,
      url: result.url,
      rating: result.rating,
      total: result.user_ratings_total,
      reviews: (result.reviews || []).map((rv) => ({
        author_name: rv.author_name,
        author_url: rv.author_url,
        profile_photo_url: rv.profile_photo_url,
        rating: rv.rating,
        relative_time_description: rv.relative_time_description,
        text: rv.text,
      })),
    };

    reviewsCache = { data: payload, ts: Date.now() };
    return res.json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/* ------------------------- 404 + gestion d’erreurs ------------------------ */
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('UNHANDLED ERROR:', err);
  res.status(500).json({ message: 'INTERNAL_ERROR' });
});

/* --------------------------------- Start --------------------------------- */
const PORT = process.env.PORT || 5000;
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🚀 API prête sur http://localhost:${PORT}`);
  });
});
