import { useEffect, useState } from "react";
import "../components/GoogleReviews.scss";
import { apiUrl } from "../src/utils/api";

function Stars({ value = 0 }) {
  const safeValue = Number(value) || 0;
  const full = Math.floor(safeValue);
  const half = safeValue - full >= 0.5;

  return (
    <div className="stars" aria-label={`${safeValue} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const s =
          i < full ? "full" : i === full && half ? "half" : "empty";

        return (
          <span key={i} className={`star ${s}`} aria-hidden>
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function GoogleReviews() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/google-reviews"))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result || !Array.isArray(result.reviews)) {
          throw new Error("Données Google Reviews invalides");
        }

        return result;
      })
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error("Erreur Google Reviews :", error);
        setErr("Impossible de charger les avis Google.");
      });
  }, []);

  /*
   * Important :
   * si Google Reviews ne fonctionne pas,
   * on n'empêche jamais le reste du site de s'afficher.
   */
  if (err) {
    return null;
  }

  if (!data) {
    return null;
  }

  const reviews = Array.isArray(data.reviews)
    ? data.reviews
    : [];

  return (
    <section className="g-reviews">
      <header className="g-reviews__head">
        <h2>Avis Google sur notre métallerie à Sahurs</h2>

        <div className="g-reviews__score">
          <Stars value={data.rating} />

          <span>
            {data.rating} / 5 • {data.total} avis
          </span>
        </div>
      </header>

      <ul className="g-reviews__list">
        {reviews.map((r, i) => (
          <li key={i} className="g-reviews__item">
            <div className="g-reviews__author">
              {r?.profile_photo_url && (
                <img
                  src={r.profile_photo_url}
                  alt=""
                />
              )}

              <div>
                <strong>
                  {r?.author_url ? (
                    <a
                      href={r.author_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r?.author_name || "Client Google"}
                    </a>
                  ) : (
                    r?.author_name || "Client Google"
                  )}
                </strong>

                <small>
                  {r?.relative_time_description || ""}
                </small>
              </div>
            </div>

            <Stars value={r?.rating} />

            {r?.text && (
              <p className="g-reviews__text">
                {r.text}
              </p>
            )}
          </li>
        ))}
      </ul>

      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
        >
          Voir tous les avis sur Google
        </a>
      )}
    </section>
  );
}