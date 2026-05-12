// In development: Vite proxies /api → localhost:3001
// In production:  set VITE_API_URL to your Railway backend URL
//   e.g. https://las-var-expenses-backend.up.railway.app
const BASE = import.meta.env.VITE_API_URL ?? '';

// Get auth token from localStorage
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

const api = {
  get: (path) => fetch(`${BASE}${path}`, {
    headers: getAuthHeaders()
  }).then(r => r.json()),

  post: (path, body) => fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  }).then(r => r.json()),

  patch: (path, body) => fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  }).then(r => r.json()),

  delete: (path) => fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(r => r.json()),
};

export default api;
