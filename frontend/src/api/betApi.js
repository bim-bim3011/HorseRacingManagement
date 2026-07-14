import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/bets';

export async function placeBet(request) {
  const response = await fetchWithAuth(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to place bet');
  }
  return data.result;
}

export async function getMyBets() {
  const response = await fetchWithAuth(`${API_BASE}/my-bets`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch my bets');
  }
  return data.result;
}
