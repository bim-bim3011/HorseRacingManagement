import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllReferees,
  createReferee,
  updateReferee,
  deleteReferee,
  getAssignmentsByReferee
} from '../../api/refereeApi';

export default function RefereesTab() {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReferee, setEditingReferee] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    licenseNumber: '',
    status: 'ACTIVE'
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignments Modal State
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [viewingReferee, setViewingReferee] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    fetchReferees();
  }, []);

  const fetchReferees = async () => {
    try {
      setLoading(true);
      const data = await getAllReferees();
      setReferees(data || []);
    } catch (error) {
      console.error('Failed to fetch referees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (referee = null) => {
    setFormError('');
    if (referee) {
      setEditingReferee(referee);
      setFormData({
        username: referee.username || '',
        email: referee.email || '',
        password: '', // Don't populate password for editing
        fullName: referee.fullName || '',
        licenseNumber: referee.licenseNumber || '',
        status: referee.status || 'ACTIVE'
      });
    } else {
      setEditingReferee(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        licenseNumber: '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReferee(null);
  };

  const handleOpenAssignmentsModal = async (referee) => {
    setViewingReferee(referee);
    setIsAssignmentsModalOpen(true);
    setLoadingAssignments(true);
    try {
      const data = await getAssignmentsByReferee(referee.id);
      setAssignments(data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      alert('Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCloseAssignmentsModal = () => {
    setIsAssignmentsModalOpen(false);
    setViewingReferee(null);
    setAssignments([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingReferee) {
        // Remove password if it's empty during update
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateReferee(editingReferee.id, updateData);
      } else {
        await createReferee(formData);
      }
      await fetchReferees();
      handleCloseModal();
    } catch (error) {
      setFormError(error.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this referee?')) {
      try {
        await deleteReferee(id);
        await fetchReferees();
      } catch (error) {
        console.error('Failed to delete referee:', error);
        alert(error.message || 'Failed to deactivate referee');
      }
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
          <h2 className="font-display text-2xl text-on-surface uppercase tracking-tight">Referee Management</h2>
          <p className="text-on-surface-variant mt-1 font-body">Manage all referees and their credentials</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-interactive-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
          Add Referee
        </motion.button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">License</th>
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
              ) : referees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                    No referees found. Click "Add Referee" to create one.
                  </td>
                </tr>
              ) : (
                referees.map((referee) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={referee.id} 
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="px-6 py-4 font-body text-on-surface font-semibold">{referee.fullName}</td>
                    <td className="px-6 py-4 font-body text-on-surface-variant">{referee.username}</td>
                    <td className="px-6 py-4 font-body text-on-surface-variant">{referee.email}</td>
                    <td className="px-6 py-4 font-body text-on-surface-variant">{referee.licenseNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${referee.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                        {referee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenAssignmentsModal(referee)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                          title="View Assignments"
                        >
                          <span className="material-symbols-outlined text-[20px]">assignment</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(referee)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Edit Referee"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(referee.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error/10 transition-colors cursor-pointer"
                          title="Deactivate Referee"
                        >
                          <span className="material-symbols-outlined text-[20px]">person_off</span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface relative w-full max-w-lg rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-outline-variant overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-display text-xl uppercase tracking-tight text-on-surface">
                  {editingReferee ? 'Edit Referee' : 'Add New Referee'}
                </h3>
                <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {formError && (
                  <div className="mb-4 p-3 bg-error-container text-error rounded-lg font-body text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="e.g. ref_john"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Password {editingReferee && <span className="text-xs lowercase text-on-surface-variant/70 font-normal">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingReferee}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Enter strong password"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="e.g. LIC-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="cursor-pointer px-5 py-2.5 rounded-lg font-interactive-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-5 py-2.5 rounded-lg font-interactive-md bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 text-on-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <span className="material-symbols-outlined">{editingReferee ? 'save' : 'add_circle'}</span>
                    )}
                    {editingReferee ? 'Save Changes' : 'Create Referee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assignments Modal */}
      <AnimatePresence>
        {isAssignmentsModalOpen && viewingReferee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-sm"
              onClick={handleCloseAssignmentsModal}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface relative w-full max-w-2xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
                <div>
                  <h3 className="font-display text-xl uppercase tracking-tight text-on-surface">
                    Referee Assignments
                  </h3>
                  <p className="text-sm font-body text-on-surface-variant mt-1">
                    {viewingReferee.fullName} ({viewingReferee.licenseNumber})
                  </p>
                </div>
                <button onClick={handleCloseAssignmentsModal} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {loadingAssignments ? (
                  <div className="flex justify-center items-center py-10">
                    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-10 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant border-dashed">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                    <p>No active assignments found for this referee.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-body text-lg font-semibold text-on-surface">
                              {assignment.raceName || `Race #${assignment.raceId}`}
                            </h4>
                          </div>
                          <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded uppercase">
                            ASSIGNED
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
