import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/withdrawals';

export async function createWithdrawalRequest(requestData) {
  const response = await fetchWithAuth(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to create withdrawal request');
  }
  return data.result;
}

export async function getMyWithdrawalRequests() {
  const response = await fetchWithAuth(`${API_BASE}/my-requests`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch your withdrawal requests');
  }
  return data.result;
}

export async function getAllWithdrawalRequests() {
  const response = await fetchWithAuth(API_BASE, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch all withdrawal requests');
  }
  return data.result;
}

export async function approveWithdrawal(id, reviewData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData || { adminNote: '' }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to approve withdrawal');
  }
  return data.result;
}

export async function rejectWithdrawal(id, reviewData) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData || { adminNote: '' }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to reject withdrawal');
  }
  return data.result;
}

export async function markWithdrawalAsTransferred(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/mark-transferred`, {
    method: 'PATCH',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to mark withdrawal as transferred');
  }
  return data.result;
}
