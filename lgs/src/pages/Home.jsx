import React, { useEffect, useState } from 'react';
import './Home.scss';
import { Link } from 'react-router-dom';
import Categorie from '../../components/CategorieCard';
import axios from 'axios';
import GoogleReviews from '../../components/GoogleReviews';
import { apiUrl } from '../utils/api';
import Seo from '../components/Seo.jsx';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl('/api/categories/with-random-image'))
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];

        const merged = data.map((item) => ({
          ...item,
          cover: item.randomImageUrl ? `${API_BASE}${item.randomImageUrl}` : item.cover,
        }));

        setCategories(merged);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des catégories :', error);
      });
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'LGS Métallerie',
    image: 'https://www.lgs-metallerie.com/cover.jpg',
    url: 'https://www.lgs-metallerie.com/',
    telephone: '+33610520178',
    email: 'contact@lgs-metallerie.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '16 Route de la Forêt',
      postalCode: '76113',
      addressLocality: 'Sahurs',
      addressCountry: 'FR',
    },
    areaServed: ['Rouen', 'Seine-Maritime', 'Normandie'],
    priceRange: '€€',
    description:
      'Métallerie sur mesure à Sahurs près de Rouen : verrières, escaliers, garde-corps, portails et ouvrages métalliques en Normandie.',
  };

  return (
    <div className="banner-wrapper">
      <Seo
        title="Métallerie sur mesure à Rouen et en Normandie"
        description="LGS Métallerie, atelier à Sahurs près de Rouen : verrières, escaliers, garde-corps, portails et réalisations métalliques sur mesure en Normandie."
        path="/"
        structuredData={structuredData}
      />

      <section className="hero-panel">
        <div className="home__picture">
          <img
            src="cover.jpg"
            alt="Ouvrage de métallerie sur mesure réalisé par LGS Métallerie près de Rouen"
          />
        </div>

        <div className="hero-badge-row">
          <span>Fabrication sur mesure</span>
          <span>Pose soignée</span>
          <span>Rouen & agglomération</span>
        </div>
      </section>

      <section className="description">
        <div className="description__content">
          <div className="first__description">
            <p className="eyebrow">LGS Métallerie</p>
            <h1>Métallerie sur mesure à Sahurs, près de Rouen</h1>
            <p>
              Notre savoir-faire, allié à notre expérience, nous pousse toujours à dépasser les
              attentes de nos clients en réalisant des ouvrages uniques et durables. Situés à
              Sahurs, dans l’agglomération rouennaise en Seine-Maritime, nous sommes spécialisés
              dans la métallerie, la serrurerie et la métallerie d’art pour donner vie à vos
              projets sur mesure en Normandie.
            </p>
            <p>
              Nous concevons et installons des créations métalliques esthétiques, fonctionnelles
              et pensées pour durer, aussi bien pour les particuliers que pour les professionnels.
            </p>

            <div className="hero-actions">
              <Link to="/contact" className="btn btn--primary">
                Demander un devis
              </Link>
              <a href="#realisations" className="btn btn--secondary">
                Voir nos réalisations
              </a>
            </div>
          </div>

          <div className="second__description">
            <p className="mini-title">Nos savoir-faire</p>
            <h2>Escaliers, verrières, garde-corps et ouvrages métalliques sur mesure</h2>
            <ul>
              <li>Escaliers métalliques et mixtes</li>
              <li>Garde-corps intérieurs et extérieurs</li>
              <li>Verrières intérieures et verrières extérieures</li>
              <li>Portails et portillons sur mesure</li>
              <li>Balustrades et structures décoratives</li>
              <li>Mobilier et créations métalliques personnalisées</li>
            </ul>
          </div>
        </div>

        <div className="picture-block">
          <img
            src="/description.jpg"
            alt="Atelier de métallerie et réalisation sur mesure près de Rouen"
          />
        </div>
      </section>

      <section className="section-heading" id="realisations">
        <p>Nos créations</p>
        <h2>Des réalisations de métallerie pensées pour durer</h2>
      </section>

      <div>
        {categories.map((item, index) => (
          <Link to={`/galerie/${item.title}`} key={item._id || index} aria-label={`Découvrir la galerie ${item.title}`}>
            <Categorie {...item} index={index} />
          </Link>
        ))}
      </div>

      <section className="section-heading section-heading--seo">
        <p>Zone d’intervention</p>
        <h2>Votre métallier en Seine-Maritime et en Normandie</h2>
        <p>
          Basée à Sahurs, LGS Métallerie intervient près de Rouen et dans toute la Normandie pour
          la fabrication et la pose de verrières, escaliers, garde-corps, portails et autres
          ouvrages métalliques sur mesure.
        </p>
      </section>

      <GoogleReviews />
    </div>
  );
}

export default Home;
