import "./Mentions.scss";

export default function Mentions() {
  return (
    <div className="mentions-container">
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          LGS METALLERIE – SARL au capital de 1 000 €<br />
          16 Route de la Forêt – 76113 Sahurs – France<br />
          SIREN : 908 349 681<br />
          SIRET : 908 349 681 00019<br />
          RCS : Rouen 908 349 681<br />
          TVA : FR22908349681
        </p>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>Guillaume Simon, gérant de LGS METALLERIE</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Hébergeur : Render<br />
          Plateforme cloud
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L’ensemble du contenu du site est la propriété exclusive de LGS
          METALLERIE. Toute reproduction est interdite sans autorisation.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Conformément au RGPD, vous disposez d’un droit d’accès, de modification
          et de suppression de vos données.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site peut utiliser des cookies pour améliorer l’expérience
          utilisateur.
        </p>
      </section>

      <section>
        <h2>Responsabilité</h2>
        <p>
          LGS METALLERIE s’efforce de fournir des informations précises mais ne
          saurait être tenue responsable des erreurs ou omissions.
        </p>
      </section>
    </div>
  );
}