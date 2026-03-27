const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const streamifier = require('streamifier');

const multer = require('multer');
const sharp = require('sharp');

const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

/* ------------------------------------------------------------------ */
/*  Helpers Cloudinary                                                */
/* ------------------------------------------------------------------ */
function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    let pathPart = parts[1];

    // retire éventuelle version v123456/
    pathPart = pathPart.replace(/^v\d+\//, '');

    // retire extension
    const withoutExtension = pathPart.replace(/\.[^/.]+$/, '');

    return withoutExtension;
  } catch {
    return null;
  }
}

async function deleteImageFromCloudinary(imageUrl) {
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Erreur suppression Cloudinary:', err.message);
  }
}

function uploadBufferToCloudinary(buffer, folder = 'lgs-metallerie') {
  return new Promise((resolve, reject) => {
    const publicId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/* ------------------------------------------------------------------ */
/*  Multer (RAM) + garde-fous                                         */
/* ------------------------------------------------------------------ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) return cb(null, true);
    return cb(new Error('INVALID_FILE_TYPE'));
  },
});

/* ------------------------------------------------------------------ */
/*  Traitement & upload Cloudinary                                    */
/* ------------------------------------------------------------------ */
async function processAndUploadImage(buffer) {
  await sharp(buffer).metadata();

  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const imageUrl = await uploadBufferToCloudinary(processedBuffer);
  return imageUrl;
}

/* ------------------------------------------------------------------ */
/*  Helpers de validation                                              */
/* ------------------------------------------------------------------ */
function normalizePicturesField(pictures) {
  if (!pictures) return [];
  let arr = pictures;

  if (typeof arr === 'string') {
    try {
      arr = JSON.parse(arr);
    } catch {
      throw new Error('PICTURES_JSON_INVALID');
    }
  }

  if (!Array.isArray(arr)) throw new Error('PICTURES_NOT_ARRAY');

  if (
    arr.length > 50 ||
    !arr.every(
      (p) =>
        typeof p === 'string' &&
        (p.startsWith('http://') || p.startsWith('https://'))
    )
  ) {
    throw new Error('PICTURES_FORMAT_INVALID');
  }

  return arr;
}

/* ------------------------------------------------------------------ */
/*  GET toutes les galeries (public)                                  */
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
/*  POST /upload (protégé) — champ file = "image"                     */
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
      const imageUrl = await processAndUploadImage(req.file.buffer);
      return res.json({ imageUrl });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: 'Fichier invalide' });
    }
  });
});

/* ------------------------------------------------------------------ */
/*  POST / (protégé) — créer une galerie                              */
/* ------------------------------------------------------------------ */
router.post('/', auth, upload.none(), async (req, res) => {
  try {
    const { cover, description, category } = req.body;

    if (!cover || typeof cover !== 'string' || !cover.startsWith('http')) {
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
    console.error(err);
    res.status(500).json({ message: 'Erreur création galerie' });
  }
});

/* ------------------------------------------------------------------ */
/*  PUT /:id (protégé)                                                */
/* ------------------------------------------------------------------ */
router.put('/:id', auth, upload.none(), async (req, res) => {
  try {
    const { description, category, cover } = req.body;

    const existing = await Gallery.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Galerie non trouvée' });

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

      const removedPictures = existing.pictures.filter((old) => !normalized.includes(old));
      for (const img of removedPictures) {
        await deleteImageFromCloudinary(img);
      }

      newPictures = normalized;
    }

    let newCover = existing.cover;
    if (typeof cover === 'string' && cover.startsWith('http')) {
      if (existing.cover && existing.cover !== cover) {
        await deleteImageFromCloudinary(existing.cover);
      }
      newCover = cover;
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
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /:id (protégé)                                             */
/* ------------------------------------------------------------------ */
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Galerie non trouvée' });

    await deleteImageFromCloudinary(deleted.cover);
    for (const img of deleted.pictures || []) {
      await deleteImageFromCloudinary(img);
    }

    res.json({ message: 'Galerie supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

module.exports = router;