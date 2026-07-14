import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/jockey';

/**
 * Update jockey competition profile.
 * PUT /api/jockey/{id}/competition-profile
 *
 * @param {string} id
 * @param {FormData} formData - Profile details including file
 * @returns {Promise<object>}
 */
export async function updateJockeyCompetitionProfileApi(id, formData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/competition-profile`, {
    method: 'PUT',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update competition profile');
  }

  return data.result;
}
