import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyHorsesPaginated, createHorse, updateHorse, deleteHorse } from '../../api/horseApi';

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

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    horseCode: '',
    breed: '',
    gender: 'Stallion',
    dateOfBirth: '',
    height: '',
    weight: '',
    healthStatus: 'HEALTHY',
    certificate: null
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
  };

  useEffect(() => {
    fetchHorses();
  }, [currentPage, searchQuery, statusFilter, genderFilter, sortBy, sortDir]);

  const fetchHorses = async () => {
    setIsLoading(true);
    try {
      const data = await getMyHorsesPaginated({
        page: currentPage,
        size: 10,
        keyword: searchQuery,
        status: statusFilter,
        gender: genderFilter,
        sortBy,
        sortDir
      });
      setHorses(data.content || []);
      setTotalPages(data.totalPages || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load horses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(0);
  };

  const handleOpenModal = (horse = null) => {
    if (horse) {
      setEditingHorse(horse);
      setFormData({
        name: horse.name || '',
        horseCode: horse.horseCode || '',
        breed: horse.breed || '',
        gender: horse.gender || 'Stallion',
        dateOfBirth: horse.dateOfBirth || '',
        height: horse.height || '',
        weight: horse.weight || '',
        healthStatus: horse.healthStatus || 'HEALTHY'
      });
    } else {
      setEditingHorse(null);
      setFormData({
        name: '',
        horseCode: '',
        breed: '',
        gender: 'Stallion',
        dateOfBirth: '',
        height: '',
        weight: '',
        healthStatus: 'HEALTHY',
        certificate: null
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
      const payload = new FormData();
      payload.append('horse', new Blob([JSON.stringify({
        name: formData.name,
        horseCode: formData.horseCode,
        breed: formData.breed,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        height: formData.height,
        weight: formData.weight,
        healthStatus: formData.healthStatus
      })], { type: 'application/json' }));
      
      if (formData.certificate) {
        payload.append('certificate', formData.certificate);
      }

      if (editingHorse) {
        await updateHorse(editingHorse.id, payload);
      } else {
        if (!formData.certificate) {
          alert('Health certificate is required for new horses.');
          setIsSaving(false);
          return;
        }
        await createHorse(payload);
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-outline-variant pb-stack-sm gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">My Horses</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Manage your racing horses, view status and details.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer whitespace-nowrap"
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

      {/* Toolbar */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search horse by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-on-surface font-interactive-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-interactive-md hover:bg-secondary-fixed-dim transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            className="bg-surface-container border border-outline-variant text-on-surface rounded-lg px-3 py-2 font-interactive-sm focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
            <option value="banned">Banned</option>
          </select>

          <select 
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(0); }}
            className="bg-surface-container border border-outline-variant text-on-surface rounded-lg px-3 py-2 font-interactive-sm focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">All Genders</option>
            <option value="Stallion">Stallion</option>
            <option value="Mare">Mare</option>
            <option value="Gelding">Gelding</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
            className="bg-surface-container border border-outline-variant text-on-surface rounded-lg px-3 py-2 font-interactive-sm focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="id">Sort by Default</option>
            <option value="name">Sort by Name</option>
            <option value="dateOfBirth">Sort by Age</option>
          </select>
        </div>
      </motion.div>

      {/* Main Table */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading your horses...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-primary bg-surface-container-low text-on-surface-variant">
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Code</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Name</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Breed</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Gender</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">DOB</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Height</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Weight</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Status</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap">Health</th>
                    <th className="py-stack-sm px-stack-md font-label-caps text-label-caps whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {horses.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">sentiment_dissatisfied</span>
                        <p className="font-interactive-md">No horses found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    horses.map((horse, i) => (
                      <motion.tr 
                        key={horse.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-default group"
                      >
                        <td className="py-stack-sm px-stack-md text-on-surface-variant font-mono">{horse.horseCode || '-'}</td>
                        <td className="py-stack-sm px-stack-md font-bold text-on-surface">{horse.name}</td>
                        <td className="py-stack-sm px-stack-md">{horse.breed || '-'}</td>
                        <td className="py-stack-sm px-stack-md">{horse.gender || '-'}</td>
                        <td className="py-stack-sm px-stack-md">{horse.dateOfBirth || '-'}</td>
                        <td className="py-stack-sm px-stack-md">{horse.height ? `${horse.height} cm` : '-'}</td>
                        <td className="py-stack-sm px-stack-md">{horse.weight ? `${horse.weight} kg` : '-'}</td>
                        <td className="py-stack-sm px-stack-md">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-bold uppercase tracking-wider
                            ${horse.status === 'APPROVED' || horse.status === 'active' ? 'bg-primary-fixed text-on-primary-fixed' : 
                              horse.status === 'PENDING' || horse.status === 'inactive' ? 'bg-secondary-fixed text-on-secondary-fixed' : 
                              'bg-error-container text-on-error-container'}`}
                          >
                            {horse.status}
                          </span>
                        </td>
                        <td className="py-stack-sm px-stack-md">
                          <span className="inline-flex items-center gap-1 font-interactive-sm font-medium">
                            <span className={`material-symbols-outlined text-[16px] ${horse.healthStatus === 'HEALTHY' ? 'text-primary' : 'text-error'}`}>
                              {horse.healthStatus === 'HEALTHY' ? 'health_and_safety' : 'warning'}
                            </span>
                            {horse.healthStatus}
                          </span>
                        </td>
                        <td className="py-stack-sm px-stack-md text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(horse)}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-md transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(horse.id)}
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md transition-colors"
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-lowest">
                  <span className="text-sm text-on-surface-variant">
                    Page <span className="font-bold text-on-surface">{currentPage + 1}</span> of <span className="font-bold text-on-surface">{totalPages}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-1 border border-outline-variant rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-1 border border-outline-variant rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
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
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Horse Code *</label>
                      <input 
                        type="text" 
                        name="horseCode"
                        value={formData.horseCode}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="e.g. H-001"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Gender</label>
                      <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      >
                        <option value="Stallion">Stallion</option>
                        <option value="Mare">Mare</option>
                        <option value="Gelding">Gelding</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Breed</label>
                      <select 
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <option value="" disabled>Select a breed</option>
                        <option value="Thoroughbred">Thoroughbred</option>
                        <option value="Quarter Horse">Quarter Horse</option>
                        <option value="Standardbred">Standardbred</option>
                        <option value="Arabian">Arabian</option>
                        <option value="Appaloosa">Appaloosa</option>
                        <option value="Paint">Paint</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Date of Birth *</label>
                      <input 
                        type="date" 
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Height (cm)</label>
                      <input 
                        type="number" 
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        min="1"
                        step="0.1"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="e.g. 165"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="1"
                        step="0.1"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="e.g. 500"
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

                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">
                      {editingHorse ? 'Update Health Certificate (Leave blank to keep existing)' : 'Health Certificate (PDF/Image) *'}
                    </label>
                    <input 
                      type="file" 
                      name="certificate"
                      onChange={handleFileChange}
                      required={!editingHorse}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
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
