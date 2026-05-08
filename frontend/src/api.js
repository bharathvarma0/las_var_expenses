// In development: Vite proxies /api → localhost:3001
// In production:  set VITE_API_URL to your Railway backend URL
//   e.g. https://las-var-expenses-backend.up.railway.app
const BASE = import.meta.env.VITE_API_URL ?? '';

const api = {
  get:  (path)       => fetch(`${BASE}${path}`).then(r => r.json()),
  post: (path, body) => fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json()),
};

export default api;
