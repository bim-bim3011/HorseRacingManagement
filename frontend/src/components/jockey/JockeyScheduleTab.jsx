import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyJockeyEntries } from '../../api/raceEntryApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function JockeyScheduleTab() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getMyJockeyEntries();
      // Filter out finished/cancelled races if this is just the "upcoming" schedule
      // For now, we'll show all or maybe just filter by status not 'finished'
      const upcoming = (data || []).filter(e => e.status !== 'finished' && e.status !== 'cancelled');
      setEntries(upcoming);
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
        <h2 className="font-display-lg text-display-lg text-on-surface">My Schedule</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">View upcoming races you have been assigned to ride.</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">Assigned Races</h3>
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
                  <th className="py-stack-sm px-stack-md font-label-caps">Lane</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">event_busy</span>
                      <p>You have no upcoming assigned races.</p>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, i) => (
                    <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-outline-variant hover:bg-surface-container-highest">
                      <td className="py-stack-sm px-stack-md">
                        <p className="font-bold text-on-surface">{entry.raceName}</p>
                        <p className="text-sm text-on-surface-variant">{entry.tournamentName}</p>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">pets</span>
                          <p className="font-interactive-md">{entry.horseName}</p>
                        </div>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-primary-fixed text-on-primary-fixed font-bold">
                          Lane {entry.laneNumber || 'TBD'}
                        </span>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-[12px] uppercase font-bold tracking-wider bg-secondary-container text-on-secondary-container">
                          {entry.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
