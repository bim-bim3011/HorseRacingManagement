import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/invitations';

export async function getAvailableJockeys() {
  const response = await fetchWithAuth(`${API_BASE}/available-jockeys`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch available jockeys');
  }
  return data.result;
}

export async function sendInvitation(raceId, horseId, jockeyId) {
  const response = await fetchWithAuth(API_BASE, {
    method: 'POST',
    body: JSON.stringify({ raceId, horseId, jockeyId }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to send invitation');
  }
  return data.result;
}

export async function getInvitationsByHorse(horseId) {
  const response = await fetchWithAuth(`${API_BASE}/horse/${horseId}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch invitations');
  }
  return data.result;
}

export async function getMyInvitations() {
  const response = await fetchWithAuth(`${API_BASE}/my-invitations`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch my invitations');
  }
  return data.result;
}

export async function acceptInvitation(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/accept`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to accept invitation');
  }
  return data.result;
}

export async function declineInvitation(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/decline`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to decline invitation');
  }
  return data.result;
}
