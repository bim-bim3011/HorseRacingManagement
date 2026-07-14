import React from 'react';
import { motion } from 'framer-motion';

const HorseLane = ({ horse, laneIndex, laneNumber, distance, horseName, jockeyName }) => {
  // Calculate percentage of progress. Cap at 100% just in case
  const progressPercent = Math.min((horse.progress / distance) * 100, 100) || 0;

  // Determine if the horse has any special effects
  const isStumbled = horse.effect === 'STUMBLED';
  const isSprinting = horse.effect === 'SPRINTING' || horse.effect === 'BURST';
  const isExhausted = horse.effect === 'EXHAUSTED';

  // Define visual effects based on state
  let effectClasses = "transition-all duration-300 ";
  if (isStumbled) effectClasses += "text-red-500 opacity-80 animate-bounce ";
  else if (isSprinting) effectClasses += "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-110 ";
  else if (isExhausted) effectClasses += "text-gray-400 opacity-60 ";
  else effectClasses += "text-white "; // Restored default color

  // Determine visual classes based on lane index for alternating grass strips
  const laneBg = laneIndex % 2 === 0 ? "bg-black/10" : "bg-transparent";

  // Calculate the left position. At 100%, we want to leave room for the 48px finish line and 32px horse icon
  // So at 100%, left is calc(100% - 60px). At 0%, left is 24px (just outside the gate).
  const startOffset = 24;
  const endOffset = 60;
  const currentOffset = startOffset + (progressPercent / 100) * (endOffset - startOffset);

  return (
    <div className={`relative w-full h-16 border-b border-white/5 ${laneBg} flex items-center group overflow-hidden`}>
      {/* Starting Gate marker */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-gray-700 border-r-2 border-gray-400 shadow-[4px_0_10px_rgba(0,0,0,0.4)] z-20 flex flex-col justify-center items-center">
        <span className="text-white text-xs font-bold font-display">{laneNumber || laneIndex + 1}</span>
      </div>

      {/* Horse Name Label always visible on the track */}
      <div className="absolute left-12 text-sm font-bold text-white z-0 font-display drop-shadow-md flex items-center gap-2">
        {horseName || `Horse #${horse.horseId}`}
        <span className="text-white/60 font-body text-xs font-normal">| {jockeyName || 'Unknown'}</span>
      </div>

      <motion.div
        className="absolute h-full flex flex-col items-center justify-center z-10"
        initial={{ left: `${startOffset}px` }}
        animate={{ left: `calc(${progressPercent}% - ${currentOffset}px)` }}
        transition={{ type: "tween", ease: "linear", duration: 0.3 }}
      >
        {/* Solid Horse Icon (Material Design UI Theme) */}
        <div className={`relative ${effectClasses} drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="transform scale-x-[-1]">
            <path d="M22 6V9.5L20.5 10L18.96 7.54C18.83 7.33 18.5 7.42 18.5 7.67V11.25C18.5 12.23 18.11 13.11 17.5 13.78V21H15V15C14.92 15 14.84 15 14.75 15C14.54 15 14.33 14.97 14.13 14.94L9.69 14.2L8.57 16.21L9.53 21H7L6 16.25C5.97 15.95 6 15.65 6.16 15.39L7.18 13.58C6.2 13.03 5.53 12 5.5 10.81C5.46 10.96 5.44 11.18 5.47 11.5C5.5 11.94 5.61 12.59 5.54 13.31C5.5 14.03 5.17 14.77 4.75 15.26C4.32 15.75 3.85 16.09 3.35 16.35L2.65 15.65C2.84 15.18 3.03 14.76 3.07 14.37C3.13 14 3.06 13.7 2.95 13.43L2.42 12.3C2.21 11.79 1.95 11.05 2 10.18C2.03 9.33 2.5 8.22 3.39 7.61C4.29 7 5.26 6.92 6.05 7.08C6.55 7.18 7.06 7.42 7.5 7.76C7.87 7.59 8.3 7.5 8.75 7.5H14.5V7C14.5 4.79 16.29 3 18.5 3H22L21.11 4.34C21.65 4.7 22 5.31 22 6Z" />
          </svg>

          {/* Effect Indicator / Trail */}
          {isSprinting && (
            <div className="absolute top-1/2 -left-6 w-8 h-1.5 bg-yellow-400 rounded-full blur-[2px] opacity-80 animate-pulse"></div>
          )}
          {isStumbled && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-red-500 font-bold bg-white/80 px-1 rounded">!</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HorseLane;
