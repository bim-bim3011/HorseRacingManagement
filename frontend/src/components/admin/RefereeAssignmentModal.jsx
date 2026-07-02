import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getActiveReferees,
  getAssignmentsByRace,
  assignToRace,
  unassignFromRace
} from '../../api/refereeApi';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function RefereeAssignmentModal({ race, onClose }) {
  const [assignedReferees, setAssignedReferees] = useState([]);
  const [activeReferees, setActiveReferees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (race) {
      fetchData();
    }
  }, [race]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [assignmentsData, activeData] = await Promise.all([
        getAssignmentsByRace(race.id),
        getActiveReferees()
      ]);
      setAssignedReferees(assignmentsData || []);
      setActiveReferees(activeData || []);
    } catch (err) {
      setError('Failed to load referees data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (refereeId) => {
    setIsProcessing(true);
    setError('');
    try {
      await assignToRace(race.id, refereeId);
      await fetchData(); // Refresh lists
    } catch (err) {
      setError(err.message || 'Failed to assign referee.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnassign = async (refereeId) => {
    setIsProcessing(true);
    setError('');
    try {
      await unassignFromRace(race.id, refereeId);
      await fetchData(); // Refresh lists
    } catch (err) {
      setError(err.message || 'Failed to unassign referee.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter out referees that are already assigned
  const assignedIds = assignedReferees.map(a => a.refereeId);
  const availableReferees = activeReferees.filter(r => !assignedIds.includes(r.id));

  return (
    <>
      <motion.div 
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[100]"
      />
      <motion.div 
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant w-full max-w-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Assign Referees</h3>
              <p className="text-on-surface-variant font-body text-sm mt-1">Race: {race.name}</p>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-6 flex-grow overflow-y-auto bg-surface-container-lowest">
            {error && (
              <div className="mb-4 p-3 bg-error-container text-error rounded-lg font-body text-sm flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Assigned Referees Section */}
                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface flex flex-col h-[400px]">
                  <div className="bg-surface-container px-4 py-3 border-b border-outline-variant">
                    <h4 className="font-label-caps font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      Assigned ({assignedReferees.length})
                    </h4>
                  </div>
                  <div className="overflow-y-auto flex-grow p-2">
                    {assignedReferees.length === 0 ? (
                      <p className="text-center text-on-surface-variant text-sm py-4 italic">No referees assigned yet.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {assignedReferees.map((assignment) => (
                          <li key={assignment.id} className="flex justify-between items-center p-3 bg-surface-container-lowest border border-outline-variant rounded-lg group hover:border-error transition-colors">
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-body font-semibold text-on-surface truncate">{assignment.refereeName}</span>
                              <span className="text-xs text-on-surface-variant truncate">{assignment.licenseNumber}</span>
                            </div>
                            <button
                              onClick={() => handleUnassign(assignment.refereeId)}
                              disabled={isProcessing}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                              title="Unassign"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_remove</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Available Referees Section */}
                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface flex flex-col h-[400px]">
                  <div className="bg-surface-container px-4 py-3 border-b border-outline-variant">
                    <h4 className="font-label-caps font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                      Available ({availableReferees.length})
                    </h4>
                  </div>
                  <div className="overflow-y-auto flex-grow p-2">
                    {availableReferees.length === 0 ? (
                      <p className="text-center text-on-surface-variant text-sm py-4 italic">No available referees found.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {availableReferees.map((referee) => (
                          <li key={referee.id} className="flex justify-between items-center p-3 bg-surface-container-lowest border border-outline-variant rounded-lg group hover:border-primary transition-colors">
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-body font-semibold text-on-surface truncate">{referee.fullName}</span>
                              <span className="text-xs text-on-surface-variant truncate">{referee.licenseNumber}</span>
                            </div>
                            <button
                              onClick={() => handleAssign(referee.id)}
                              disabled={isProcessing}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                              title="Assign to Race"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_add</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-outline-variant flex justify-end bg-surface-container-low">
            <button 
              onClick={onClose}
              className="px-5 py-2 font-interactive-md bg-primary text-on-primary rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
