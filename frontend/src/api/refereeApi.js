import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/referee';

export async function createReferee(refereeData) {
  const response = await fetchWithAuth(API_BASE, {
    method: 'POST',
    body: JSON.stringify(refereeData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create referee');
  }
  return data.result;
}

export async function getAllReferees() {
  const response = await fetchWithAuth(API_BASE, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch referees');
  }
  return data.result;
}

export async function getActiveReferees() {
  const response = await fetchWithAuth(`${API_BASE}/active`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch active referees');
  }
  return data.result;
}

export async function getRefereeById(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch referee');
  }
  return data.result;
}

export async function updateReferee(id, refereeData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(refereeData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update referee');
  }
  return data.result;
}

export async function deleteReferee(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete referee');
  }
  return data.result;
}

export async function getAssignmentsByReferee(refereeId) {
  const response = await fetchWithAuth(`${API_BASE}/${refereeId}/assignments`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch assignments');
  }
  return data.result;
}

export async function getAssignmentsByRace(raceId) {
  const response = await fetchWithAuth(`${API_BASE}/races/${raceId}/assignments`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch assignments for race');
  }
  return data.result;
}

export async function assignToRace(raceId, refereeId) {
  const response = await fetchWithAuth(`${API_BASE}/races/${raceId}/assignments`, {
    method: 'POST',
    body: JSON.stringify({ refereeId }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to assign referee');
  }
  return data.result;
}

export async function unassignFromRace(raceId, refereeId) {
  const response = await fetchWithAuth(`${API_BASE}/races/${raceId}/assignments/${refereeId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to unassign referee');
  }
  return data.result;
}
