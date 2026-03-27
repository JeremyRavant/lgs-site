// routes/galleries.js
const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const multer = require('multer');
const sharp = require('sharp');

const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth'); // protège POST/PUT/DELETE

/* ------------------------------------------------------------------ */
/*  Dossier d’upload                                                   */
/* ------------------------------------------------------------------ */
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function deleteImageFromUploads(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const filename = imagePath.replace('/uploads/', '');
  const fullPath = path.join(UPLOAD_DIR, filename);
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (!err) fs.unlink(fullPath, () => {});
  });
}

/* ------------------------------------------------------------------ */
/*  Multer (RAM) + garde-fous                                         */
/* ------------------------------------------------------------------ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (req, file, cb) => {
    // on accepte seulement image/*
    if ((file.mimetype || '').startsWith('image/')) return cb(null, true);
    return cb(new Error('INVALID_FILE_TYPE'));
  },
});

/* ------------------------------------------------------------------ */
/*  Traitement & enregistrement (→ .webp optimisée)                    */
/* ------------------------------------------------------------------ */
async function processAndSaveImage(buffer) {
  // vérifie que le buffer est bien une image décodable
  await sharp(buffer).metadata();

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/${filename}`;
}

/* ------------------------------------------------------------------ */
/*  Helpers de validation                                              */
/* ------------------------------------------------------------------ */
function normalizePicturesField(pictures) {
  // Accepte tableau direct OU chaîne JSON
  if (!pictures) return [];
  let arr = pictures;

  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr); }
    catch { throw new Error('PICTURES_JSON_INVALID'); }
  }
  if (!Array.isArray(arr)) throw new Error('PICTURES_NOT_ARRAY');

  if (
    arr.length > 50 ||
    !arr.every((p) => typeof p === 'string' && p.startsWith('/uploads/'))
  ) {
    throw new Error('PICTURES_FORMAT_INVALID');
  }
  return arr;
}

/* ------------------------------------------------------------------ */
/*  GET toutes les galeries (public)                                   */
/* ------------------------------------------------------------------ */
router.get('/', async (_req, res) => {
  try {
    const galleries = await Gallery.find();
    res.json(galleries);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
});

/* ------------------------------------------------------------------ */
/*  POST /upload (protégé) — champ file = "image"                      */
/* ------------------------------------------------------------------ */
router.post('/upload', auth, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Fichier trop volumineux (max 5 Mo)' });
      }
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: 'Type de fichier non supporté (jpg/png/webp)' });
      }
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    try {
      const imageUrl = await processAndSaveImage(req.file.buffer);
      return res.json({ imageUrl });
    } catch {
      return res.status(400).json({ message: 'Fichier invalide' });
    }
  });
});

/* ------------------------------------------------------------------ */
/*  POST / (protégé) — créer une galerie                               */
/* ------------------------------------------------------------------ */
router.post('/', auth, upload.none(), async (req, res) => {
  try {
    const { cover, description, category } = req.body;

    if (!cover || typeof cover !== 'string' || !cover.startsWith('/uploads/')) {
      return res.status(400).json({ message: 'Une image de couverture valide est requise' });
    }

    let pics = [];
    try {
      pics = normalizePicturesField(req.body.pictures);
    } catch (e) {
      if (e.message === 'PICTURES_JSON_INVALID') {
        return res.status(400).json({ message: 'pictures doit être un JSON valide' });
      }
      if (e.message === 'PICTURES_NOT_ARRAY') {
        return res.status(400).json({ message: 'pictures doit être un tableau' });
      }
      return res.status(400).json({ message: 'Format de pictures invalide' });
    }

    const newGallery = new Gallery({
      cover,
      description: typeof description === 'string' ? description : '',
      category: typeof category === 'string' ? category : '',
      pictures: pics,
    });

    const saved = await newGallery.save();
    res.status(201).json({ message: 'Galerie créée avec succès', gallery: saved });
  } catch (err) {
    res.status(500).json({ message: 'Erreur création galerie' });
  }
});

/* ------------------------------------------------------------------ */
/*  PUT /:id (protégé) — peut recevoir "cover" (file)                  */
/* ------------------------------------------------------------------ */
router.put('/:id', auth, upload.single('cover'), async (req, res) => {
  try {
    const { description, category } = req.body;

    const existing = await Gallery.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Galerie non trouvée' });

    // Pictures : si fourni → normalise + supprime les anciennes retirées
    let newPictures = existing.pictures;
    if (typeof req.body.pictures !== 'undefined') {
      let normalized = [];
      try {
        normalized = normalizePicturesField(req.body.pictures);
      } catch (e) {
        if (e.message === 'PICTURES_JSON_INVALID') {
          return res.status(400).json({ message: 'pictures doit être un JSON valide' });
        }
        if (e.message === 'PICTURES_NOT_ARRAY') {
          return res.status(400).json({ message: 'pictures doit être un tableau' });
        }
        return res.status(400).json({ message: 'Format de pictures invalide' });
      }

      // Supprimer physiquement les images retirées
      const removedPictures = existing.pictures.filter((old) => !normalized.includes(old));
      removedPictures.forEach(deleteImageFromUploads);

      newPictures = normalized;
    }

    // Nouvelle cover ?
    let newCover = existing.cover;
    if (req.file) {
      deleteImageFromUploads(existing.cover);
      try {
        newCover = await processAndSaveImage(req.file.buffer);
      } catch {
        return res.status(400).json({ message: 'Cover invalide' });
      }
    }

    const updated = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          cover: newCover,
          description: typeof description === 'string' ? description : existing.description,
          category: typeof category === 'string' ? category : existing.category,
          pictures: newPictures,
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /:id (protégé)                                              */
/* ------------------------------------------------------------------ */
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Galerie non trouvée' });

    deleteImageFromUploads(deleted.cover);
    (deleted.pictures || []).forEach(deleteImageFromUploads);

    res.json({ message: 'Galerie supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

module.exports = router;
