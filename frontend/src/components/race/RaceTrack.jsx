import React from 'react';
import HorseLane from './HorseLane';

const RaceTrack = ({ horses, distance, raceEntries }) => {
  return (
    <div className="w-full h-full flex flex-col relative bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant shadow-sm">
      
      {/* Distance marker / labels at the top */}
      <div className="w-full h-10 bg-surface-container-highest flex justify-between items-center px-4 text-xs font-display text-on-surface-variant border-b border-outline-variant shadow-sm z-20">
        <span className="font-bold tracking-widest pl-2">START</span>
        <span className="font-bold tracking-widest text-primary text-sm">{distance}m</span>
        <span className="font-bold tracking-widest pr-10">FINISH</span>
      </div>
      
      {/* Track Area (Lanes + Markers) */}
      <div className="flex-1 flex flex-col w-full relative z-10 bg-[#446b46] overflow-hidden shadow-inner">
        {/* Distance Markers (25%, 50%, 75%) */}
        <div className="absolute top-0 bottom-0 left-[25%] border-l-2 border-dashed border-white/20 z-0"></div>
        <div className="absolute top-0 bottom-0 left-[50%] border-l-2 border-dashed border-white/30 z-0"></div>
        <div className="absolute top-0 bottom-0 left-[75%] border-l-2 border-dashed border-white/20 z-0"></div>

        {/* Finish Line (properly scoped inside the track area) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 border-l-[3px] border-white flex flex-col z-0 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]" 
             style={{
               backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
               backgroundSize: '24px 24px',
               backgroundPosition: '0 0, 12px 12px',
               backgroundColor: '#fff'
             }}>
        </div>

        {/* The Lanes */}
        <div className="flex flex-col w-full h-full justify-around relative z-10 py-2">
          {(() => {
            // Sort horses by their assigned lane number to keep the track layout consistent
            const trackHorses = [...(horses || [])].sort((a, b) => {
              const laneA = raceEntries?.find(e => e.horseId === a.horseId)?.laneNumber || 999;
              const laneB = raceEntries?.find(e => e.horseId === b.horseId)?.laneNumber || 999;
              return laneA - laneB;
            });

            return trackHorses.map((horse, index) => {
              // Find the corresponding race entry to get horse/jockey names if available
              const entry = raceEntries?.find(e => e.horseId === horse.horseId);
              const horseName = entry?.horseName || null;
              const jockeyName = entry?.jockeyName || null;
              const laneNumber = entry?.laneNumber || index + 1;
              
              return (
                <HorseLane 
                  key={horse.horseId} 
                  horse={horse} 
                  laneIndex={index} 
                  laneNumber={laneNumber}
                  distance={distance} 
                  horseName={horseName}
                  jockeyName={jockeyName}
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default RaceTrack;
