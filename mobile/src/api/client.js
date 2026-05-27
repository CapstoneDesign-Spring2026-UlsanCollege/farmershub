const API_BASE_URL = 'https://farmershub-kkjd.onrender.com/api';

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed. Please try again.');
  }

  return payload;
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(form) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export async function getProducts() {
  return request('/products?limit=20');
}

export async function getFarmers() {
  return request('/farmers?limit=20');
}

export async function getFarmerById(id) {
  return request(`/farmers/${id}`);
}

export { API_BASE_URL };
