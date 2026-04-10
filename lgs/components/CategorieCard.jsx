import React from 'react'
import '../components/CategorieCard.scss'
import { getImageUrl } from "../src/utils/auth";

function CategorieCard({ title, description, cover, index }) {
    const isEven = index % 2 === 0;
  
    return (
      <div id="realisations" className={`card ${isEven ? 'card__left' : 'card__right'}`}>
        <img src={getImageUrl(cover)} alt={`${title} sur mesure réalisé par LGS Métallerie`} loading="lazy" />
        <div className="categorie__title">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    );
  }

export default CategorieCard