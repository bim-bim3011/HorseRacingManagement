import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyInvitations, acceptInvitation, declineInvitation } from '../../api/jockeyInvitationApi';
import { useNotification } from '../../contexts/NotificationContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function JockeyInvitationsTab() {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getMyInvitations();
      setInvitations(data || []);
    } catch (err) {
      showToast('Error', err.message || 'Failed to fetch invitations');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setProcessingId(id);
      
      // Optimistic UI update to immediately trigger animations
      setInvitations(prev => prev.map(inv =>
        inv.id === id ? { ...inv, status: action === 'accept' ? 'accepted' : 'declined' } : inv
      ));

      if (action === 'accept') {
        await acceptInvitation(id);
        showToast('Success', 'Invitation accepted successfully!');
      } else {
        await declineInvitation(id);
        showToast('Success', 'Invitation declined.');
      }
      // Re-fetch silently to get the exact backend state (since accepting one declines others)
      await fetchInvitations(true);
    } catch (err) {
      // Revert on error
      await fetchInvitations(true);
      showToast('Error', err.message || `Failed to ${action} invitation`);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const pastInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="max-w-[1280px] mx-auto space-y-stack-lg">
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">My Invitations</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Manage requests from horse owners to ride their horses.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-headline-md text-headline-md text-on-surface">Pending Requests</h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-on-surface-variant font-interactive-sm">Loading invitations...</p>
          </div>
        ) : pendingInvitations.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-3">mark_email_read</span>
            <p className="text-on-surface-variant font-interactive-md">You have no pending invitations.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingInvitations.map(inv => {
              const raceDate = inv.raceDatetime ? new Date(inv.raceDatetime).toLocaleString() : 'TBD';
              const horseAge = inv.horseAge !== null && inv.horseAge !== undefined ? inv.horseAge : 'N/A';

              return (
                <motion.div key={inv.id} variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-outline-variant">
                    <div>
                      <h4 className="font-bold text-xl text-on-surface">
                        {inv.raceName}
                        {inv.raceRound && <span className="ml-2 align-middle inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{inv.raceRound}</span>}
                      </h4>
                      <p className="text-on-surface-variant font-medium mt-1">{inv.tournamentName}</p>
                    </div>
                    <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                      {inv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Race Details</h5>
                      <div className="flex items-center text-on-surface text-sm">
                        <span className="material-symbols-outlined text-[18px] mr-2 text-primary">calendar_today</span>
                        {raceDate}
                      </div>
                      <div className="flex items-center text-on-surface text-sm">
                        <span className="material-symbols-outlined text-[18px] mr-2 text-primary">straighten</span>
                        {inv.raceDistance ? `${inv.raceDistance}m` : 'N/A'}
                      </div>
                    </div>

                    <div className="space-y-3 border-l border-outline-variant pl-4">
                      <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Horse & Owner</h5>
                      <div className="flex items-center text-on-surface text-sm">
                        <span className="material-symbols-outlined text-[18px] mr-2 text-secondary">person</span>
                        Owner: <span className="font-medium ml-1">{inv.ownerName}</span>
                      </div>
                      <div className="flex items-center text-on-surface text-sm">
                        <span className="material-symbols-outlined text-[18px] mr-2 text-secondary">pets</span>
                        <span className="font-medium mr-1">{inv.horseName}</span>
                        ({inv.horseBreed || 'Unknown'}, {inv.horseGender || 'Unknown'})
                      </div>
                      <div className="flex items-center text-on-surface text-sm">
                        <span className="material-symbols-outlined text-[18px] mr-2 text-secondary">favorite</span>
                        Age: {horseAge} | Health: <span className="capitalize ml-1">{inv.horseHealthStatus || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto pt-2 border-t border-outline-variant">
                    <button
                      onClick={() => handleAction(inv.id, 'accept')}
                      disabled={processingId === inv.id}
                      className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-bold font-interactive-sm hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(inv.id, 'decline')}
                      disabled={processingId === inv.id}
                      className="flex-1 py-2 bg-error-container text-on-error-container rounded-lg font-bold font-interactive-sm hover:bg-error hover:text-on-error transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      Decline
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {pastInvitations.length > 0 && (
        <motion.div variants={itemVariants} className="pt-8">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Past Invitations</h3>
          <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
                  <th className="py-3 px-4 font-label-caps text-sm">Race</th>
                  <th className="py-3 px-4 font-label-caps text-sm">Horse</th>
                  <th className="py-3 px-4 font-label-caps text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {pastInvitations.map(inv => (
                  <tr key={inv.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-highest">
                    <td className="py-3 px-4">{inv.raceName}</td>
                    <td className="py-3 px-4 font-medium">{inv.horseName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase
                        ${inv.status === 'accepted' ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}
                      `}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
