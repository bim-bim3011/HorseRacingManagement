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

export async function assignHorseToRace(raceId, horseId) {
  const response = await fetchWithAuth(`${API_BASE}/race/${raceId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ horseId })
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to assign horse to race');
  }
  return data.result;
}

export async function getEntriesByRace(raceId) {
  const response = await fetchWithAuth(`${API_BASE}/race/${raceId}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch entries');
  }
  return data.result;
}

export async function getMyJockeyEntries() {
  const response = await fetchWithAuth(`${API_BASE}/jockey-entries`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch jockey entries');
  }
  return data.result;
}

export async function rejectRaceEntry(entryId, rejectionReason) {
  const response = await fetchWithAuth(`${API_BASE}/${entryId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rejectionReason })
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to reject entry');
  }
  return data.result;
}
