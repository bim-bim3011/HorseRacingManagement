import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/horses';

export async function getMyHorses() {
  const response = await fetchWithAuth(`${API_BASE}/my-horses`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch horses');
  }
  return data.result;
}

export async function getMyHorsesPaginated(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetchWithAuth(`${API_BASE}/my-horses/paginated${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch horses');
  }
  return data.result;
}

export async function createHorse(horseData) {
  const response = await fetchWithAuth(API_BASE, {
    method: 'POST',
    body: horseData instanceof FormData ? horseData : JSON.stringify(horseData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create horse');
  }
  return data.result;
}

export async function getHorse(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch horse');
  }
  return data.result;
}

export async function updateHorse(id, horseData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: horseData instanceof FormData ? horseData : JSON.stringify(horseData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update horse');
  }
  return data.result;
}

export async function deleteHorse(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete horse');
  }
  return data.result;
}

export async function uploadCertificate(id, formData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/upload-certificate`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to upload certificate');
  }
  return data.result;
}

export async function getPendingHorses() {
  const response = await fetchWithAuth(`${API_BASE}/pending`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch pending horses');
  }
  return data.result;
}

export async function approveHorse(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/approve`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to approve horse');
  }
  return data;
}

export async function rejectHorse(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/reject`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to reject horse');
  }
  return data;
}

export async function getHorseProfile(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/profile`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch horse profile');
  }
  return data.result;
}
