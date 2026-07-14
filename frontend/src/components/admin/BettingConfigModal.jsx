import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getOddsByRace, initOddsForRace, toggleBettingStatus, updateBatchOdds } from '../../api/betOddsApi';
import { useNotification } from '../../contexts/NotificationContext';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function BettingConfigModal({ race, onClose, onUpdated }) {
  const [oddsData, setOddsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Pivot data for table view: [{ entryId, horseName, winOdds, placeOdds, showOdds }]
  const [tableData, setTableData] = useState([]);

  const [bettingStatus, setBettingStatus] = useState(race?.bettingStatus?.toLowerCase() || 'pending');
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    if (race?.id) {
      fetchOdds();
    }
  }, [race]);

  const fetchOdds = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOddsByRace(race.id);
      setOddsData(data || []);
      pivotData(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch betting odds');
    } finally {
      setIsLoading(false);
    }
  };

  const pivotData = (flatOdds) => {
    const entryMap = new Map();

    flatOdds.forEach(odd => {
      if (!entryMap.has(odd.entryId)) {
        entryMap.set(odd.entryId, {
          entryId: odd.entryId,
          horseName: odd.horseName,
          winOdds: 0,
          placeOdds: 0,
          showOdds: 0
        });
      }

      const entry = entryMap.get(odd.entryId);
      if (odd.betType.toLowerCase() === 'win') entry.winOdds = odd.odds;
      if (odd.betType.toLowerCase() === 'place') entry.placeOdds = odd.odds;
      if (odd.betType.toLowerCase() === 'show') entry.showOdds = odd.odds;
    });

    setTableData(Array.from(entryMap.values()));
  };

  const handleInitOdds = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await initOddsForRace(race.id);
      await fetchOdds();
    } catch (err) {
      setError(err.message || 'Failed to initialize odds');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsStatusChanging(true);
    setError(null);
    try {
      await toggleBettingStatus(race.id, newStatus);
      setBettingStatus(newStatus);
      if (onUpdated) onUpdated(); // trigger refresh of parent list
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsStatusChanging(false);
    }
  };

  const handleOddsChange = (entryId, type, value) => {
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;

    setTableData(prev =>
      prev.map(row =>
        row.entryId === entryId
          ? { ...row, [type]: value }
          : row
      )
    );
  };

  const handleSaveOdds = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Format requests
      const requests = tableData.map(row => ({
        entryId: row.entryId,
        winOdds: parseFloat(row.winOdds || 0),
        placeOdds: parseFloat(row.placeOdds || 0),
        showOdds: parseFloat(row.showOdds || 0)
      }));

      await updateBatchOdds(race.id, requests);
      await fetchOdds(); // refresh to show saved data
      showToast('Thành công', 'Lưu tỷ lệ cược thành công!');
    } catch (err) {
      setError(err.message || 'Failed to save odds');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-[100]"
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant w-full max-w-4xl pointer-events-auto flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">monetization_on</span>
              <div>
                <h3 className="font-display text-xl text-on-surface uppercase tracking-wide">Betting Configuration</h3>
                <p className="font-body text-sm text-on-surface-variant font-medium">{race?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">

            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-2 font-interactive-md">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Top Bar: Status Control */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-container-low rounded-xl border border-outline-variant gap-4">
              <div>
                <h4 className="font-headline-md text-on-surface mb-1">Betting Status</h4>
                <p className="text-sm font-body text-on-surface-variant">Control when users can place bets on this race.</p>
              </div>

              <div className="flex bg-surface rounded-lg p-1 border border-outline-variant shadow-sm relative">
                {isStatusChanging && (
                  <div className="absolute inset-0 bg-surface/50 flex items-center justify-center rounded-lg z-10">
                    <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                  </div>
                )}
                {['pending', 'open', 'closed', 'suspended'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isStatusChanging || bettingStatus === status}
                    className={`px-4 py-2 rounded-md font-interactive-md text-sm capitalize transition-all duration-200 ${bettingStatus === status
                        ? (status === 'open' ? 'bg-green-500 text-white shadow-md' :
                          status === 'closed' ? 'bg-error text-white shadow-md' :
                            status === 'suspended' ? 'bg-yellow-500 text-white shadow-md' :
                              'bg-primary text-white shadow-md')
                        : 'text-on-surface-variant hover:bg-surface-container-highest cursor-pointer'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Odds Config */}
            <div className="flex-grow flex flex-col">
              <h4 className="font-headline-md text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Horse Odds Configuration
              </h4>

              {isLoading ? (
                <div className="flex-grow flex items-center justify-center p-8">
                  <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
                </div>
              ) : oddsData.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-4">query_stats</span>
                  <p className="text-on-surface font-interactive-md text-lg mb-2">No Odds Generated</p>
                  <p className="text-on-surface-variant mb-6 text-center max-w-md">
                    Betting odds have not been initialized for this race yet. You must initialize them before you can edit.
                  </p>
                  <button
                    onClick={handleInitOdds}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-interactive-md shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && <span className="material-symbols-outlined animate-spin">sync</span>}
                    <span className="material-symbols-outlined">add_chart</span>
                    Initialize Default Odds
                  </button>
                </div>
              ) : tableData.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  No horses assigned to this race yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low text-on-surface-variant font-label-caps uppercase text-xs">
                      <tr>
                        <th className="p-4 font-semibold border-b border-outline-variant">Horse</th>
                        <th className="p-4 font-semibold border-b border-outline-variant text-center">WIN Odds (1st)</th>
                        <th className="p-4 font-semibold border-b border-outline-variant text-center">PLACE Odds (Top 2)</th>
                        <th className="p-4 font-semibold border-b border-outline-variant text-center">SHOW Odds (Top 3)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr key={row.entryId} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors">
                          <td className="p-4 font-interactive-md text-on-surface flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              #{row.entryId}
                            </span>
                            {row.horseName}
                          </td>
                          <td className="p-3">
                            <div className="relative group">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors font-bold">x</span>
                              <input
                                type="text"
                                value={row.winOdds}
                                onChange={(e) => handleOddsChange(row.entryId, 'winOdds', e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-4 py-2 text-center font-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="relative group">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors font-bold">x</span>
                              <input
                                type="text"
                                value={row.placeOdds}
                                onChange={(e) => handleOddsChange(row.entryId, 'placeOdds', e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-4 py-2 text-center font-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="relative group">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors font-bold">x</span>
                              <input
                                type="text"
                                value={row.showOdds}
                                onChange={(e) => handleOddsChange(row.entryId, 'showOdds', e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-4 py-2 text-center font-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-interactive-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOdds}
              disabled={isSaving || oddsData.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg font-interactive-md shadow-sm hover:shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving && <span className="material-symbols-outlined animate-spin">sync</span>}
              <span className="material-symbols-outlined">save</span>
              Save All Odds
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
