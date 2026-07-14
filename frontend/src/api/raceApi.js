import { fetchWithAuth } from '../utils/fetchWithAuth';

const getApiBase = (tournamentId) => `/api/tournaments/${tournamentId}/races`;

export async function getAllRaces(tournamentId) {
  const response = await fetchWithAuth(getApiBase(tournamentId), {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch races');
  }
  return data.result;
}

export async function getRaceById(tournamentId, raceId) {
  const response = await fetchWithAuth(`${getApiBase(tournamentId)}/${raceId}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch race');
  }
  return data.result;
}

export async function createRace(tournamentId, raceData) {
  const response = await fetchWithAuth(getApiBase(tournamentId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(raceData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create race');
  }
  return data.result;
}

export async function updateRace(tournamentId, raceId, raceData) {
  const response = await fetchWithAuth(`${getApiBase(tournamentId)}/${raceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(raceData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update race');
  }
  return data.result;
}

export async function deleteRace(tournamentId, raceId) {
  const response = await fetchWithAuth(`${getApiBase(tournamentId)}/${raceId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete race');
  }
  return data.result;
}

export async function activateRace(tournamentId, raceId) {
  const response = await fetchWithAuth(`${getApiBase(tournamentId)}/${raceId}/activate`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to activate race');
  }
  return data.result;
}

export async function markReadyForRace(tournamentId, raceId) {
  const response = await fetchWithAuth(`${getApiBase(tournamentId)}/${raceId}/ready`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to mark race as ready');
  }
  return data.result;
}
