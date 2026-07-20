import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/admin/dashboard';

/**
 * Fetch overall dashboard metrics
 * @returns {Promise<Object>}
 */
export async function getDashboardMetrics() {
  const response = await fetchWithAuth(`${API_BASE}/metrics`);
  const data = await response.json();
  if (data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch dashboard metrics');
  }
  return data.result;
}

/**
 * Fetch user roles distribution chart data
 * @returns {Promise<Array>}
 */
export async function getUserRolesChart() {
  const response = await fetchWithAuth(`${API_BASE}/user-roles-chart`);
  const data = await response.json();
  if (data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch user roles chart');
  }
  return data.result;
}

/**
 * Fetch attention required items
 * @returns {Promise<Array>}
 */
export async function getAttentionRequired() {
  const response = await fetchWithAuth(`${API_BASE}/attention-required`);
  const data = await response.json();
  if (data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch attention required items');
  }
  return data.result;
}
