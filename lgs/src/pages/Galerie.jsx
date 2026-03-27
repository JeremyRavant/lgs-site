import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Galerie.scss';
import PictureCard from '../../components/PictureCard';
import axios from 'axios';
import { apiUrl } from '../utils/api';

function Galerie() {
  const { title } = useParams();
  const [category, setCategory] = useState(null);
  const [pictures, setPictures] = useState([]);

  useEffect(() => {
    // 1. Charger toutes les catégories
    axios.get(apiUrl('/api/categories'))
      .then((res) => {
        const found = res.data.find(
          (cat) => cat.title.toLowerCase() === title?.toLowerCase()
        );
        setCategory(found);
      })
      .catch((err) => console.error('Erreur chargement catégories', err));

    // 2. Charger toutes les galeries
    axios.get(apiUrl('/api/galleries'))
      .then((res) => {
        const filtered = res.data.filter(
          (pic) => pic.category?.toLowerCase() === title?.toLowerCase()
        );
        setPictures(filtered);
      })
      .catch((err) => console.error('Erreur chargement galleries', err));

  }, [title]);

  if (!category) {
    return <p>Catégorie non trouvée</p>;
  }

  return (
    <div className="galerie">
      <h2 className="galerie_title">{category.title}</h2>
      <p className="galerie_description">{category.description}</p>
      <div className="galerie_content">
        {pictures.map((pic, index) => (
          <PictureCard
            key={pic._id || index}
            cover={pic.cover}
            pictures={pic.pictures}
          />
        ))}
      </div>
    </div>
  );
}

export default Galerie;