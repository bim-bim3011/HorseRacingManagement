import { fetchWithAuth } from '../utils/fetchWithAuth';

const getApiBase = (raceId) => `/api/races/${raceId}/bet-odds`;

export async function getOddsByRace(raceId) {
  const response = await fetchWithAuth(getApiBase(raceId), {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch odds');
  }
  return data.result;
}

export async function initOddsForRace(raceId) {
  const response = await fetchWithAuth(`${getApiBase(raceId)}/init`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to initialize odds');
  }
  return data.result;
}

export async function toggleBettingStatus(raceId, status) {
  const response = await fetchWithAuth(`${getApiBase(raceId)}/status?status=${status}`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to toggle betting status');
  }
  return data.result;
}

export async function updateBatchOdds(raceId, requests) {
  const response = await fetchWithAuth(`${getApiBase(raceId)}/batch`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requests),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update batch odds');
  }
  return data.result;
}
