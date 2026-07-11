import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRegistrationsByTournament, approveRegistration, rejectRegistration } from '../../api/tournamentRegistrationApi';

export default function TournamentRegistrationsTab({ tournament, onBack }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (tournament?.id) {
      fetchRegistrations();
    }
  }, [tournament?.id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getRegistrationsByTournament(tournament.id);
      setRegistrations(data || []);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await approveRegistration(tournament.id, id);
      setRegistrations(prev => prev.map(reg => 
        reg.id === id ? { ...reg, status: 'approved' } : reg
      ));
    } catch (error) {
      console.error('Failed to approve registration:', error);
      alert(error.message || 'Failed to approve registration. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this registration? The fee will be refunded.')) return;
    try {
      setProcessingId(id);
      await rejectRegistration(tournament.id, id);
      setRegistrations(prev => prev.map(reg => 
        reg.id === id ? { ...reg, status: 'rejected', paymentStatus: 'refunded' } : reg
      ));
    } catch (error) {
      console.error('Failed to reject registration:', error);
      alert(error.message || 'Failed to reject registration. Please try again.');
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
      {onBack && (
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface hover:bg-surface-container-high transition-colors text-on-surface shadow-sm cursor-pointer border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h2 className="font-display text-2xl text-on-surface uppercase tracking-tight">Tournament Registrations</h2>
            <p className="text-on-surface-variant mt-1 font-body">Manage entries for <span className="font-bold text-primary">{tournament.name}</span></p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex justify-end">
           <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchRegistrations}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
              title="Refresh List"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Horse</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Reserve</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">event_busy</span>
                      <p className="font-interactive-md">No registrations found for this tournament.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {registrations.map((reg) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={reg.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <td className="px-6 py-4 font-body text-on-surface font-semibold flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold uppercase">
                          {reg.horseName.charAt(0)}
                        </div>
                        {reg.horseName}
                      </td>
                      <td className="px-6 py-4 font-body">
                        {reg.isReserve ? (
                          <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs rounded font-bold uppercase">Reserve #{reg.reserveOrder}</span>
                        ) : (
                          <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded font-bold uppercase">Main Entry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-body">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                           reg.paymentStatus === 'paid' ? 'bg-primary/10 text-primary' : 
                           reg.paymentStatus === 'refunded' ? 'bg-error/10 text-error' : 'bg-surface-variant/30 text-on-surface'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          reg.status === 'approved' ? 'bg-primary/10 text-primary' :
                          reg.status === 'rejected' ? 'bg-error/10 text-error' :
                          'bg-surface-variant/30 text-on-surface'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reg.status === 'pending' ? (
                           <div className="flex justify-end gap-2">
                             <motion.button
                               whileHover={{ scale: processingId === reg.id ? 1 : 1.1 }}
                               whileTap={{ scale: processingId === reg.id ? 1 : 0.9 }}
                               onClick={() => handleApprove(reg.id)}
                               disabled={processingId === reg.id}
                               className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                 processingId === reg.id 
                                 ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' 
                                 : 'text-primary hover:bg-primary/10'
                               }`}
                               title="Approve"
                             >
                               <span className="material-symbols-outlined text-[20px]">check_circle</span>
                             </motion.button>
                             <motion.button
                               whileHover={{ scale: processingId === reg.id ? 1 : 1.1 }}
                               whileTap={{ scale: processingId === reg.id ? 1 : 0.9 }}
                               onClick={() => handleReject(reg.id)}
                               disabled={processingId === reg.id}
                               className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                 processingId === reg.id 
                                 ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' 
                                 : 'text-error hover:bg-error/10'
                               }`}
                               title="Reject"
                             >
                               <span className="material-symbols-outlined text-[20px]">cancel</span>
                             </motion.button>
                           </div>
                        ) : (
                          <span className="text-on-surface-variant text-sm italic">Processed</span>
                        )}
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
