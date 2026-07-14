import React, { useState } from 'react';
import { raceSimulatorApi } from '../../api/raceSimulatorApi';

const RaceAdminControls = ({ tournamentId, raceId, status }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (actionFn, actionName) => {
    try {
      setLoading(true);
      setError('');
      await actionFn(tournamentId, raceId);
    } catch (err) {
      console.error(`Failed to ${actionName} race:`, err);
      setError(err.message || `Failed to ${actionName} race`);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isFinished = status === 'FINISHED';

  return (
    <div className="bg-surface-container rounded-xl shadow-sm border border-outline-variant p-4 mt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-on-surface uppercase tracking-tight">Admin Controls</h3>
          <p className="text-sm text-on-surface-variant font-body">
            Status: <span className="font-semibold text-indigo-500">{status || 'NOT STARTED'}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {error && <span className="text-sm text-error mr-2">{error}</span>}
          
          <button
            onClick={() => handleAction(raceSimulatorApi.startRace, 'start')}
            disabled={loading || isRunning || isFinished || isPaused}
            className={`px-6 py-2 rounded-md font-semibold transition-colors flex items-center ${
              loading || isRunning || isFinished || isPaused
                ? 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed' 
                : 'bg-primary hover:bg-on-primary-fixed-variant text-on-primary shadow-sm'
            }`}
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start
          </button>
          
          <button
            onClick={() => handleAction(raceSimulatorApi.pauseRace, 'pause')}
            disabled={loading || !isRunning}
            className={`px-6 py-2 rounded-md font-semibold transition-colors flex items-center ${
              loading || !isRunning
                ? 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm'
            }`}
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pause
          </button>
          
          <button
            onClick={() => handleAction(raceSimulatorApi.resumeRace, 'resume')}
            disabled={loading || !isPaused}
            className={`px-6 py-2 rounded-md font-semibold transition-colors flex items-center ${
              loading || !isPaused
                ? 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed' 
                : 'bg-primary hover:bg-on-primary-fixed-variant text-on-primary shadow-sm'
            }`}
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Resume
          </button>

          <button
            onClick={() => handleAction(raceSimulatorApi.stopRace, 'stop')}
            disabled={loading || isFinished || status === 'NOT STARTED' || !status}
            className={`px-6 py-2 rounded-md font-semibold transition-colors flex items-center ${
              loading || isFinished || status === 'NOT STARTED' || !status
                ? 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed' 
                : 'bg-error hover:bg-error/80 text-on-error shadow-sm'
            }`}
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceAdminControls;
