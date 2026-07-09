import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
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

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2 }
  }
};

export default function OverviewTab() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="max-w-[1280px] mx-auto space-y-stack-lg"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-end border-b border-outline-variant pb-stack-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">System Overview</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Live administrative metrics and recent club activity.</p>
        </div>
        <div className="flex gap-stack-sm">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </motion.button>
        </div>
      </motion.div>

      {/* Bento Grid Metrics */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Metric Card 1 */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Active Tournaments</span>
            <span className="material-symbols-outlined text-primary">emoji_events</span>
          </div>
          <div className="relative z-10">
            <span className="font-display-lg text-display-lg text-on-surface">4</span>
            <div className="flex items-center gap-unit mt-unit text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="font-interactive-md text-[12px]">+1 this week</span>
            </div>
          </div>
        </motion.div>

        {/* Metric Card 2 */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Pending Registrations</span>
            <span className="material-symbols-outlined text-primary">how_to_reg</span>
          </div>
          <div className="relative z-10">
            <span className="font-display-lg text-display-lg text-on-surface">12</span>
            <div className="flex items-center gap-unit mt-unit text-on-surface-variant bg-surface-variant w-fit px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span className="font-interactive-md text-[12px]">Requires review</span>
            </div>
          </div>
        </motion.div>

        {/* Metric Card 3 */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="flex justify-between items-start mb-stack-md relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Registered Jockeys</span>
            <span className="material-symbols-outlined text-primary">sports_kabaddi</span>
          </div>
          <div className="relative z-10">
            <span className="font-display-lg text-display-lg text-on-surface">86</span>
            <div className="flex items-center gap-unit mt-unit text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span className="font-interactive-md text-[12px]">Fully verified</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity Table */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
          <button className="text-primary font-interactive-md text-interactive-md hover:underline cursor-pointer">View All</button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Date &amp; Time</th>
                <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Action</th>
                <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">User / Subject</th>
                <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Status</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {[
                { date: 'Oct 24, 09:30 AM', action: 'New Entry Submission', user: 'Jockey: Arthur Pendelton', status: 'Pending', statusClass: 'bg-surface-container border border-outline-variant' },
                { date: 'Oct 23, 16:45 PM', action: 'Tournament Scheduled', user: 'Royal Ascot Qualifier', status: 'Confirmed', statusClass: 'bg-primary/10 text-primary border border-primary/20' },
                { date: 'Oct 23, 11:15 AM', action: 'Referee Assigned', user: 'Match #402 - Stewart, D.', status: 'Confirmed', statusClass: 'bg-primary/10 text-primary border border-primary/20' }
              ].map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-default group"
                >
                  <td className="py-stack-sm px-stack-md text-on-surface-variant group-hover:text-on-surface transition-colors">{row.date}</td>
                  <td className="py-stack-sm px-stack-md font-medium">{row.action}</td>
                  <td className="py-stack-sm px-stack-md font-interactive-md">{row.user}</td>
                  <td className="py-stack-sm px-stack-md">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-interactive-md ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
