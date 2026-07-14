import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRegistrationsByTournament } from '../../api/tournamentRegistrationApi';
import { getEntriesByRace, assignHorseToRace } from '../../api/raceEntryApi';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function HorseAssignmentModal({ race, tournament, onClose, onAssignSuccess }) {
  const [registrations, setRegistrations] = useState([]);
  const [currentEntries, setCurrentEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch all approved registrations for the tournament
      const regsData = await getRegistrationsByTournament(tournament.id);
      const approvedRegs = (regsData || []).filter(reg => reg.status === 'approved');

      // Fetch current entries in the race
      const entriesData = await getEntriesByRace(race.id);

      setRegistrations(approvedRegs);
      setCurrentEntries(entriesData || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data for assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (horseId) => {
    try {
      setIsAssigning(true);
      setError('');
      await assignHorseToRace(race.id, horseId);
      await fetchData(); // Refresh data to show updated state
      if (onAssignSuccess) onAssignSuccess();
    } catch (err) {
      setError(err.message || 'Failed to assign horse');
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter out horses that are already in the race
  const assignedHorseIds = new Set(currentEntries.map(e => e.horseId));
  const availableHorses = registrations.filter(reg => !assignedHorseIds.has(reg.horseId));

  const isFull = race.maxEntries && currentEntries.length >= race.maxEntries;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-surface rounded-2xl shadow-2xl border border-outline-variant w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10"
      >
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <div>
            <h3 className="font-display text-xl text-on-surface font-bold uppercase tracking-tight">Assign Horses</h3>
            <p className="text-sm text-on-surface-variant font-body">Race: {race.name} - Round {race.roundOrder}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg font-interactive-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h4 className="font-headline-sm text-on-surface">Available Horses</h4>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${isFull ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              {currentEntries.length} / {race.maxEntries || '∞'} Assigned
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-on-surface-variant">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableHorses.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-2">info</span>
                  <p className="text-on-surface-variant">No more approved horses available to assign.</p>
                </div>
              ) : (
                availableHorses.map(reg => (
                  <div key={reg.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-lowest transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">pets</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-lg">{reg.horseName}</h5>
                        <p className="text-sm text-on-surface-variant flex gap-3">
                          <span>Registration: {reg.id}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssign(reg.horseId)}
                      disabled={isAssigning || isFull}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold font-interactive-sm hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
