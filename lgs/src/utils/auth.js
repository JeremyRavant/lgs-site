const TOKEN_KEY = 'lgs_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (t) =>
  localStorage.setItem(TOKEN_KEY, t);

export const clearToken = () =>
  localStorage.removeItem(TOKEN_KEY);

// fetch protégé qui ajoute l’Authorization si on a un token
export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});

  const token = getToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resp = await fetch(input, {
    ...init,
    headers,
  });

  if (resp.status === 401) {
    clearToken();
    window.location.href = '/login';

    return new Response(null, {
      status: 401,
    });
  }

  return resp;
}

const API_BASE = (
  import.meta.env.VITE_API_BASE || ''
).replace(/\/$/, '');

export function getImageUrl(path) {
  if (!path) return '';

  const value = String(path).trim();

  // Cas d'une URL Cloudinary collée par erreur
  const cloudinaryIndex = value.indexOf(
    'https://res.cloudinary.com/'
  );

  if (cloudinaryIndex !== -1) {
    return value.slice(cloudinaryIndex);
  }

  // URL externe déjà complète
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  // Fichiers stockés sur le backend
  if (value.startsWith('/uploads/')) {
    return `${API_BASE}${value}`;
  }

  if (value.startsWith('uploads/')) {
    return `${API_BASE}/${value}`;
  }

  return `${API_BASE}/${value.replace(/^\/+/, '')}`;
}