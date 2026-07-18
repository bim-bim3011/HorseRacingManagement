import { fetchWithAuth } from '../utils/fetchWithAuth';

const getApiBase = (tournamentId, raceId) => `/api/tournaments/${tournamentId}/races/${raceId}/simulator`;

export const raceSimulatorApi = {
  startRace: async (tournamentId, raceId) => {
    const response = await fetchWithAuth(`${getApiBase(tournamentId, raceId)}/start`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to start race');
    // If backend returns a string, we might need response.text()
    return response.text();
  },

  pauseRace: async (tournamentId, raceId) => {
    const response = await fetchWithAuth(`${getApiBase(tournamentId, raceId)}/pause`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to pause race');
    return response.text();
  },

  resumeRace: async (tournamentId, raceId) => {
    const response = await fetchWithAuth(`${getApiBase(tournamentId, raceId)}/resume`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to resume race');
    return response.text();
  },

  stopRace: async (tournamentId, raceId) => {
    const response = await fetchWithAuth(`${getApiBase(tournamentId, raceId)}/stop`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to stop race');
    return response.text();
  },

  getRaceState: async (tournamentId, raceId) => {
    const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/races/${raceId}/simulator/state`);
    if (!response.ok) {
      throw new Error('Failed to fetch race state');
    }
    return response.json();
  },

  flagHorse: async (tournamentId, raceId, horseId) => {
    const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/races/${raceId}/simulator/flag/${horseId}`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Failed to flag horse');
    }
    return response.text();
  },

  getIncidents: async (tournamentId, raceId) => {
    const response = await fetchWithAuth(`/api/tournaments/${tournamentId}/races/${raceId}/simulator/incidents`);
    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return response.json();
  }
};
