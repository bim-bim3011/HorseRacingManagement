import { useState } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function OwnerResultsTab() {
  const [activeSubTab, setActiveSubTab] = useState('recent');

  const stats = [
    { label: 'Total Earnings', value: '$0', icon: 'payments', color: 'text-error' },
    { label: 'Win Rate', value: '0%', icon: 'percent', color: 'text-primary' },
    { label: 'Top 3 Finishes', value: '0', icon: 'emoji_events', color: 'text-tertiary' },
    { label: 'Total Races', value: '0', icon: 'flag', color: 'text-secondary' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="max-w-[1280px] mx-auto space-y-stack-lg">
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Results & Earnings</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Track your horses' performance, rankings, and prize money.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface p-stack-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-stack-md">
            <div className={`w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">{stat.label}</p>
              <p className="font-display-md text-display-md text-on-surface mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-4 border-b border-outline-variant mb-6">
        <button 
          onClick={() => setActiveSubTab('recent')}
          className={`pb-2 px-4 font-interactive-md transition-colors ${activeSubTab === 'recent' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Recent Results
        </button>
        <button 
          onClick={() => setActiveSubTab('standings')}
          className={`pb-2 px-4 font-interactive-md transition-colors ${activeSubTab === 'standings' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Horse Standings
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">sports_score</span>
          <p className="font-interactive-md text-lg">No {activeSubTab === 'recent' ? 'recent results' : 'standings'} data available yet.</p>
          <p className="text-sm mt-2 opacity-75">Data will appear here after your horses complete their races.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
