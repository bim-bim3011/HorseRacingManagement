import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = (tournamentId, raceId) => `/api/tournaments/${tournamentId}/races/${raceId}/violations`;

export async function createViolation(tournamentId, raceId, violationData) {
  const response = await fetchWithAuth(API_BASE(tournamentId, raceId), {
    method: 'POST',
    body: JSON.stringify(violationData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create violation');
  }
  return data.result;
}

export async function getViolations(tournamentId, raceId) {
  const response = await fetchWithAuth(API_BASE(tournamentId, raceId), {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch violations');
  }
  return data.result;
}

export async function deleteViolation(tournamentId, raceId, violationId) {
  const response = await fetchWithAuth(`${API_BASE(tournamentId, raceId)}/${violationId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete violation');
  }
  return data.result;
}
