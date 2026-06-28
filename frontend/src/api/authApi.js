const API_BASE = '/api';

/**
 * Login user with username and password.
 * POST /api/auth/login
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ accessToken: string, refreshToken: string, authenticated: boolean }>}
 */
export async function loginApi(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Login failed');
  }

  return data.result;
}

/**
 * Logout user by blacklisting the access token.
 * POST /api/auth/logout
 *
 * @param {string} accessToken
 * @returns {Promise<object>}
 */
export async function logoutApi(accessToken) {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token: accessToken }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Logout failed');
  }

  return data.result;
}

/**
 * Refresh access token using HttpOnly cookie.
 * POST /api/auth/refresh
 *
 * @returns {Promise<{ accessToken: string, authenticated: boolean }>}
 */
export async function refreshTokenApi() {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Refresh failed');
  }

  return data.result;
}
