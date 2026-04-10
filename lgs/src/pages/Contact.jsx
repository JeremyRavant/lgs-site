import React from 'react';
import './Contact.scss';
import Seo from '../components/Seo.jsx';

function Contact() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact LGS Métallerie',
    url: 'https://www.lgs-metallerie.com/contact',
    description:
      'Contactez LGS Métallerie à Sahurs près de Rouen pour votre projet de verrière, escalier, garde-corps ou métallerie sur mesure.',
  };

  return (
    <div className="contact">
      <Seo
        title="Contact métallier à Sahurs près de Rouen"
        description="Contactez LGS Métallerie pour votre projet de verrière, escalier, garde-corps, portail ou ouvrage métallique sur mesure en Normandie."
        path="/contact"
        structuredData={structuredData}
      />

      <h1 className="contact__title">Contactez LGS Métallerie</h1>
      <div className="contact__content">
        <div className="infos">
          <p>
            Notre atelier de métallerie est fermé au public, mais nous restons disponibles pour
            échanger sur votre projet de verrière, d’escalier, de garde-corps ou de fabrication
            métallique sur mesure à Sahurs, Rouen et en Normandie.
          </p>
          <div className="info__container">
            <div className="info__section">
              <div className="icone__section">
                <i className="fa-regular fa-clock"></i>
              </div>
              <div className="content__info">
                <h2>Heures d&apos;ouverture</h2>
                <p>Lundi au vendredi</p>
                <p>8h00 à 12h00 et 14h00 à 18h00</p>
              </div>
            </div>
            <div className="info__section">
              <div className="icone__section">
                <i className="fa-regular fa-envelope"></i>
              </div>
              <div className="content__info">
                <h2>Coordonnées</h2>
                <p>
                  <a href="tel:+33610520178">06 10 52 01 78</a>
                </p>
                <p>
                  <a href="mailto:contact@lgs-metallerie.com">contact@lgs-metallerie.com</a>
                </p>
              </div>
            </div>
            <div className="info__section">
              <div className="icone__section">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="content__info">
                <h2>Adresse</h2>
                <p>16 route de la Forêt</p>
                <p>76113 Sahurs</p>
              </div>
            </div>
          </div>
        </div>
        <div className="infos__picture">
          <img
            src="contact-picture.jpg"
            alt="Verrière métallique sur mesure réalisée par LGS Métallerie"
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
