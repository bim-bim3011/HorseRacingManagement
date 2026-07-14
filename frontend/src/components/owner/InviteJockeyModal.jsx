import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableJockeys, sendInvitation } from '../../api/jockeyInvitationApi';

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function InviteJockeyModal({ raceId, horseId, onClose, onSuccess }) {
  const [jockeys, setJockeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJockeys();
  }, []);

  const fetchJockeys = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAvailableJockeys();
      setJockeys(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch available jockeys. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (jockeyId) => {
    try {
      setIsSending(true);
      setError('');
      await sendInvitation(raceId, horseId, jockeyId);
      onSuccess(); // Triggers parent to close modal and refresh
    } catch (err) {
      setError(err.message || 'Failed to send invitation. They might already be invited.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div 
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-surface rounded-2xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] relative z-10"
        >
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center sticky top-0 z-10">
            <div>
              <h3 className="font-display text-xl text-on-surface font-bold uppercase tracking-tight">Invite Jockey</h3>
              <p className="text-sm text-on-surface-variant font-body mt-1">Select a jockey to invite for Race #{raceId}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-surface-container-lowest">
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg font-interactive-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-on-surface-variant font-interactive-sm">Finding available jockeys...</p>
              </div>
            ) : jockeys.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-outline-variant rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-3">sports_kabaddi</span>
                <p className="text-on-surface-variant font-interactive-md">No jockeys are currently available.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {jockeys.map(jockey => (
                  <div key={jockey.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-high transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-lg">
                        {jockey.name ? jockey.name.charAt(0).toUpperCase() : 'J'}
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-lg">{jockey.name}</h4>
                        <p className="text-sm text-on-surface-variant flex gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">weight</span>
                            {jockey.weight ? `${jockey.weight} kg` : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">military_tech</span>
                            {jockey.experience ? `${jockey.experience} yrs` : 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleInvite(jockey.id)}
                      disabled={isSending}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold font-interactive-sm hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary"></div>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      )}
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
