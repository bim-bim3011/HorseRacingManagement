import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableJockeys, sendInvitation } from '../../api/jockeyInvitationApi';
import { getMyHorses } from '../../api/horseApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function OwnerJockeysTab() {
  const [jockeys, setJockeys] = useState([]);
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJockey, setSelectedJockey] = useState(null);
  const [formData, setFormData] = useState({ horseId: '', raceId: '' });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jockeysData, horsesData] = await Promise.all([
        getAvailableJockeys(),
        getMyHorses()
      ]);
      setJockeys(jockeysData || []);
      setHorses(horsesData || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (jockey) => {
    setSelectedJockey(jockey);
    setFormData({ horseId: '', raceId: '' }); // raceId would need to be fetched based on horse/tournaments ideally, but for now we'll use an input or mock
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.horseId || !formData.raceId) {
      alert("Please fill all fields");
      return;
    }
    setIsSending(true);
    try {
      await sendInvitation(formData.raceId, formData.horseId, selectedJockey.id);
      alert("Invitation sent successfully!");
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to send invitation");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="max-w-[1280px] mx-auto space-y-stack-lg">
      <motion.div variants={itemVariants} className="border-b border-outline-variant pb-stack-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Jockey Management</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Hire available jockeys and assign them to your horses for upcoming races.</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">Available Jockeys</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading jockeys...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps">Jockey ID</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Name</th>
                  <th className="py-stack-sm px-stack-md font-label-caps">Status</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {jockeys.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-on-surface-variant">No jockeys available right now.</td>
                  </tr>
                ) : (
                  jockeys.map((jockey, i) => (
                    <motion.tr key={jockey.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-outline-variant hover:bg-surface-container-highest">
                      <td className="py-stack-sm px-stack-md text-on-surface-variant">#{jockey.id}</td>
                      <td className="py-stack-sm px-stack-md font-interactive-md">{jockey.firstName} {jockey.lastName}</td>
                      <td className="py-stack-sm px-stack-md">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[12px] bg-primary-fixed text-on-primary-fixed font-interactive-md">
                          Available
                        </span>
                      </td>
                      <td className="py-stack-sm px-stack-md text-right">
                        <button onClick={() => handleOpenModal(jockey)} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-interactive-md hover:bg-primary-container transition-colors">
                          Hire Jockey
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-surface rounded-xl shadow-2xl border w-full max-w-md relative z-10 overflow-hidden">
              <div className="px-6 py-4 border-b bg-surface-container-low flex justify-between items-center">
                <h3 className="font-headline-md text-on-surface">Hire {selectedJockey?.firstName} {selectedJockey?.lastName}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Select Horse</label>
                  <select required value={formData.horseId} onChange={(e) => setFormData({...formData, horseId: e.target.value})} className="w-full bg-surface-container-lowest border rounded-lg px-4 py-2">
                    <option value="">-- Choose your horse --</option>
                    {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Race ID</label>
                  <input required type="number" value={formData.raceId} onChange={(e) => setFormData({...formData, raceId: e.target.value})} placeholder="Enter Race ID" className="w-full bg-surface-container-lowest border rounded-lg px-4 py-2" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                  <button type="submit" disabled={isSending} className="px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center gap-2">
                    {isSending ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
