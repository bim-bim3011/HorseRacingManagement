import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getOwnerOverview } from '../../api/horseOwnerApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function OwnerOverviewTab({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const overviewData = await getOwnerOverview();
        setData(overviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error p-4">
        <span className="material-symbols-outlined text-[48px] mb-2">error</span>
        <p>{error}</p>
      </div>
    );
  }

  const stats = [
    { title: 'My Horses', value: data?.totalHorses || '0', icon: 'pets', color: 'text-primary' },
    { title: 'Hired Jockeys', value: data?.hiredJockeys || '0', icon: 'person', color: 'text-tertiary' },
    { title: 'Upcoming Races', value: data?.upcomingRaces || '0', icon: 'event', color: 'text-secondary' },
    { title: 'Total 1st Places', value: data?.totalFirstPlaces || '0', icon: 'emoji_events', color: 'text-error' },
  ];

  // Prepare chart data from topHorses
  const chartData = data?.topHorses?.length > 0 
    ? data.topHorses.map(horse => ({
        name: horse.horseName,
        value: horse.firstPlaces
      }))
    : [{ name: 'No Data', value: 1 }]; // Fallback if no wins

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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
        {/* Left Column (2/3 width) - Charts & Top Horses */}
        <div className="lg:col-span-2 space-y-stack-lg">
          {/* Top Horses Win Rate Chart */}
          <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col h-[400px]">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Top Horses (1st Places)</h3>
            {data?.topHorses?.length > 0 ? (
              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">pie_chart</span>
                <p className="font-interactive-md">Not enough race data to generate charts.</p>
              </div>
            )}
          </motion.div>

          {/* Top Horses List */}
          <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
             <div className="p-stack-md border-b border-outline-variant">
               <h3 className="font-headline-md text-headline-md text-on-surface">Top Performing Horses</h3>
             </div>
             <div className="p-0">
                {data?.topHorses?.length > 0 ? (
                  <ul className="divide-y divide-outline-variant">
                    {data.topHorses.map((horse, idx) => (
                      <li key={idx} className="flex items-center justify-between p-stack-md hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                             {horse.horseName.charAt(0)}
                           </div>
                           <span className="font-interactive-lg text-on-surface">{horse.horseName}</span>
                        </div>
                        <div className="text-right">
                           <span className="font-display-sm text-primary flex items-center gap-1 justify-end">
                             <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                             {horse.firstPlaces} Wins
                           </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-stack-lg text-center text-on-surface-variant">
                     <p>No performing horses found yet.</p>
                  </div>
                )}
             </div>
          </motion.div>
        </div>

        {/* Right Column (1/3 width) - Schedule & Quick Actions */}
        <div className="space-y-stack-lg">
          {/* Quick Actions */}
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

          {/* Upcoming Schedule */}
          <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col">
            <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Schedule</h3>
              <button onClick={() => onNavigate('schedule')} className="text-primary hover:underline text-sm font-medium cursor-pointer">View All</button>
            </div>
            <div className="p-0">
              {data?.upcomingSchedule?.length > 0 ? (
                 <ul className="divide-y divide-outline-variant">
                   {data.upcomingSchedule.map((race, i) => (
                     <li key={i} className="p-stack-md hover:bg-surface-container-low transition-colors">
                       <p className="font-label-sm text-on-surface-variant mb-1">
                         {new Date(race.raceDatetime).toLocaleDateString()} - {new Date(race.raceDatetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </p>
                       <p className="font-interactive-md text-on-surface">{race.raceName}</p>
                       <p className="font-body-sm text-on-surface-variant mt-1 line-clamp-1">{race.tournamentName}</p>
                       <div className="mt-2 flex gap-2">
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-medium">
                           <span className="material-symbols-outlined text-[14px]">pets</span>
                           {race.horseName}
                         </span>
                         {race.jockeyName && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-tertiary/10 text-tertiary text-xs font-medium">
                             <span className="material-symbols-outlined text-[14px]">person</span>
                             {race.jockeyName}
                           </span>
                         )}
                       </div>
                     </li>
                   ))}
                 </ul>
              ) : (
                <div className="p-stack-md flex flex-col items-center text-center text-on-surface-variant py-8">
                  <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">event_busy</span>
                  <p className="font-interactive-sm">No upcoming races scheduled.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
