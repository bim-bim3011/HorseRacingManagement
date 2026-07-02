import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyHorses, createHorse, updateHorse, deleteHorse } from '../../api/horseApi';

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

export default function OwnerHorsesTab() {
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    healthStatus: 'HEALTHY'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async () => {
    setIsLoading(true);
    try {
      const data = await getMyHorses();
      setHorses(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load horses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (horse = null) => {
    if (horse) {
      setEditingHorse(horse);
      setFormData({
        name: horse.name || '',
        breed: horse.breed || '',
        age: horse.age || '',
        healthStatus: horse.healthStatus || 'HEALTHY'
      });
    } else {
      setEditingHorse(null);
      setFormData({
        name: '',
        breed: '',
        age: '',
        healthStatus: 'HEALTHY'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHorse(null);
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
      if (editingHorse) {
        await updateHorse(editingHorse.id, formData);
      } else {
        await createHorse(formData);
      }
      await fetchHorses();
      handleCloseModal();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this horse?')) return;
    try {
      await deleteHorse(id);
      await fetchHorses();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="max-w-[1280px] mx-auto space-y-stack-lg"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-end border-b border-outline-variant pb-stack-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">My Horses</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Manage your racing horses, view status and details.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Register Horse
        </motion.button>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md">
          {error}
        </motion.div>
      )}

      {/* Main Table */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">Registered Horses</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading your horses...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">ID</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Name</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Breed</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Age</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Status</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Health</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {horses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-on-surface-variant font-interactive-md">
                      You haven't registered any horses yet.
                    </td>
                  </tr>
                ) : (
                  horses.map((horse, i) => (
                    <motion.tr 
                      key={horse.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-default group"
                    >
                      <td className="py-stack-sm px-stack-md text-on-surface-variant">#{horse.id}</td>
                      <td className="py-stack-sm px-stack-md font-interactive-md">{horse.name}</td>
                      <td className="py-stack-sm px-stack-md">{horse.breed || '-'}</td>
                      <td className="py-stack-sm px-stack-md">{horse.age} yrs</td>
                      <td className="py-stack-sm px-stack-md">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-interactive-md 
                          ${horse.status === 'APPROVED' ? 'bg-primary-fixed text-on-primary-fixed' : 
                            horse.status === 'PENDING' ? 'bg-secondary-fixed text-on-secondary-fixed' : 
                            'bg-error-container text-on-error-container'}`}
                        >
                          {horse.status}
                        </span>
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <span className="inline-flex items-center gap-1 font-interactive-md">
                          <span className={`material-symbols-outlined text-[16px] ${horse.healthStatus === 'HEALTHY' ? 'text-primary' : 'text-error'}`}>
                            {horse.healthStatus === 'HEALTHY' ? 'health_and_safety' : 'warning'}
                          </span>
                          {horse.healthStatus}
                        </span>
                      </td>
                      <td className="py-stack-sm px-stack-md text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(horse)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(horse.id)}
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleCloseModal}
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[100]"
            />
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
                    {editingHorse ? 'Edit Horse' : 'Register New Horse'}
                  </h3>
                  <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-stack-md flex-grow overflow-y-auto space-y-4">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Horse Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="e.g. Secretariat"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Breed</label>
                      <input 
                        type="text" 
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="e.g. Thoroughbred"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Age *</label>
                      <input 
                        type="number" 
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Health Status</label>
                    <select 
                      name="healthStatus"
                      value={formData.healthStatus}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    >
                      <option value="HEALTHY">Healthy</option>
                      <option value="INJURED">Injured</option>
                      <option value="RESTING">Resting</option>
                    </select>
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
                      {editingHorse ? 'Save Changes' : 'Register Horse'}
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
