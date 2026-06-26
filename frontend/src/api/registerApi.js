const API_BASE = '/api';

/**
 * Register a new spectator account.
 * POST /api/register/spectator
 *
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<object>} The created spectator data
 */
export async function registerSpectatorApi({ username, email, password }) {
  const response = await fetch(`${API_BASE}/register/spectator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Registration failed');
  }

  return data.result;
}
