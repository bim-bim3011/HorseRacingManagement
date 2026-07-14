import React from 'react';
import { motion } from 'framer-motion';

export default function BettingBoard({ raceEntries, betOdds, onSelectBet, bettingStatus }) {
  const isOpen = bettingStatus === 'open';

  // Helper to find odds for a specific entry and bet type
  const getOddsValue = (entryId, type) => {
    if (!betOdds) return 1.0;
    const oddsRecord = betOdds.find(o => o.entryId === entryId && o.betType.toUpperCase() === type.toUpperCase());
    return oddsRecord ? oddsRecord.odds : 1.0;
  };

  const handleSelect = (entry, betType) => {
    if (!isOpen) return;
    const odds = getOddsValue(entry.id, betType);
    onSelectBet({ entry, betType, odds });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
        <h3 className="font-display font-bold uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">toll</span>
          Betting Board
        </h3>
        {!isOpen && (
          <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            BETTING CLOSED
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="bg-surface-container-lowest text-on-surface-variant font-display text-xs uppercase tracking-wider border-b border-outline-variant">
              <th className="p-4 font-semibold w-16 text-center">Lane</th>
              <th className="p-4 font-semibold">Horse</th>
              <th className="p-4 font-semibold text-center">WIN</th>
              <th className="p-4 font-semibold text-center">PLACE</th>
              <th className="p-4 font-semibold text-center">SHOW</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {raceEntries.map((entry) => (
              <motion.tr
                key={entry.id}
                variants={itemVariants}
                className="border-b border-outline-variant/50 hover:bg-surface-container-highest transition-colors"
              >
                <td className="p-4">
                  <div className="w-8 h-8 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-display shadow-inner border border-primary/30">
                    {entry.laneNumber || '-'}
                  </div>
                </td>
                <td className="p-4 font-body font-bold text-on-surface">
                  {entry.horseName || 'Unknown Horse'}
                  <div className="text-xs font-normal text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    {entry.jockeyName || 'TBA'}
                  </div>
                </td>
                
                {['WIN', 'PLACE', 'SHOW'].map(betType => {
                  const odds = getOddsValue(entry.id, betType);
                  return (
                    <td key={betType} className="p-4 text-center">
                      <button
                        onClick={() => handleSelect(entry, betType)}
                        disabled={!isOpen}
                        className={`
                          px-4 py-2 rounded-xl font-bold text-sm min-w-[80px] transition-all duration-300
                          ${isOpen 
                            ? 'bg-surface-container hover:bg-primary/20 hover:text-primary hover:border-primary/50 hover:scale-105 active:scale-95 border border-outline border-b-2 hover:border-b-primary shadow-sm' 
                            : 'bg-surface-container-lowest text-on-surface-variant/50 border border-outline-variant cursor-not-allowed'}
                        `}
                      >
                        {odds.toFixed(2)}
                      </button>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
