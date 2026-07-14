import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RaceLeaderboard = ({ horses, raceEntries, isReferee, onFlagHorse, raceStatus }) => {
  // Sort horses by rank
  const sortedHorses = [...(horses || [])].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest text-on-surface rounded-lg shadow-lg border border-outline-variant overflow-hidden">
      <div className="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
        <h2 className="text-xl font-display uppercase tracking-tight font-bold flex items-center">
          <span className="material-symbols-outlined mr-2 text-primary">leaderboard</span>
          Live Standings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 hide-scrollbar">
        <AnimatePresence>
          {sortedHorses.map((horse, index) => {
            const entry = raceEntries?.find(e => e.horseId === horse.horseId);
            const horseName = entry?.horseName || `Horse #${horse.horseId}`;
            const jockeyName = entry?.jockeyName || "Unknown";

            let rankColor = "text-on-surface-variant";

            if (horse.rank === 1) {
              rankColor = "text-yellow-600 dark:text-yellow-400";
            } else if (horse.rank === 2) {
              rankColor = "text-gray-600 dark:text-gray-300";
            } else if (horse.rank === 3) {
              rankColor = "text-amber-700 dark:text-amber-500";
            }

            return (
              <motion.div
                key={horse.horseId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center p-3 rounded-xl border relative overflow-hidden ${
                  horse.isFlagged ? 'bg-error/10 border-error/50 shadow-[0_0_15px_rgba(var(--tw-colors-error-rgb),0.2)]' :
                  index === 0 ? 'bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(var(--tw-colors-primary-rgb),0.1)]' :
                  index === 1 ? 'bg-surface-container border-outline-variant/50' :
                  index === 2 ? 'bg-surface-container border-outline-variant/50' :
                  'bg-surface-container-lowest border-outline-variant/30'
                }`}
              >
                {/* Flashing flag effect if flagged */}
                {horse.isFlagged && (
                  <div className="absolute top-0 right-0 p-1 animate-pulse opacity-80">
                    <span className="material-symbols-outlined text-error text-xl">flag</span>
                  </div>
                )}
                <div className="flex items-center gap-3 flex-1">
                  <span className={`font-bold text-lg w-6 text-center ${rankColor}`}>
                    {horse.rank}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-on-surface text-base">{horseName}</div>
                    <div className="text-xs text-on-surface-variant flex gap-2">
                      <span>Jockey: {jockeyName}</span>
                      <span>|</span>
                      <span className={horse.effect === 'STUMBLED' ? 'text-error font-bold' : ''}>
                        {horse.effect}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lane Column */}
                <div className="px-3 text-center border-l border-outline-variant/30 ml-2">
                  <div className="text-[10px] text-on-surface-variant uppercase font-bold">Lane</div>
                  <div className="font-display font-bold text-on-surface text-base">
                    {entry?.laneNumber || '?'}
                  </div>
                </div>

                <div className="text-right border-l border-outline-variant/30 pl-3 ml-1 w-20 flex flex-col justify-center">
                  <div className="text-sm font-display font-bold text-on-surface">
                    {Math.floor(horse.progress || horse.distance || 0)}m
                  </div>
                  <div className="text-[10px] text-on-surface-variant uppercase">
                    {(horse.speed || 0).toFixed(1)} km/h
                  </div>
                  {isReferee && !horse.isFlagged && raceStatus === 'RUNNING' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onFlagHorse(horse.horseId); }}
                      className="mt-1 bg-error/10 text-error hover:bg-error hover:text-white rounded text-[10px] px-1 py-0.5 font-bold uppercase transition-colors"
                    >
                      Flag
                    </button>
                  )}
                  {isReferee && horse.isFlagged && (
                    <span className="mt-1 text-error text-[10px] font-bold uppercase">Flagged</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RaceLeaderboard;
