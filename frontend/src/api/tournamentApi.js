import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/tournaments';

export async function getAllTournaments() {
  const response = await fetchWithAuth(API_BASE, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch tournaments');
  }
  return data.result;
}

export async function getTournamentById(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch tournament');
  }
  return data.result;
}

export async function createTournament(tournamentData) {
  const response = await fetchWithAuth(API_BASE, {
    method: 'POST',
    body: tournamentData,
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create tournament');
  }
  return data.result;
}

export async function updateTournament(id, tournamentData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: tournamentData,
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update tournament');
  }
  return data.result;
}

export async function deleteTournament(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete tournament');
  }
  return data.result;
}

export async function registerHorseForTournament(tournamentId, horseIds) {
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations`, {
    method: 'POST',
    body: JSON.stringify({ horseIds }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to register horse');
  }
  return data.result;
}
