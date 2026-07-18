import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/horse-owner';

export async function getOwnerOverview() {
  const response = await fetchWithAuth(`${API_BASE}/overview`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch owner overview');
  }
  return data.result;
}
