import React, { useState } from 'react';
import ModalGallery from './ModalGallery';
import './PictureCard.scss';

function PictureCard({ cover, pictures = [] }) {
  const [open, setOpen] = useState(false);

  // Filtrage des images valides
  const validPictures = pictures.filter(
    (url) => url && (url.startsWith('/uploads') || url.startsWith('http'))
  );

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/uploads')) {
      return `http://localhost:5000${path}`.replace('http://localhost:5000http', 'http');
    }
    return '';
  };

  const displayCover = cover && (cover.startsWith('/uploads') || cover.startsWith('http'));

  return (
    <>
      <div className="picture-card" onClick={() => setOpen(true)}>
        {displayCover ? (
          <img src={getImageUrl(cover)} alt="Photo galerie" />
        ) : (
          <div className="placeholder">Aucune image</div>
        )}
        <div className="picture-count">{validPictures.length}</div>
      </div>

      {open && validPictures.length > 0 && (
        <ModalGallery pictures={validPictures} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export default PictureCard;
