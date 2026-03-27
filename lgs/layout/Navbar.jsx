import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import "./Navbar.scss";


export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Ferme le menu quand on change de route (optionnel si tu veux)
  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <nav className={`navbar ${open ? "is-open" : ""}`} role="navigation" aria-label="Navigation principale">
      <div className="navbar__inner">
        {/* Logo */}
        <div className="logo">
          <NavLink to="/" onClick={closeMenu}>
            <img src="/LogoLGS.png" alt="LGS Métallerie — retour à l’accueil" />
          </NavLink>
        </div>

        {/* Bouton hamburger */}
        <button
          className="hamburger"
          aria-label="Ouvrir/fermer le menu"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen(o => !o)}
        >
          {/* SVG burger / croix */}
          <svg className="icon icon-burger" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <svg className="icon icon-close" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Liens */}
        <div id="nav-menu" className="menu" role="menu">
          <HashLink smooth to="/#realisations" role="menuitem" onClick={closeMenu}>
            Nos réalisations
          </HashLink>

          <NavLink to="/contact" role="menuitem" onClick={closeMenu}>
            Nous contacter
          </NavLink>

          <a href="#about" role="menuitem" onClick={closeMenu}>
            À propos
          </a>

          <a href="https://www.facebook.com/guillaumesimon88" className="social" aria-label="Facebook" onClick={closeMenu}>
            <img src="/logoFacebook.webp" alt="" />
          </a>
          <a href="https://www.instagram.com/lgs_metallerie/" className="social" aria-label="Instagram" onClick={closeMenu}>
            <img src="/logoInsta.webp" alt="" />
          </a>
        </div>
      </div>
    </nav>
  );
}
