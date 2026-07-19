import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getEntriesByRace, rejectRaceEntry } from '../../api/raceEntryApi';
import { markReadyForRace } from '../../api/raceApi';
import { raceSimulatorApi } from '../../api/raceSimulatorApi';
import { getAllPenaltyRules } from '../../api/penaltyRuleApi';
import { createViolation, getViolations, deleteViolation } from '../../api/violationApi';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import RaceTrack from '../race/RaceTrack';
import RaceLeaderboard from '../race/RaceLeaderboard';

export default function RefereeRaceContent({ currentStatus, onNextStep, selectedRace }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [kickModalOpen, setKickModalOpen] = useState(false);
  const [entryToKick, setEntryToKick] = useState(null);
  const [kickReason, setKickReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidents, setIncidents] = useState([]);

  // Flagging Modal States
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [horseToFlag, setHorseToFlag] = useState(null);

  // States for Reviewing phase
  const [violations, setViolations] = useState([]);
  const [penaltyRules, setPenaltyRules] = useState([]);
  const [reviewFormData, setReviewFormData] = useState({
    entryId: '',
    penaltyRuleIds: [],
    description: ''
  });

  // States for Racing phase
  const [raceState, setRaceState] = useState({
    status: 'NOT STARTED',
    distance: 1000,
    tick: 0,
    horses: []
  });
  const clientRef = useRef(null);

  useEffect(() => {
    if (currentStatus === 'checking' && selectedRace) {
      loadEntries();
    }
  }, [currentStatus, selectedRace]);

  // STOMP WebSocket Connection for Racing Phase
  useEffect(() => {
    if (currentStatus === 'racing' && selectedRace) {
      const initRace = async () => {
        try {
          if (entries.length === 0) {
            await loadEntries();
          }
          const stateData = await raceSimulatorApi.getRaceState(selectedRace.tournamentId, selectedRace.raceId);
          if (stateData) setRaceState(stateData);
        } catch (e) {
          console.log("No initial running state found or not started yet.", e);
        }
      };

      initRace();

      const socketUrl = '/ws';
      const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Connected to WebSocket for Referee Racing phase');
          client.subscribe(`/topic/tournaments/${selectedRace.tournamentId}/races/${selectedRace.raceId}`, (message) => {
            if (message.body) {
              const payload = JSON.parse(message.body);
              if (payload.data) {
                setRaceState(payload.data);
              }
            }
          });
        },
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      client.activate();
      clientRef.current = client;

      return () => {
        if (clientRef.current) {
          clientRef.current.deactivate();
        }
      };
    }
  }, [currentStatus, selectedRace]);

  useEffect(() => {
    if (currentStatus === 'reviewing' && selectedRace) {
      const loadReviewData = async () => {
        try {
          if (entries.length === 0) {
            await loadEntries();
          }
          
          const rules = await getAllPenaltyRules(selectedRace.tournamentId);
          setPenaltyRules(rules || []);

          const loadedViolations = await getViolations(selectedRace.tournamentId, selectedRace.raceId);
          setViolations(loadedViolations || []);

          const incs = await raceSimulatorApi.getIncidents(selectedRace.tournamentId, selectedRace.raceId);
          setIncidents(incs || []);
        } catch (error) {
          console.error("Failed to load review data", error);
        }
      };
      loadReviewData();
    }
  }, [currentStatus, selectedRace]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await getEntriesByRace(selectedRace.raceId);
      setEntries(data || []);
    } catch (error) {
      console.error("Failed to load entries", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKickModal = (entry) => {
    setEntryToKick(entry);
    setKickReason('');
    setKickModalOpen(true);
  };

  const handleCloseKickModal = () => {
    setKickModalOpen(false);
    setEntryToKick(null);
  };

  const handleSubmitKick = async () => {
    if (!kickReason.trim()) return;
    try {
      setIsSubmitting(true);
      await rejectRaceEntry(entryToKick.id, kickReason);
      setKickModalOpen(false);
      setEntryToKick(null);
      await loadEntries();
    } catch (error) {
      console.error("Failed to kick horse", error);
      alert(error.message || "Failed to kick horse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsReady = async () => {
    try {
      setIsSubmitting(true);
      await markReadyForRace(selectedRace.tournamentId, selectedRace.raceId);
      onNextStep();
    } catch (error) {
      console.error("Failed to mark race as ready", error);
      alert(error.message || "Failed to mark race as ready");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlagHorse = async (horseId) => {
    try {
      await raceSimulatorApi.flagHorse(selectedRace.tournamentId, selectedRace.raceId, horseId);
    } catch (error) {
      console.error("Failed to flag horse", error);
      alert("Failed to flag horse. It might have already finished or race is not running.");
    }
  };

  const handleOpenFlagModal = (horse) => {
    if (raceState.status !== 'RUNNING') return;
    if (horse.isFlagged) return;
    setHorseToFlag(horse);
    setFlagModalOpen(true);
  };

  const handleCloseFlagModal = () => {
    setFlagModalOpen(false);
    setHorseToFlag(null);
  };

  const handleSubmitFlag = async () => {
    if (!horseToFlag) return;
    try {
      setIsSubmitting(true);
      await raceSimulatorApi.flagHorse(selectedRace.tournamentId, selectedRace.raceId, horseToFlag.horseId);
      setFlagModalOpen(false);
      setHorseToFlag(null);
    } catch (error) {
      console.error("Failed to flag horse", error);
      alert("Failed to flag horse. It might have already finished or race is not running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncidentClick = (incident) => {
    setReviewFormData(prev => ({
      ...prev,
      entryId: incident.entry?.id || entries.find(e => e.horseName === incident.horseName)?.id || ''
    }));
  };

  const togglePenaltyRule = (ruleId) => {
    setReviewFormData(prev => {
      const isSelected = prev.penaltyRuleIds.includes(ruleId);
      if (isSelected) {
        return { ...prev, penaltyRuleIds: prev.penaltyRuleIds.filter(id => id !== ruleId) };
      } else {
        return { ...prev, penaltyRuleIds: [...prev.penaltyRuleIds, ruleId] };
      }
    });
  };

  const handleSaveViolation = async (e) => {
    e.preventDefault();
    if (!reviewFormData.entryId || reviewFormData.penaltyRuleIds.length === 0) return;

    try {
      setIsSubmitting(true);
      const newViolations = await createViolation(
        selectedRace.tournamentId, 
        selectedRace.raceId, 
        reviewFormData
      );
      setViolations(prev => [...newViolations, ...prev]);
      
      // Reset form
      setReviewFormData({
        entryId: '',
        penaltyRuleIds: [],
        description: ''
      });
    } catch (error) {
      console.error("Failed to save violation", error);
      alert(error.message || "Failed to save violation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteViolation = async (id) => {
    try {
      await deleteViolation(selectedRace.tournamentId, selectedRace.raceId, id);
      setViolations(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error("Failed to delete violation", error);
      alert(error.message || "Failed to delete violation");
    }
  };

  const renderCheckingPhase = () => (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-title-lg text-on-surface font-bold">Horse Checklist</h3>
        <button
          onClick={handleMarkAsReady}
          disabled={isSubmitting || selectedRace.raceStatus !== 'checking'}
          className="bg-primary text-on-primary px-6 py-2 rounded font-body text-label-md font-bold uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={selectedRace.raceStatus !== 'checking' ? 'Race must be in checking phase to mark as ready' : ''}
        >
          {selectedRace.raceStatus === 'scheduled' ? 'Waiting for Admin' :
            selectedRace.raceStatus === 'ready_to_run' ? 'Already Ready' :
              'Mark as Ready'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
          </div>
        ) : entries.length > 0 ? (
          <div className="flex flex-col gap-4">
            {entries.map(entry => {
              const isRejected = entry.status === 'rejected';
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={entry.id}
                  className={`border rounded-xl p-5 flex items-center justify-between transition-all ${isRejected ? 'bg-surface-container-highest border-error/50 opacity-75' : 'bg-surface-container-lowest border-outline-variant hover:border-primary/30'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-surface-container w-12 h-12 rounded-lg">
                      <span className="text-xs font-bold text-on-surface-variant uppercase">Lane</span>
                      <span className="text-lg font-bold text-primary">{entry.laneNumber}</span>
                    </div>
                    <div>
                      <Link to={`/horses/${entry.horseId}`} className={`font-display text-title-md font-bold hover:text-primary transition-colors ${isRejected ? 'text-on-surface-variant line-through hover:text-error' : 'text-on-surface'}`}>
                        {entry.horseName}
                      </Link>
                      <p className="font-body text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {entry.jockeyName || 'No Jockey Assigned'}
                      </p>
                      {isRejected && (
                        <p className="text-error text-xs font-bold mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Rejected: {entry.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {isRejected ? (
                      <span className="bg-error/10 text-error px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-error/20">
                        REJECTED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenKickModal(entry)}
                        className="bg-error/10 text-error hover:bg-error hover:text-white px-4 py-2 rounded font-bold text-sm uppercase transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                        Kick
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">search_off</span>
            <p>No entries found for this race.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {kickModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseKickModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline rounded-xl shadow-2xl p-6 relative z-10 w-full max-w-md"
            >
              <h3 className="text-title-lg font-bold text-error mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Kick Horse
              </h3>
              <p className="text-body-md text-on-surface-variant mb-4">
                You are about to reject <strong>{entryToKick?.horseName}</strong>. Please provide a reason.
              </p>

              <textarea
                value={kickReason}
                onChange={(e) => setKickReason(e.target.value)}
                placeholder="e.g. Overweight, Injured, Equipment Failed..."
                className="w-full bg-surface border border-outline rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary mb-6 resize-none h-24"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseKickModal}
                  className="px-4 py-2 text-on-surface-variant font-bold hover:bg-surface-container rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitKick}
                  disabled={isSubmitting || !kickReason.trim()}
                  className="bg-error text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                  Confirm Kick
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderContent = () => {
    switch (currentStatus) {
      case 'checking':
        return renderCheckingPhase();
      case 'racing':
        return (
          <div className="h-full flex flex-col font-sans">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-title-lg text-on-surface flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                </span>
                Live Race Simulation (Referee Mode)
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-on-surface-variant font-bold text-sm">
                  Status: <span className="text-primary">{raceState.status}</span>
                </span>
                <button
                  onClick={onNextStep}
                  disabled={raceState.status === 'RUNNING'}
                  className="bg-primary text-on-primary px-4 py-2 rounded hover:bg-primary-container hover:text-on-primary-container transition-colors font-bold text-sm disabled:opacity-50"
                >
                  Proceed to Review
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col">
                <div className="flex-1 min-h-[400px] flex items-center justify-center bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant">
                  {raceState.horses && raceState.horses.length > 0 ? (
                    <RaceTrack
                      horses={raceState.horses}
                      distance={raceState.distance}
                      raceEntries={entries}
                      onHorseClick={handleOpenFlagModal}
                    />
                  ) : (
                    <div className="text-on-surface-variant flex flex-col items-center">
                      <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">sprint</span>
                      <p className="text-xl font-display">Waiting for Race Simulator to Start...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="xl:w-1/3 w-full h-[500px] xl:h-auto border border-outline-variant rounded-2xl overflow-hidden shadow-sm bg-surface-container-lowest">
                <RaceLeaderboard
                  horses={raceState.horses}
                  raceEntries={entries}
                  isReferee={true}
                  onFlagHorse={handleFlagHorse}
                  raceStatus={raceState.status}
                />
              </div>
            </div>

            {/* Flag Horse Modal */}
            <AnimatePresence>
              {flagModalOpen && horseToFlag && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleCloseFlagModal}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-surface-container-lowest border border-outline rounded-xl shadow-2xl p-6 relative z-10 w-full max-w-sm text-center"
                  >
                    <div className="mx-auto w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[32px]">flag</span>
                    </div>
                    <h3 className="text-title-lg font-bold text-on-surface mb-2">
                      Flag Horse
                    </h3>
                    <p className="text-body-md text-on-surface-variant mb-6">
                      Are you sure you want to flag <strong>{entries.find(e => e.horseId === horseToFlag.horseId)?.horseName || 'this horse'}</strong> for a violation?
                    </p>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleCloseFlagModal}
                        className="px-4 py-2 text-on-surface-variant font-bold hover:bg-surface-container rounded transition-colors w-1/2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitFlag}
                        disabled={isSubmitting}
                        className="bg-error text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 w-1/2"
                      >
                        {isSubmitting ? (
                          <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                        ) : (
                          "Yes, Flag It"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'reviewing':
        return (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-title-lg text-on-surface">Violation Management Console</h3>
              <button
                onClick={onNextStep}
                className="bg-primary text-on-primary px-4 py-2 rounded font-body text-label-md font-bold uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
              >
                Confirm Results
              </button>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden">
              {/* Cột 1: Danh sách Incident (Cờ) */}
              <div className="col-span-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col h-full overflow-hidden">
                <h4 className="font-body font-bold text-on-surface border-b border-outline-variant pb-2 mb-4 flex justify-between items-center">
                  Flagged Incidents
                  <span className="bg-error text-white text-xs px-2 py-1 rounded-full">{incidents.length}</span>
                </h4>
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                  {incidents.length > 0 ? incidents.map(incident => {
                    const incidentEntryId = incident.entry?.id || entries.find(e => e.horseName === incident.horseName)?.id || '';
                    const isSelected = reviewFormData.entryId === incidentEntryId && incidentEntryId !== '';
                    return (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleIncidentClick(incident)}
                      key={incident.id} 
                      className={`border cursor-pointer rounded p-3 text-sm flex flex-col gap-1 transition-colors ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface-container border-outline-variant hover:border-primary/50'}`}
                    >
                      <div className={`flex justify-between font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        <span>Lane {incident.laneNumber} - {incident.horseName}</span>
                      </div>
                      <div className={`flex justify-between text-xs ${isSelected ? 'text-primary/70' : 'text-on-surface-variant'}`}>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">flag</span> {incident.refereeUsername}</span>
                        <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </motion.div>
                    );
                  }) : (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm italic text-center h-full">
                      No incidents were flagged.
                    </div>
                  )}
                </div>
              </div>

              {/* Cột 2 & 3: Form tạo Vi phạm */}
              <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col overflow-y-auto">
                <h4 className="font-body font-bold text-on-surface border-b border-outline-variant pb-2 mb-6">
                  Record New Violation
                </h4>
                <form onSubmit={handleSaveViolation} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface">Offending Entry <span className="text-error">*</span></label>
                    {reviewFormData.entryId ? (
                      <div className="bg-primary/10 border border-primary/30 rounded p-3 text-on-surface flex items-center justify-between shadow-sm">
                        <div className="font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">sports_score</span>
                          {(() => {
                            const entry = entries.find(e => e.id === reviewFormData.entryId);
                            return entry ? `Lane ${entry.laneNumber} - ${entry.horseName} (${entry.jockeyName || 'No Jockey'})` : 'Unknown Entry';
                          })()}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setReviewFormData({...reviewFormData, entryId: ''})}
                          className="text-on-surface-variant hover:text-error transition-colors flex items-center"
                          title="Clear selection"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-surface border border-dashed border-outline-variant rounded p-3 text-on-surface-variant text-sm flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        Please click a flagged incident from the list on the left
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface">Violation Types <span className="text-error">*</span></label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {penaltyRules.map(rule => (
                        <label 
                          key={rule.id} 
                          className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${reviewFormData.penaltyRuleIds.includes(rule.id) ? 'bg-error/10 border-error/50 shadow-sm' : 'bg-surface border-outline-variant hover:border-primary/50'}`}
                        >
                          <input 
                            type="checkbox" 
                            className="mt-1 w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2"
                            checked={reviewFormData.penaltyRuleIds.includes(rule.id)}
                            onChange={() => togglePenaltyRule(rule.id)}
                          />
                          <div className="flex-1">
                            <div className="font-bold text-sm text-on-surface">{rule.violationType}</div>
                            <div className="text-xs text-error font-bold mt-1 flex flex-wrap gap-x-3">
                              {rule.pointDeduction > 0 && <span>-{rule.pointDeduction} pts</span>}
                              {rule.fineAmount > 0 && <span>Fine ${rule.fineAmount}</span>}
                              {rule.banDays > 0 && <span>Ban {rule.banDays} days</span>}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface">Detailed Description</label>
                    <textarea 
                      value={reviewFormData.description}
                      onChange={(e) => setReviewFormData({...reviewFormData, description: e.target.value})}
                      placeholder="Describe the situation..."
                      className="bg-surface border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary resize-none h-24"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!reviewFormData.entryId || reviewFormData.penaltyRuleIds.length === 0}
                    className="mt-2 bg-primary text-on-primary py-3 rounded font-bold uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Save Violation
                  </button>
                </form>
              </div>

              {/* Cột 4: Lịch sử vi phạm đã tạo */}
              <div className="col-span-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col h-full overflow-hidden">
                <h4 className="font-body font-bold text-on-surface border-b border-outline-variant pb-2 mb-4 flex justify-between items-center">
                  Recorded Violations
                  <span className="bg-primary text-on-primary text-xs px-2 py-1 rounded-full">{violations.length}</span>
                </h4>
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                  <AnimatePresence>
                    {violations.length > 0 ? violations.map(v => (
                      <motion.div 
                        key={v.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-surface-container border-l-4 border-l-error border-y border-r border-outline-variant rounded p-3 text-sm flex flex-col gap-2"
                      >
                        <div className="flex justify-between font-bold text-on-surface">
                          <span>Lane {v.laneNumber} - {v.horseName}</span>
                          <button 
                            onClick={() => handleDeleteViolation(v.id)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                            title="Delete this violation"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <div className="text-error font-bold text-xs">{v.violationType}</div>
                        <div className="text-on-surface-variant text-xs italic">{v.penaltyDetails}</div>

                      </motion.div>
                    )) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-on-surface-variant text-sm italic text-center h-full gap-2"
                      >
                        <span className="material-symbols-outlined text-[32px] opacity-50">gavel</span>
                        No violations have been recorded.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        );
      case 'finished':
        return (
          <div className="h-full flex flex-col">
            <h3 className="font-display text-title-lg text-on-surface mb-6">Race Finalized & Report</h3>
            <div className="flex-1 flex gap-6">
              <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
                <h4 className="font-bold text-on-surface mb-4">Official Leaderboard</h4>
                <p className="text-on-surface-variant text-sm italic text-center mt-10">Final rankings here...</p>
              </div>
              <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col">
                <h4 className="font-bold text-on-surface mb-4">Race Report</h4>
                <div className="flex-1 border border-outline-variant rounded p-4 text-on-surface-variant text-sm mb-4">
                  (Auto-generated report template based on results and violations will be shown here for editing)
                </div>
                <button className="bg-primary text-on-primary w-full py-3 rounded font-bold uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors">
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-surface p-8 h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStatus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
