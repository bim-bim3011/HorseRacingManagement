import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/race-entries';

export async function getMyHorseEntries() {
  const response = await fetchWithAuth(`${API_BASE}/my-entries`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch race entries');
  }
  return data.result;
}
