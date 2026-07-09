import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_BASE = '/api/tournaments';

export async function getMyRegistrations(tournamentId = 0) { // The backend endpoint seems to expect tournamentId in path but it's not strictly used for /my-registrations in standard REST if it returns all, wait let's look at the controller. 
  // Wait, the controller says `@GetMapping("/my-registrations")` inside `@RequestMapping("/api/tournaments/{tournamentId}/registrations")`
  // That means we need tournamentId. But typically we might want all registrations across tournaments. Let's assume we pass 0 or a specific ID.
  const response = await fetchWithAuth(`${API_BASE}/${tournamentId}/registrations/my-registrations`, {
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
