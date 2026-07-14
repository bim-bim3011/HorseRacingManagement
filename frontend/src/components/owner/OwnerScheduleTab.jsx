import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyHorseEntries } from '../../api/raceEntryApi';
import InviteJockeyModal from './InviteJockeyModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function OwnerScheduleTab() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [selectedEntryForInvite, setSelectedEntryForInvite] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getMyHorseEntries();
      setEntries(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="max-w-[1280px] mx-auto space-y-stack-lg">
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Schedule & Entries</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">View upcoming races your horses are participating in.</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">My Horse Entries</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading schedule...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps">Race Info</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Horse</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Jockey</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Lane / Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-on-surface-variant">Your horses are not participating in any upcoming races.</td>
                  </tr>
                ) : (
                  entries.map((entry, i) => (
                    <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-outline-variant hover:bg-surface-container-highest">
                      <td className="py-stack-sm px-stack-md">
                        <p className="font-interactive-md">Race #{entry.raceId}</p>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <p className="font-interactive-md">{entry.horseName}</p>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        {entry.jockeyName ? (
                          <p className="font-interactive-md">{entry.jockeyName}</p>
                        ) : (
                          <button
                            onClick={() => setSelectedEntryForInvite(entry)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg font-interactive-sm transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            Invite Jockey
                          </button>
                        )}
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[12px] bg-primary-fixed text-on-primary-fixed font-interactive-md">
                          Lane {entry.laneNumber || 'TBD'}
                        </span>
                        <p className="text-[12px] text-on-surface-variant mt-1">{entry.status}</p>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {selectedEntryForInvite && (
        <InviteJockeyModal
          raceId={selectedEntryForInvite.raceId}
          horseId={selectedEntryForInvite.horseId}
          onClose={() => setSelectedEntryForInvite(null)}
          onSuccess={() => {
            setSelectedEntryForInvite(null);
            fetchEntries(); // Refresh list
          }}
        />
      )}
    </motion.div>
  );
}
