import { useEffect, useState } from "react";
import '../components/GoogleReviews.scss';
import { apiUrl } from "../src/utils/api";

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="stars" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const s = i < full ? "full" : i === full && half ? "half" : "empty";
        return <span key={i} className={`star ${s}`} aria-hidden>★</span>;
      })}
    </div>
  );
}

export default function GoogleReviews() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/google-reviews"))
      .then(r => r.json())
      .then(setData)
      .catch(() => setErr("Impossible de charger les avis Google."));
  }, []);

  if (err) return <p>{err}</p>;
  if (!data) return <p>Chargement des avis…</p>;

  const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
    import.meta.env?.VITE_GOOGLE_PLACE_ID || ""
  )}`;

  return (
    <section className="g-reviews">
      <header className="g-reviews__head">
        <h2>Avis Google</h2>
        <div className="g-reviews__score">
          <Stars value={data.rating} />
          <span>{data.rating} / 5 • {data.total} avis</span>
        </div>
      </header>

      <ul className="g-reviews__list">
        {data.reviews.map((r, i) => (
          <li key={i} className="g-reviews__item">
            <div className="g-reviews__author">
              {r.profile_photo_url && <img src={r.profile_photo_url} alt="" />}
              <div>
                <strong>
                  <a href={r.author_url} target="_blank" rel="noreferrer">
                    {r.author_name}
                  </a>
                </strong>
                <small>{r.relative_time_description}</small>
              </div>
            </div>
            <Stars value={r.rating} />
            <p className="g-reviews__text">{r.text}</p>
          </li>
        ))}
      </ul>

      <a href={data.url} target="_blank" rel="noreferrer">
        Voir tous les avis sur Google
      </a>
    </section>
  );
}