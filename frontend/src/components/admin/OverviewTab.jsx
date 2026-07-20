import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardMetrics, getUserRolesChart, getAttentionRequired } from '../../api/adminDashboardApi';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.05)", transition: { duration: 0.2 } }
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

export default function OverviewTab() {
  const [metrics, setMetrics] = useState(null);
  const [roleData, setRoleData] = useState([]);
  const [attentionItems, setAttentionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using Promise.allSettled to ensure dashboard renders even if one API fails
        const [metricsRes, rolesRes, attentionRes] = await Promise.allSettled([
          getDashboardMetrics(),
          getUserRolesChart(),
          getAttentionRequired()
        ]);

        if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
        if (rolesRes.status === 'fulfilled') setRoleData(rolesRes.value);
        if (attentionRes.status === 'fulfilled') setAttentionItems(attentionRes.value);
        
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

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
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Live administrative metrics and platform statistics.</p>
        </div>
        <div className="flex gap-stack-sm">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh Data
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* KPIs Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Total Users */}
            <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col justify-between relative overflow-hidden group cursor-default">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
              <div className="flex justify-between items-start mb-stack-md relative z-10">
                <span className="font-label-caps text-label-caps text-on-surface-variant">Total Users</span>
                <span className="material-symbols-outlined text-primary">groups</span>
              </div>
              <div className="relative z-10">
                <span className="font-display-lg text-display-lg text-on-surface">{metrics?.totalUsers || 0}</span>
                <div className="flex items-center gap-unit mt-unit text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                  <span className="font-interactive-md text-[12px]">Registered Accounts</span>
                </div>
              </div>
            </motion.div>

            {/* Active Tournaments */}
            <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col justify-between relative overflow-hidden group cursor-default">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
              <div className="flex justify-between items-start mb-stack-md relative z-10">
                <span className="font-label-caps text-label-caps text-on-surface-variant">Active Tournaments</span>
                <span className="material-symbols-outlined text-primary">emoji_events</span>
              </div>
              <div className="relative z-10">
                <span className="font-display-lg text-display-lg text-on-surface">{metrics?.activeTournaments || 0}</span>
                <div className="flex items-center gap-unit mt-unit text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                  <span className="font-interactive-md text-[12px]">Ongoing & Upcoming</span>
                </div>
              </div>
            </motion.div>

            {/* Pending Withdrawals */}
            <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-error/50 p-stack-md flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-sm shadow-error/10">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
              <div className="flex justify-between items-start mb-stack-md relative z-10">
                <span className="font-label-caps text-label-caps text-error">Pending Withdrawals</span>
                <span className="material-symbols-outlined text-error">payments</span>
              </div>
              <div className="relative z-10">
                <span className="font-display-lg text-display-lg text-on-surface">{metrics?.pendingWithdrawalsCount || 0}</span>
                <div className="flex items-center gap-unit mt-unit text-error bg-error/10 w-fit px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="font-interactive-md text-[12px]">Requires Approval</span>
                </div>
              </div>
            </motion.div>

            {/* Total Balance */}
            <motion.div variants={cardVariants} whileHover="hover" className="bg-surface rounded-xl border border-outline-variant p-stack-md flex flex-col justify-between relative overflow-hidden group cursor-default">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
              <div className="flex justify-between items-start mb-stack-md relative z-10">
                <span className="font-label-caps text-label-caps text-on-surface-variant">Total Wallet Balances</span>
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              </div>
              <div className="relative z-10">
                <span className="font-display-sm text-display-sm text-on-surface truncate" title={formatCurrency(metrics?.totalWalletBalances)}>{formatCurrency(metrics?.totalWalletBalances)}</span>
                <div className="flex items-center gap-unit mt-unit text-on-surface-variant bg-surface-variant w-fit px-2 py-0.5 rounded-full">
                  <span className="font-interactive-md text-[12px]">Platform Liability</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Role Distribution Chart */}
            <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant p-stack-md lg:col-span-1 h-96 flex flex-col shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">User Demographics</h3>
              <div className="flex-grow">
                {roleData && roleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant">No data available</div>
                )}
              </div>
            </motion.div>

            {/* Placeholder for Revenue/Deposits Chart */}
            <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant p-stack-md lg:col-span-2 h-96 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">Weekly Deposits Trend</h3>
                <span className="text-on-surface-variant text-sm bg-surface-container px-2 py-1 rounded-md">Last 7 Days</span>
              </div>
              <div className="flex-grow flex items-center justify-center border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-lowest">
                <div className="text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">bar_chart</span>
                  <p className="font-interactive-md">Deposit metrics will be integrated here</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Attention Required Table */}
          <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="px-stack-md py-stack-sm border-b border-error/20 flex justify-between items-center bg-error/5">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined">assignment_late</span>
                <h3 className="font-headline-md text-headline-md font-bold">Attention Required</h3>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-outline-variant bg-surface text-on-surface-variant">
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Date</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Task Type</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Subject</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {attentionItems && attentionItems.length > 0 ? (
                    attentionItems.map((row, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (i * 0.05) }}
                        className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors group"
                      >
                        <td className="py-stack-sm px-stack-md text-on-surface-variant">{row.createdAt}</td>
                        <td className="py-stack-sm px-stack-md font-medium text-error">{row.type}</td>
                        <td className="py-stack-sm px-stack-md font-interactive-md">{row.subject}</td>
                        <td className="py-stack-sm px-stack-md text-right">
                          <button className="text-primary hover:underline font-interactive-md text-sm">Review Now</button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-stack-lg text-center text-on-surface-variant font-interactive-md">
                        <span className="material-symbols-outlined text-[32px] mb-2 block opacity-50">done_all</span>
                        No urgent tasks at the moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
