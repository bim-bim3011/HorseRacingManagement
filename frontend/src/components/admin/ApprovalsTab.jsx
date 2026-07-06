import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingHorses, approveHorse, rejectHorse } from '../../api/horseApi';

export default function ApprovalsTab() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingHorses();
  }, []);

  const fetchPendingHorses = async () => {
    try {
      setLoading(true);
      const data = await getPendingHorses();
      setHorses(data || []);
    } catch (error) {
      console.error('Failed to fetch pending horses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await approveHorse(id);
      // Remove horse from list with animation
      setHorses(prev => prev.filter(horse => horse.id !== id));
    } catch (error) {
      console.error('Failed to approve horse:', error);
      alert('Failed to approve horse. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this horse?')) return;
    try {
      setProcessingId(id);
      await rejectHorse(id);
      // Remove horse from list with animation
      setHorses(prev => prev.filter(horse => horse.id !== id));
    } catch (error) {
      console.error('Failed to reject horse:', error);
      alert('Failed to reject horse. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant">
        <div>
          <h2 className="font-display text-2xl text-on-surface uppercase tracking-tight">Horse Approvals</h2>
          <p className="text-on-surface-variant mt-1 font-body">Review and approve new horses registered by owners</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchPendingHorses}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
          title="Refresh List"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
        </motion.button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Horse Name</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : horses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">task_alt</span>
                      <p className="font-interactive-md">No pending horses to approve.</p>
                      <p className="text-sm mt-1">All caught up!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {horses.map((horse) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -50, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      key={horse.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <td className="px-6 py-4 font-body text-on-surface font-semibold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                          {horse.name.charAt(0)}
                        </div>
                        {horse.name}
                      </td>
                      <td className="px-6 py-4 font-body text-on-surface-variant">{horse.ownerName || 'N/A'}</td>
                      <td className="px-6 py-4 font-body text-on-surface-variant">{horse.age}</td>
                      <td className="px-6 py-4 font-body text-on-surface-variant capitalize">{horse.gender?.toLowerCase() || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tertiary/10 text-tertiary">
                          {horse.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: processingId === horse.id ? 1 : 1.1 }}
                            whileTap={{ scale: processingId === horse.id ? 1 : 0.9 }}
                            onClick={() => handleApprove(horse.id)}
                            disabled={processingId === horse.id}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              processingId === horse.id 
                              ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' 
                              : 'text-primary hover:bg-primary/10'
                            }`}
                            title="Approve Horse"
                          >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: processingId === horse.id ? 1 : 1.1 }}
                            whileTap={{ scale: processingId === horse.id ? 1 : 0.9 }}
                            onClick={() => handleReject(horse.id)}
                            disabled={processingId === horse.id}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              processingId === horse.id 
                              ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' 
                              : 'text-error hover:bg-error/10'
                            }`}
                            title="Reject Horse"
                          >
                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
