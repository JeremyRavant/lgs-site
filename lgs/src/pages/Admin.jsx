import React, { useEffect, useState } from 'react';
import './Admin.scss';
import { authFetch, getImageUrl } from '../utils/auth';
import { apiUrl } from '../utils/api';

export default function AdminPanel() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [pendingCover, setPendingCover] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/categories'))
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => console.error('GET /categories', e));
  }, []);

  useEffect(() => {
    fetch(apiUrl('/api/galleries'))
      .then((r) => r.json())
      .then((data) => setGalleries(Array.isArray(data) ? data : []))
      .catch((e) => console.error('GET /galleries', e));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      const r = await authFetch(apiUrl(`/api/galleries/${id}`), { method: 'DELETE' });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert(e.message || 'Erreur lors de la suppression');
        return;
      }
      setGalleries((prev) => prev.filter((g) => g._id !== id));
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la suppression');
    }
  };

  const handleNewGallery = () => {
    setSelectedGallery({
      cover: '',
      description: '',
      category: categories[0]?.title || '',
      pictures: [],
    });
    setPendingCover(null);
    setPendingImages([]);
    setIsNew(true);

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  const handleCoverSelection = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingCover(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedGallery((p) => ({ ...p, cover: previewUrl }));
  };

  const handleAddPictures = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setSelectedGallery((p) => ({ ...p, pictures: [...(p.pictures || []), ...previews] }));
  };

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const r = await authFetch(apiUrl('/api/galleries/upload'), { method: 'POST', body: fd });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'Upload échoué');
    return data.imageUrl;
  }

  const handleRemovePicture = (index) => {
    setSelectedGallery((p) => ({
      ...p,
      pictures: (p.pictures || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedGallery) return;

    try {
      let coverUrl = '';
      if (pendingCover) {
        coverUrl = await uploadImage(pendingCover);
      } else if (selectedGallery.cover && !selectedGallery.cover.startsWith('blob:')) {
        coverUrl = selectedGallery.cover;
      }

      const uploaded = [];
      for (const f of pendingImages) {
        uploaded.push(await uploadImage(f));
      }

      const keepExisting = (selectedGallery.pictures || []).filter(
        (p) => p.startsWith('/uploads/') || p.startsWith('http')
      );
      const finalPictures = [...keepExisting, ...uploaded];

      const fd = new FormData();
      fd.append('cover', coverUrl);
      fd.append('description', selectedGallery.description || '');
      fd.append('category', selectedGallery.category || '');
      fd.append('pictures', JSON.stringify(finalPictures));

      const method = isNew ? 'POST' : 'PUT';
      const url = isNew
        ? apiUrl('/api/galleries')
        : apiUrl(`/api/galleries/${selectedGallery._id}`);

      const r = await authFetch(url, { method, body: fd });
      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        alert(data.message || 'Erreur');
        return;
      }

      if (isNew) {
        setGalleries((prev) => [...prev, data.gallery]);
      } else {
        setGalleries((prev) => prev.map((g) => (g._id === data._id ? data : g)));
      }

      setSelectedGallery(null);
      setPendingImages([]);
      setPendingCover(null);
      setIsNew(false);
      alert(isNew ? 'Galerie créée !' : 'Galerie mise à jour !');
    } catch (e) {
      console.error('SAVE gallery', e);
      alert(e.message || 'Erreur lors de la sauvegarde');
    }
  };

  const filtered = galleries.filter((g) => {
    if (!selectedCategory) return true;
    return (g.category || '').toLowerCase().trim() === selectedCategory.toLowerCase().trim();
  });

  return (
    <div className="admin-panel">
      <h2>Panneau d’administration</h2>
      <button onClick={handleNewGallery} className="btn-add-gallery">
        ➕ Créer une nouvelle galerie
      </button>

      {categories.length > 0 && (
        <div className="category-filters">
          <button
            className={selectedCategory === null ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={selectedCategory === cat.title ? 'active' : ''}
              onClick={() => setSelectedCategory(cat.title)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      )}

      <ul className="gallery-grid">
        {filtered.map((gal) => (
          <li key={gal._id} className="gallery-card">
            <img src={getImageUrl(gal.cover)} alt={gal.category || 'image'} />
            <p>{gal.category}</p>
            <div className="card-actions">
              <button onClick={() => { setSelectedGallery(gal); setIsNew(false); }}>
                Modifier
              </button>
              <button onClick={() => handleDelete(gal._id)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>

      {selectedGallery && (
        <form onSubmit={handleUpdate} className="edit-form">
          <h3>{isNew ? 'Créer une nouvelle galerie' : 'Modifier la galerie'}</h3>

          <label>Image de couverture</label>
          {selectedGallery.cover ? (
            <div className="picture-wrapper">
              <img src={getImageUrl(selectedGallery.cover)} alt="cover" />
              <button
                type="button"
                onClick={() => {
                  setSelectedGallery({ ...selectedGallery, cover: '' });
                  setPendingCover(null);
                }}
              >
                ✖
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={handleCoverSelection} />
          )}

          <label>Description</label>
          <input
            value={selectedGallery.description}
            onChange={(e) => setSelectedGallery({ ...selectedGallery, description: e.target.value })}
          />

          <label>Catégorie</label>
          <select
            value={selectedGallery.category}
            onChange={(e) => setSelectedGallery({ ...selectedGallery, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>

          <label>Images de la galerie</label>
          <div className="gallery-pictures">
            {(selectedGallery.pictures || []).map((url, idx) => (
              <div className="picture-wrapper" key={idx} style={{ position: 'relative' }}>
                <img src={getImageUrl(url)} alt={`img-${idx}`} />
                <button
                  type="button"
                  onClick={() => handleRemovePicture(idx)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'red',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    cursor: 'pointer',
                  }}
                  aria-label="Supprimer"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>

          <input type="file" multiple accept="image/*" onChange={handleAddPictures} />

          <div className="form-actions">
            <button type="submit">{isNew ? 'Créer' : 'Valider'}</button>
            <button
              type="button"
              onClick={() => {
                setSelectedGallery(null);
                setPendingCover(null);
                setPendingImages([]);
                setIsNew(false);
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}