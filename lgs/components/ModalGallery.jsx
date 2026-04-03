import { useEffect, useState } from 'react';
import './ModalGallery.scss';
import { apiUrl } from '../utils/api';

function ModalGallery({ pictures = [], onClose }) {
  const [current, setCurrent] = useState(0);

  const getImageUrl = (path) => {
    if (!path) return '';

    if (typeof path === 'object' && path.url) {
      path = path.url;
    }

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }

    if (path.startsWith('/uploads')) {
      return apiUrl(path);
    }

    return '';
  };

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + pictures.length) % pictures.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % pictures.length);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        setCurrent((c) => (c - 1 + pictures.length) % pictures.length);
      }
      if (e.key === 'ArrowRight') {
        e.stopPropagation();
        setCurrent((c) => (c + 1) % pictures.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [pictures.length, onClose]);

  if (!pictures.length) return null;

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
