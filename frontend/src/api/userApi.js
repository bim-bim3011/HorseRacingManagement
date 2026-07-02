import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/user';

export async function getMyProfile() {
  const response = await fetchWithAuth(`${API_BASE}/my-profile`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch user profile');
  }
  return data.result;
}

export async function updateMyProfile(profileData) {
  const response = await fetchWithAuth(`${API_BASE}/my-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update user profile');
  }
  return data.result;
}
