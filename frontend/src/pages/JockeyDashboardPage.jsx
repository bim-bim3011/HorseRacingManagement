import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JockeyInvitationsTab from '../components/jockey/JockeyInvitationsTab';
import JockeyScheduleTab from '../components/jockey/JockeyScheduleTab';
import JockeyResultsTab from '../components/jockey/JockeyResultsTab';

const tabs = [
  { id: 'invitations', label: 'Invitations', icon: 'mail' },
  { id: 'schedule', label: 'My Schedule', icon: 'calendar_month' },
  { id: 'results', label: 'My Results', icon: 'history' },
];

export default function JockeyDashboardPage() {
  const [activeTab, setActiveTab] = useState('invitations');

  return (
    <div className="min-h-screen bg-surface-container-lowest py-8 px-4 md:px-8">
      <div className="max-w-[1280px] mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface">Jockey Dashboard</h1>
          <p className="text-on-surface-variant font-body mt-2">Manage your race invitations, view your schedule, and track your performance.</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-interactive-md transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'invitations' && <JockeyInvitationsTab key="invitations" />}
            {activeTab === 'schedule' && <JockeyScheduleTab key="schedule" />}
            {activeTab === 'results' && <JockeyResultsTab key="results" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
