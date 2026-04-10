import React, { useState } from 'react';
import ModalGallery from './ModalGallery';
import './PictureCard.scss';
import { apiUrl } from '../src/utils/api';

function PictureCard({ cover, pictures = [], categoryTitle = 'Métallerie' }) {
  const [open, setOpen] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/uploads')) {
      return apiUrl(path);
    }

    return '';
  };

  const validPictures = pictures.filter((url) => getImageUrl(url));
  const coverUrl = getImageUrl(cover);

  return (
    <>
      <div className="picture-card" onClick={() => setOpen(true)}>
        {coverUrl ? (
          <img src={coverUrl} alt={`${categoryTitle} sur mesure signé LGS Métallerie`} loading="lazy" />
        ) : (
          <div className="placeholder">Aucune image</div>
        )}
        <div className="picture-count">{validPictures.length}</div>
      </div>

      {open && validPictures.length > 0 && (
        <ModalGallery
          pictures={validPictures.map((url) => getImageUrl(url))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default PictureCard;