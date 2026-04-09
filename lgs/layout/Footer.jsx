import React from 'react'
import './Footer.scss'
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer id="about">
      <div className='footer-card logo'>
        <img src="/LogoLGS.png" alt="Logo LGS" />
        <p>Créations métalliques sur mesure pensées pour durer.</p>
      </div>
      <div className='footer-card'>
        <span className='footer-label'>Coordonnées</span>
        <p>16, route de la forêt 76113 SAHURS</p>
        <p>Tél. 06 10 52 01 78</p>
      </div>
      <div className='footer-card'>
        <span className='footer-label'>Prestations</span>
        <p>LGS Métallerie : réalisation et pose d’escaliers, garde-corps, verrières intérieures et extérieures, portails, portillons et balustrades.</p>
      </div>
      <div className='footer-card'>
        <span className='footer-label'>Zone d’intervention</span>
        <p>Métallerie située à Sahurs, près de Rouen en Seine-Maritime, au cœur de la Normandie.</p>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} LGS Métallerie — Tous droits réservés —{" "}
          <Link to="/mentions" className="mentions-link">
            Mentions légales
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer
