import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/admin/users';

export async function searchAdminUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.append('page', params.page);
  if (params.size !== undefined) query.append('size', params.size);
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.status) query.append('status', params.status);
  if (params.roleId) query.append('roleId', params.roleId);

  const response = await fetchWithAuth(`${API_BASE}?${query.toString()}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data.result;
}

export async function getAdminUserDetail(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to fetch user details');
  }
  return data.result;
}

export async function changeUserStatus(id, status) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to change status');
  }
  return data.result;
}

export async function assignUserRoles(id, roleIds) {
  const response = await fetchWithAuth(`${API_BASE}/${id}/roles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roleIds }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to update roles');
  }
  return data.result;
}

export async function deleteUser(id) {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok || data.code !== 1000) {
    throw new Error(data.message || 'Failed to delete user');
  }
  return data.result;
}
