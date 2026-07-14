import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export default function OwnerOverviewTab({ onNavigate }) {
  const stats = [
    { title: 'My Horses', value: '0', icon: 'pets', color: 'text-primary' },
    { title: 'Hired Jockeys', value: '0', icon: 'person', color: 'text-tertiary' },
    { title: 'Upcoming Races', value: '0', icon: 'event', color: 'text-secondary' },
    { title: 'Total Earnings', value: '$0', icon: 'payments', color: 'text-error' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="max-w-[1280px] mx-auto space-y-stack-lg"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Stable Overview</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Welcome back. Here's what's happening with your horses and jockeys.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-surface p-stack-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-stack-md cursor-pointer hover:shadow-md transition-all duration-300 group"
          >
            <div className={`w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300`}>
              <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">{stat.title}</p>
              <p className="font-display-md text-display-md text-on-surface mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant p-stack-md">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Recent Race Results</h3>
          <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">sports_score</span>
            <p className="font-interactive-md">No recent results found for your horses.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Quick Actions</h3>
          <div className="flex flex-col gap-2 flex-grow">
            <button 
              onClick={() => onNavigate('horses')}
              className="w-full text-left px-4 py-3 bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-colors rounded-lg flex items-center gap-3 font-interactive-md text-on-surface group cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">add_circle</span>
              Register New Horse
            </button>
            <button 
              onClick={() => onNavigate('jockeys')}
              className="w-full text-left px-4 py-3 bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-colors rounded-lg flex items-center gap-3 font-interactive-md text-on-surface group cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">person_add</span>
              Hire a Jockey
            </button>
            <button 
              onClick={() => onNavigate('schedule')}
              className="w-full text-left px-4 py-3 bg-surface-container-low hover:bg-primary/10 hover:text-primary transition-colors rounded-lg flex items-center gap-3 font-interactive-md text-on-surface group cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">calendar_month</span>
              View Upcoming Tournaments
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
