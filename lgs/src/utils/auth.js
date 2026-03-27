const TOKEN_KEY = 'lgs_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// fetch protégé qui ajoute l’Authorization si on a un token
export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const resp = await fetch(input, { ...init, headers });
  if (resp.status === 401) {
    // token expiré / invalide -> on nettoie et on redirige vers login
    clearToken();
    window.location.href = '/login';
    return new Response(null, { status: 401 });
  }
  return resp;
}

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export function getImageUrl(path) {
  if (!path) return "";
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  if (path.startsWith("/uploads/")) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}
