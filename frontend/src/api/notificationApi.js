import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/notifications';

export async function getMyNotifications(page = 0, size = 10) {
  const response = await fetchWithAuth(`${API_BASE}?page=${page}&size=${size}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch notifications');
  }
  return data.result;
}

export async function getUnreadCount() {
  const response = await fetchWithAuth(`${API_BASE}/unread-count`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to get unread count');
  }
  return data.result;
}

export async function markAsRead(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/read`, {
    method: 'PUT',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to mark as read');
  }
  return data;
}

export async function markAllAsRead() {
  const response = await fetchWithAuth(`${API_BASE}/read-all`, {
    method: 'PUT',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to mark all as read');
  }
  return data;
}
