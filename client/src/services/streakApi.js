// Central API layer. localStorage holds ONLY the auth token, never streak/reward data.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/auth')) { localStorage.removeItem('token'); window.location.href = '/login'; }
  if (!res.ok) throw Object.assign(new Error(data.message || 'Unable to process your reward. Please try again.'), { code: data.code });
  return data;
}
export const login = (email, password) => req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getStreak = () => req('/daily-streak');
export const getStatus = () => req('/daily-streak/status');
export const claimStreak = () => req('/daily-streak/claim', { method: 'POST', body: '{}' }); // server derives the day
export const getHistory = () => req('/daily-streak/history');
export const register = (name, email, password) => req('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
