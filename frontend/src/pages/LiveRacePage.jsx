import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuth } from '../contexts/AuthContext';
import { getRaceById } from '../api/raceApi';
import { raceSimulatorApi } from '../api/raceSimulatorApi';
import RaceTrack from '../components/race/RaceTrack';
import RaceLeaderboard from '../components/race/RaceLeaderboard';
import RaceAdminControls from '../components/race/RaceAdminControls';

const LiveRacePage = () => {
  const { tournamentId, raceId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [raceData, setRaceData] = useState(null);
  const [raceState, setRaceState] = useState({
    status: 'NOT STARTED',
    distance: 1000,
    tick: 0,
    horses: []
  });
  const [raceEntries, setRaceEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const clientRef = useRef(null);

  // Check if user is admin or owner to show controls
  const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_HORSE_OWNER');

  useEffect(() => {
    // 1. Fetch Race Info (entries, etc.)
    const initData = async () => {
      try {
        setLoading(true);
        // Fetch base race data and entries
        const [data, entries] = await Promise.all([
          getRaceById(tournamentId, raceId),
          import('../api/raceEntryApi').then(m => m.getEntriesByRace(raceId))
        ]);
        setRaceData(data);
        setRaceEntries(entries);
        
        // Try fetching initial race state if it's already running
        try {
          const stateData = await raceSimulatorApi.getRaceState(tournamentId, raceId);
          if (stateData) {
            setRaceState(stateData);
          }
        } catch (e) {
          console.log("No initial running state found or not started yet.");
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load race data.');
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [tournamentId, raceId]);

  useEffect(() => {
    // 2. Setup STOMP WebSocket Connection
    // Ensure we use the full backend URL for SockJS
    const socketUrl = 'http://localhost:8080/ws';
    
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        // Subscribe to this specific race's topic
        client.subscribe(`/topic/tournaments/${tournamentId}/races/${raceId}`, (message) => {
          if (message.body) {
            const payload = JSON.parse(message.body);
            // payload is RaceMessage<RaceSnapshotResponse>
            if (payload.data) {
              setRaceState(payload.data);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      // Pass auth token if needed by your JwtChannelInterceptor
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    client.activate();
    clientRef.current = client;

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [tournamentId, raceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface-container-lowest text-on-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest text-on-surface flex-col">
        <h2 className="text-2xl text-error mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-on-primary rounded font-interactive-md">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest p-4 md:p-8 flex flex-col font-sans text-on-surface">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate(`/races/${tournamentId}/${raceId}`)}
            className="text-on-surface-variant hover:text-primary transition-colors mb-2 flex items-center text-sm font-interactive-md"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Race Details
          </button>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-on-surface">
            {raceData?.name || `Race #${raceId}`}
          </h1>
          <p className="text-on-surface-variant font-body mt-1">
            Distance: {raceState.distance || raceData?.distance || 0}m | Status: <span className="text-primary font-bold">{raceState.status}</span>
          </p>
        </div>
        
        {/* Simple live indicator */}
        <div className="flex items-center space-x-2 bg-surface px-4 py-2 rounded-full border border-outline-variant shadow-sm">
          <div className={`w-3 h-3 rounded-full ${raceState.status === 'RUNNING' ? 'bg-error animate-pulse' : 'bg-surface-variant'}`}></div>
          <span className="font-bold tracking-widest text-sm uppercase text-on-surface">LIVE</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        {/* Main Track Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 min-h-[400px] flex items-center justify-center bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant">
            {raceState.horses && raceState.horses.length > 0 ? (
              <RaceTrack 
                horses={raceState.horses} 
                distance={raceState.distance} 
                raceEntries={raceEntries} 
              />
            ) : (
              <div className="text-on-surface-variant flex flex-col items-center">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xl font-display">Waiting for race data...</p>
              </div>
            )}
          </div>
          
          {/* Admin Controls below the track */}
          {isAdmin && (
            <RaceAdminControls 
              tournamentId={tournamentId} 
              raceId={raceId} 
              status={raceState.status} 
            />
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="xl:w-1/3 w-full h-[500px] xl:h-auto border border-outline-variant rounded-2xl overflow-hidden shadow-sm bg-surface">
          <RaceLeaderboard 
            horses={raceState.horses} 
            raceEntries={raceEntries} 
          />
        </div>
      </div>
    </div>
  );
};

export default LiveRacePage;
