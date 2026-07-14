import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllPenaltyRules, 
  createPenaltyRule, 
  updatePenaltyRule, 
  deletePenaltyRule 
} from '../../api/penaltyRuleApi';

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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function PenaltyRulesTab({ tournament, onBack }) {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    violationType: '',
    pointDeduction: 0,
    fineAmount: 0,
    banDays: 0,
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tournament && tournament.id) {
      fetchRules();
    }
  }, [tournament]);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPenaltyRules(tournament.id);
      setRules(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch penalty rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        violationType: rule.violationType || '',
        pointDeduction: rule.pointDeduction || 0,
        fineAmount: rule.fineAmount || 0,
        banDays: rule.banDays || 0,
        description: rule.description || ''
      });
    } else {
      setEditingRule(null);
      setFormData({
        violationType: '',
        pointDeduction: 0,
        fineAmount: 0,
        banDays: 0,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingRule) {
        await updatePenaltyRule(tournament.id, editingRule.id, formData);
      } else {
        await createPenaltyRule(tournament.id, formData);
      }
      await fetchRules();
      handleCloseModal();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this penalty rule?')) return;
    try {
      await deletePenaltyRule(tournament.id, id);
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (!tournament) return null;

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
          {onBack && (
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={onBack}
                className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <span className="font-label-caps text-label-caps text-primary uppercase">{tournament.name}</span>
            </div>
          )}
          <h2 className="font-display-lg text-display-lg text-on-surface">Penalty Rules</h2>
          {onBack && <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Manage violation types and penalties for this tournament.</p>}
        </div>
        <div className="flex gap-stack-sm">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Rule
          </motion.button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      {/* Main Table */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">All Penalty Rules</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading penalty rules...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">ID</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Violation Type</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Points Ded.</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Fine ($)</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Ban (Days)</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Description</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-on-surface-variant font-interactive-md">
                      No penalty rules found for this tournament.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule, i) => (
                    <motion.tr 
                      key={rule.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-default group"
                    >
                      <td className="py-stack-sm px-stack-md text-on-surface-variant">#{rule.id}</td>
                      <td className="py-stack-sm px-stack-md font-interactive-md">{rule.violationType}</td>
                      <td className="py-stack-sm px-stack-md text-error font-bold">-{rule.pointDeduction}</td>
                      <td className="py-stack-sm px-stack-md text-error">${rule.fineAmount}</td>
                      <td className="py-stack-sm px-stack-md">{rule.banDays} days</td>
                      <td className="py-stack-sm px-stack-md truncate max-w-[200px]" title={rule.description}>{rule.description || '-'}</td>
                      <td className="py-stack-sm px-stack-md text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(rule)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Modal / Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleCloseModal}
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[100]"
            />
            {/* Modal Content */}
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-full">
                <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {editingRule ? 'Edit Penalty Rule' : 'New Penalty Rule'}
                  </h3>
                  <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-stack-md flex-grow overflow-y-auto space-y-4">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Violation Type *</label>
                    <input 
                      type="text" 
                      name="violationType"
                      value={formData.violationType}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="e.g. Doping, Dangerous Riding"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Points Deduction *</label>
                      <input 
                        type="number" 
                        name="pointDeduction"
                        value={formData.pointDeduction}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Fine Amount ($) *</label>
                      <input 
                        type="number" 
                        name="fineAmount"
                        value={formData.fineAmount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Ban Days *</label>
                    <input 
                      type="number" 
                      name="banDays"
                      value={formData.banDays}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
                      placeholder="Detailed explanation of the rule..."
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant mt-6">
                    <button 
                      type="button" 
                      onClick={handleCloseModal}
                      className="px-4 py-2 font-interactive-md text-interactive-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                      {editingRule ? 'Save Changes' : 'Create Rule'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
