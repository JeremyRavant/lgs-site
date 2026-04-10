import './Mentions.scss';
import Seo from '../components/Seo.jsx';

export default function Mentions() {
  return (
    <div className="mentions-container">
      <Seo
        title="Mentions légales"
        description="Consultez les mentions légales de LGS Métallerie : éditeur du site, hébergement, données personnelles, cookies et responsabilité."
        path="/mentions"
        robots="noindex, follow"
      />

      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          LGS METALLERIE – SARL au capital de 1 000 €
          <br />
          Siège social : 16 Route de la Forêt – 76113 Sahurs – France
          <br />
          SIREN : 908 349 681
          <br />
          SIRET : 908 349 681 00019
          <br />
          RCS : Rouen 908 349 681
          <br />
          TVA intracommunautaire : FR22908349681
          <br />
          Téléphone : 06 10 52 01 78
          <br />
          Email : contact@lgs-metallerie.com
        </p>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>Guillaume Simon, gérant de la société LGS METALLERIE</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Site hébergé par Render (plateforme cloud).
          <br />
          Nom de domaine géré via IONOS.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L’ensemble du contenu présent sur le site (textes, images, graphismes, logos,
          vidéos, icônes, etc.) est la propriété exclusive de LGS METALLERIE, sauf mention
          contraire. Toute reproduction, représentation, modification ou adaptation, totale ou
          partielle, est interdite sans l’autorisation écrite préalable.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Les informations collectées via les formulaires sont destinées uniquement à LGS
          METALLERIE afin de répondre aux demandes des utilisateurs. Conformément au RGPD, vous
          disposez d’un droit d’accès, de rectification, de suppression et d’opposition concernant
          vos données. Vous pouvez exercer ce droit via le formulaire de contact du site.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site peut utiliser des cookies afin d’améliorer l’expérience utilisateur et réaliser
          des statistiques de visite. Vous pouvez configurer votre navigateur pour refuser les
          cookies.
        </p>
      </section>

      <section>
        <h2>Responsabilité</h2>
        <p>
          LGS METALLERIE s’efforce de fournir des informations aussi précises que possible.
          Toutefois, la société ne pourra être tenue responsable des omissions, inexactitudes ou
          défauts de mise à jour.
        </p>
      </section>
    </div>
  );
}
