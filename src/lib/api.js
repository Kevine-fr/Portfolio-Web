// Centralized API client for the portfolio.
// Reads VITE_API_URL at build time (Vite bakes import.meta.env.*).
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});

// Resolve a stored path/URL (e.g. "/uploads/xxx.jpg") to a fully qualified URL.
// API_URL ends in "/api/v1", so strip it to get the origin and prefix.
export function resolveMediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith('/'))      return path;
  const origin = API_URL.replace(/\/api\/v\d+\/?$/, '');
  return `${origin}${path}`;
}

// Simple helpers
export const apiGet  = (url, params) => api.get(url, { params }).then(r => r.data);
export const apiPost = (url, data)   => api.post(url, data).then(r => r.data);
