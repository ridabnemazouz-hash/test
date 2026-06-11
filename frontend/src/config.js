const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000' : '/_/backend');

const ngrokHeaders = { 'ngrok-skip-browser-warning': 'true' };

export async function apiFetch(path, options = {}) {
  options.headers = { ...ngrokHeaders, ...options.headers };
  options.credentials = 'include';
  const res = await fetch(`${API_BASE}${path}`, options);
  
  if (res.status === 401 && !path.includes('/auth/login')) {
    // Session expired, clear any local state and redirect to login
    window.location.href = '/login';
  }
  
  return res;
}

export default API_BASE;
