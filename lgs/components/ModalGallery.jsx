import { useEffect, useState } from 'react';
import './ModalGallery.scss';

function ModalGallery({ pictures = [], onClose }) {
  const [current, setCurrent] = useState(0);

  // Corrige l’URL (évite le hardcode localhost en prod 👉 utilise une env var si possible)
  const getImageUrl = (path) => {
    if (!path) return '';
    if (typeof path === 'object' && path.url) path = path.url; // au cas où
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
    return `${BASE}${path}`;
  };

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + pictures.length) % pictures.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % pictures.length);
  };

  // ESC pour fermer + empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') prev(e);
      if (e.key === 'ArrowRight') next(e);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
      <button className="modal-arrow left" onClick={prev} aria-label="Précédente">←</button>

      <div className="image-viewport">
        <img
          className="modal-image"
          src={getImageUrl(pictures[current])}
          alt={`photo-${current + 1}/${pictures.length}`}
          draggable="false"
        />
      </div>

      <button className="modal-arrow right" onClick={next} aria-label="Suivante">→</button>
    </div>
  </div>

  );
}

export default ModalGallery;
