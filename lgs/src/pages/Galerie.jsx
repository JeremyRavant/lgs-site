import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Galerie.scss';
import PictureCard from '../../components/PictureCard';
import axios from 'axios';
import { apiUrl } from '../utils/api';
import Seo from '../components/Seo.jsx';

const descriptions = {
  escaliers:
    'Découvrez nos réalisations d’escaliers métalliques sur mesure à Rouen et en Normandie : design, robustesse et finitions soignées.',
  verrières:
    'Découvrez nos verrières intérieures et extérieures sur mesure réalisées près de Rouen pour structurer les espaces et faire entrer la lumière.',
  'garde-corps':
    'Découvrez nos garde-corps métalliques sur mesure conçus pour sécuriser et valoriser vos espaces intérieurs et extérieurs.',
  portails:
    'Découvrez nos portails métalliques sur mesure fabriqués en Normandie pour allier sécurité, style et durabilité.',
  divers:
    'Découvrez nos créations métalliques sur mesure : mobilier, décoration, structures personnalisées et réalisations uniques.',
};

function Galerie() {
  const { title } = useParams();
  const [category, setCategory] = useState(null);
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl('/api/categories'))
      .then((res) => {
        const found = res.data.find((cat) => cat.title.toLowerCase() === title?.toLowerCase());
        setCategory(found);
      })
      .catch((err) => console.error('Erreur chargement catégories', err));

    axios
      .get(apiUrl('/api/galleries'))
      .then((res) => {
        const filtered = res.data.filter((pic) => pic.category?.toLowerCase() === title?.toLowerCase());
        setPictures(filtered);
      })
      .catch((err) => console.error('Erreur chargement galleries', err));
  }, [title]);

  const seoDescription = useMemo(() => {
    const key = title?.toLowerCase() || '';
    return (
      descriptions[key] ||
      `Découvrez les réalisations de ${title} sur mesure signées LGS Métallerie à Sahurs près de Rouen.`
    );
  }, [title]);

  if (!category) {
    return <p>Catégorie non trouvée</p>;
  }

  return (
    <div className="galerie">
      <Seo
        title={`${category.title} sur mesure en Normandie`}
        description={seoDescription}
        path={`/galerie/${encodeURIComponent(category.title)}`}
      />

      <h1 className="galerie_title">{category.title} sur mesure</h1>
      <p className="galerie_description">{category.description}</p>
      <div className="galerie_content">
        {pictures.map((pic, index) => (
          <PictureCard
            key={pic._id || index}
            cover={pic.cover}
            pictures={pic.pictures}
            categoryTitle={category.title}
          />
        ))}
      </div>
    </div>
  );
}

export default Galerie;
