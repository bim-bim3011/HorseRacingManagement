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

export default function JockeyResultsTab() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const data = await getMyJockeyEntries();
      // Filter only finished races for results
      const finished = (data || []).filter(e => e.status === 'finished');
      setResults(finished);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="max-w-[1280px] mx-auto space-y-stack-lg">
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">My Results</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Track your past performances and achievements.</p>
        </div>
        <div className="bg-primary-container text-on-primary-container px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">emoji_events</span>
          <div>
            <p className="text-xs font-bold uppercase opacity-80">Total Races Completed</p>
            <p className="text-xl font-display font-bold leading-none">{results.length}</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">Past Races</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading results...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps">Race Info</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Horse</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-center">Lane</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">history</span>
                      <p>You have not completed any races yet.</p>
                    </td>
                  </tr>
                ) : (
                  results.map((entry, i) => (
                    <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-outline-variant hover:bg-surface-container-highest">
                      <td className="py-stack-sm px-stack-md">
                        <p className="font-bold text-on-surface">{entry.raceName}</p>
                        <p className="text-sm text-on-surface-variant">{entry.tournamentName}</p>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <p className="font-interactive-md">{entry.horseName}</p>
                      </td>
                      <td className="py-stack-sm px-stack-md text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high font-bold">
                          {entry.laneNumber}
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
