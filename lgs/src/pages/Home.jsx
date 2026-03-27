import React, { useEffect, useState } from 'react';
import './Home.scss';
import { Link } from "react-router-dom";
import Categorie from "../../components/categorieCard";
import axios from 'axios';
import GoogleReviews from '../../components/GoogleReviews';
import { apiUrl } from "../utils/api";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(apiUrl('/api/categories/with-random-image'))
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];

        // on remplace "cover" par l'image random (si dispo)
        const merged = data.map((item) => ({
          ...item,
          cover: item.randomImageUrl
            ? `${API_BASE}${item.randomImageUrl}`
            : item.cover,
        }));

        setCategories(merged);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des catégories :", error);
      });
  }, []);

  return (
    <div className="banner-wrapper">
      <div className='home__picture'>
        <img src="cover.jpg" alt="image de couverture" />
      </div>

      <div className="description">
        <div className='description__content'>
          <div className='first__description'>
            <h1>Métallerie à Rouen</h1>
            <p>
              Notre savoir-faire, allié à notre expérience, nous pousse toujours à dépasser les attentes de nos clients en
              réalisant des ouvrages uniques et durables. Situés à Sahurs, dans l’agglomération rouennaise en Seine-Maritime,
              nous sommes spécialisés dans la métallerie, la serrurerie et plus particulièrement la métallerie d’art, afin de
              transformer vos idées en pièces d’exception.
            </p>
          </div>

          <div className="second__description">
            <h2>Nous réalisons pour vous la fabrication et la pose :</h2>
            <ul>
              <li>d'escaliers</li>
              <li>de garde-corps</li>
              <li>de verrières intérieures</li>
              <li>de verrières extérieures</li>
              <li>de portails</li>
              <li>de portillons</li>
              <li>de balustrades</li>
              <li>de mobilier</li>
            </ul>
          </div>
        </div>

        <div className="picture-block">
          <img src="/description.jpg" alt="image de description" />
        </div>
      </div>

      <div>
        {categories.map((item, index) => (
          <Link
            to={`/galerie/${item.title}`}
            key={item._id || index}
          >
            <Categorie {...item} index={index} />
          </Link>
        ))}
      </div>

      <GoogleReviews />
    </div>
  );
}

export default Home;