const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export function apiUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}