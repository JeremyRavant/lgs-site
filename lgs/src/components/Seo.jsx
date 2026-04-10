import { useEffect } from 'react';

const SITE_NAME = 'LGS Métallerie';
const SITE_URL = 'https://www.lgs-metallerie.com';
const DEFAULT_IMAGE = `${SITE_URL}/cover.jpg`;

function upsertMeta({ name, property, content }) {
  if (!content) return;

  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (name) element.setAttribute('name', name);
    if (property) element.setAttribute('property', property);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;

  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export default function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index, follow',
  structuredData,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonical = `${SITE_URL}${path}`;

    document.documentElement.lang = 'fr';
    document.title = fullTitle;

    upsertMeta({ name: 'description', content: description });
    upsertMeta({ name: 'robots', content: robots });
    upsertMeta({ property: 'og:locale', content: 'fr_FR' });
    upsertMeta({ property: 'og:site_name', content: SITE_NAME });
    upsertMeta({ property: 'og:title', content: fullTitle });
    upsertMeta({ property: 'og:description', content: description });
    upsertMeta({ property: 'og:type', content: type });
    upsertMeta({ property: 'og:url', content: canonical });
    upsertMeta({ property: 'og:image', content: image });
    upsertMeta({ name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta({ name: 'twitter:title', content: fullTitle });
    upsertMeta({ name: 'twitter:description', content: description });
    upsertMeta({ name: 'twitter:image', content: image });
    upsertLink('canonical', canonical);

    let script = document.getElementById('seo-structured-data');
    if (structuredData) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'seo-structured-data';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, type, robots, structuredData]);

  return null;
}
