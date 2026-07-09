import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = (tournamentId) => `/api/tournaments/${tournamentId}/penalty-rules`;

export async function getAllPenaltyRules(tournamentId) {
  const response = await fetchWithAuth(API_BASE(tournamentId), {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch penalty rules');
  }
  return data.result;
}

export async function createPenaltyRule(tournamentId, ruleData) {
  const response = await fetchWithAuth(API_BASE(tournamentId), {
    method: 'POST',
    body: JSON.stringify(ruleData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create penalty rule');
  }
  return data.result;
}

export async function updatePenaltyRule(tournamentId, ruleId, ruleData) {
  const response = await fetchWithAuth(`${API_BASE(tournamentId)}/${ruleId}`, {
    method: 'PUT',
    body: JSON.stringify(ruleData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update penalty rule');
  }
  return data.result;
}

export async function deletePenaltyRule(tournamentId, ruleId) {
  const response = await fetchWithAuth(`${API_BASE(tournamentId)}/${ruleId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete penalty rule');
  }
  return data.result;
}
