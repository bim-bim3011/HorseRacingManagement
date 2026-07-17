import { useState, useEffect, useMemo } from 'react';
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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Collapsible state
  const [expandedRaces, setExpandedRaces] = useState(new Set());

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

  const toggleRaceExpansion = (raceId) => {
    const newExpanded = new Set(expandedRaces);
    if (newExpanded.has(raceId)) {
      newExpanded.delete(raceId);
    } else {
      newExpanded.add(raceId);
    }
    setExpandedRaces(newExpanded);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (entry.horseName && entry.horseName.toLowerCase().includes(query)) ||
        (entry.raceName && entry.raceName.toLowerCase().includes(query)) ||
        (entry.tournamentName && entry.tournamentName.toLowerCase().includes(query));
        
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'missing_jockey') {
           matchesStatus = !entry.jockeyName && entry.status !== 'rejected';
        } else {
           matchesStatus = entry.status === statusFilter;
        }
      }
      return matchesSearch && matchesStatus;
    });
  }, [entries, searchQuery, statusFilter]);

  const groupedRaces = useMemo(() => {
    const groups = filteredEntries.reduce((acc, entry) => {
      const key = entry.raceId;
      if (!acc[key]) {
        acc[key] = {
          raceId: entry.raceId,
          raceName: entry.raceName,
          tournamentName: entry.tournamentName,
          entries: []
        };
      }
      acc[key].entries.push(entry);
      return acc;
    }, {});
    return Object.values(groups);
  }, [filteredEntries]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="max-w-[1280px] mx-auto space-y-stack-lg pb-10">
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Schedule & Entries</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">View and manage upcoming races your horses are participating in.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEntries} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="font-interactive-md">Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants} className="bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search horse, race or tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl font-interactive-md text-on-surface outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="missing_jockey">Missing Jockey</option>
          </select>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px] mb-4">sync</span>
          <p className="font-interactive-lg text-on-surface-variant animate-pulse">Loading schedule...</p>
        </div>
      ) : groupedRaces.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-surface rounded-2xl border border-outline-variant p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">calendar_month</span>
          </div>
          <h3 className="font-display text-title-lg text-on-surface mb-2">No Entries Found</h3>
          <p className="font-body-md text-on-surface-variant max-w-md">No race entries match your current search or filter criteria.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedRaces.map((race, idx) => {
            const isExpanded = expandedRaces.has(race.raceId);
            return (
              <motion.div 
                key={race.raceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                className={`bg-surface rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-primary/50 shadow-md' : 'border-outline-variant shadow-sm hover:border-outline hover:shadow-md'}`}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleRaceExpansion(race.raceId)}
                  className={`px-6 py-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between transition-colors gap-4 ${isExpanded ? 'bg-primary/5' : 'bg-surface-container-lowest hover:bg-surface-container-low'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 bg-primary-container text-on-primary-container rounded-full items-center justify-center font-bold">
                      #{race.raceId}
                    </div>
                    <div>
                      <p className="text-primary font-label-md uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                        {race.tournamentName || 'Tournament'}
                      </p>
                      <h3 className="text-on-surface font-display text-title-lg">{race.raceName || `Race #${race.raceId}`}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="flex bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant font-interactive-sm items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">pets</span>
                      {race.entries.length} Horse{race.entries.length > 1 ? 's' : ''}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'bg-primary text-on-primary rotate-180' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-4 sm:p-6 flex flex-col gap-3 bg-surface border-t border-outline-variant/50">
                        {race.entries.map(entry => {
                          const isRejected = entry.status === 'rejected';
                          return (
                            <div 
                              key={entry.id} 
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                                isRejected ? 'bg-error-container/20 border-error/30' : 'bg-surface-container-lowest border-outline-variant hover:border-primary/40 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isRejected ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                                  <span className="material-symbols-outlined text-[24px]">pets</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className={`font-interactive-lg text-lg ${isRejected ? 'text-on-surface line-through opacity-70' : 'text-on-surface'}`}>
                                    {entry.horseName}
                                  </span>
                                  
                                  {isRejected ? (
                                    <div className="flex items-center gap-1 mt-1 text-error text-sm font-interactive-sm">
                                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                                      {entry.rejectionReason || 'Rejected by referee'}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-on-surface-variant font-interactive-sm">
                                      <span className="inline-flex items-center bg-surface-container-highest px-2 py-0.5 rounded text-xs border border-outline-variant/50">
                                        Lane {entry.laneNumber || 'TBD'}
                                      </span>
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-surface-container-highest border border-outline-variant/50">
                                        <div className={`w-2 h-2 rounded-full ${
                                          entry.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'
                                        }`}></div>
                                        <span className="capitalize">{entry.status}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="sm:ml-4 flex items-center w-full sm:w-auto">
                                {entry.jockeyName ? (
                                  <div className="flex flex-col sm:items-end w-full sm:w-auto p-3 sm:p-0 bg-surface-container-lowest sm:bg-transparent rounded-lg border sm:border-none border-outline-variant/50">
                                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Jockey</span>
                                    <span className="font-interactive-md text-on-surface flex items-center gap-1 mt-0.5">
                                      {entry.jockeyName}
                                      <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                                    </span>
                                  </div>
                                ) : (
                                  !isRejected && (
                                    entry.hasPendingInvitation ? (
                                      <div className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-surface-container-high text-on-surface-variant rounded-xl font-interactive-md whitespace-nowrap cursor-not-allowed">
                                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                                        Invitation Pending
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setSelectedEntryForInvite(entry)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl font-interactive-md transition-colors whitespace-nowrap"
                                      >
                                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                                        Hire Jockey
                                      </button>
                                    )
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedEntryForInvite && (
          <InviteJockeyModal
            raceId={selectedEntryForInvite.raceId}
            horseId={selectedEntryForInvite.horseId}
            horseName={selectedEntryForInvite.horseName}
            onClose={() => setSelectedEntryForInvite(null)}
            onSuccess={() => {
              setSelectedEntryForInvite(null);
              fetchEntries();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
