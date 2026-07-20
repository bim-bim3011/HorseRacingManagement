import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RacesTab from './RacesTab';
import PenaltyRulesTab from './PenaltyRulesTab';
import TournamentRegistrationsTab from './TournamentRegistrationsTab';
import TournamentOverviewTab from './TournamentOverviewTab';
import { getTournamentById } from '../../api/tournamentApi';

export default function TournamentManagementView({ tournament: initialTournament, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tournament, setTournament] = useState(initialTournament);

  const refreshTournament = async () => {
    try {
      if (tournament && tournament.id) {
        const data = await getTournamentById(tournament.id);
        setTournament(data);
      }
    } catch (error) {
      console.error("Failed to refresh tournament", error);
    }
  };

  useEffect(() => {
    setTournament(initialTournament);
  }, [initialTournament]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'races', label: 'Races', icon: 'sports_score' },
    { id: 'registrations', label: 'Registrations', icon: 'badge' },
    { id: 'rules', label: 'Penalty Rules', icon: 'gavel' },
  ];

  if (!tournament) return null;

  return (
    <div className="flex flex-col gap-6 max-w-[1280px] mx-auto min-h-screen">
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-6"
      >
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface shadow-sm cursor-pointer border border-outline-variant flex-shrink-0"
            title="Back to Tournaments"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-on-surface font-bold uppercase tracking-tight">
                {tournament.name}
              </h1>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                tournament.status === 'UPCOMING' ? 'bg-primary/10 text-primary border-primary/20' :
                tournament.status === 'ONGOING' ? 'bg-error/10 text-error border-error/20' :
                'bg-surface-variant/30 text-on-surface border-outline-variant'
              }`}>
                {tournament.status || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-on-surface-variant font-body">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                {tournament.startDate} to {tournament.endDate}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">payments</span>
                ${tournament.prizePool?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs & Content Area */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant bg-surface-container-low overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 font-interactive-md text-sm md:text-base transition-colors relative whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="managementActiveTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-surface-container-lowest flex-1 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <TournamentOverviewTab 
                  tournament={tournament} 
                  onTournamentUpdated={() => {
                    refreshTournament();
                  }} 
                />
              </motion.div>
            )}

            {activeTab === 'races' && (
              <motion.div key="races" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {/* Notice we do not pass onBack, so the nested component hides its header/back button */}
                <RacesTab tournament={tournament} />
              </motion.div>
            )}

            {activeTab === 'registrations' && (
              <motion.div key="registrations" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <TournamentRegistrationsTab tournament={tournament} />
              </motion.div>
            )}

            {activeTab === 'rules' && (
              <motion.div key="rules" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <PenaltyRulesTab tournament={tournament} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
