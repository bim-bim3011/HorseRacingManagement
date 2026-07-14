import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/tournaments';

export async function getMyRegistrations(tournamentId) {
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations/my-registrations`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch registrations');
  }
  return data.result;
}

export async function getRegistrationsByTournament(tournamentId) {
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch registrations');
  }
  return data.result;
}

export async function registerHorse(tournamentId, horseId) {
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations`, {
    method: 'POST',
    body: JSON.stringify({ horseId }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to register horse');
  }
  return data.result;
}

export async function approveRegistration(tournamentId, registrationId) {
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations/${registrationId}/approve`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to approve registration');
  }
  return data.result;
}

export async function rejectRegistration(tournamentId, registrationId) {
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations/${registrationId}/reject`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to reject registration');
  }
  return data.result;
}

