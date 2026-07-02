import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllRaces, 
  createRace, 
  updateRace, 
  deleteRace,
  activateRace
} from '../../api/raceApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import RefereeAssignmentModal from './RefereeAssignmentModal';

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

export default function RacesTab({ tournament, onBack }) {
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRace, setEditingRace] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    raceDatetime: null,
    roundOrder: '',
    isFinal: false,
    maxEntries: '',
    qualifyCount: '',
    distance: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [assigningRace, setAssigningRace] = useState(null);

  useEffect(() => {
    if (tournament && tournament.id) {
      fetchRaces();
    }
  }, [tournament]);

  const fetchRaces = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRaces(tournament.id);
      setRaces(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch races');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (race = null) => {
    if (race) {
      setEditingRace(race);
      setFormData({
        name: race.name || '',
        raceDatetime: race.raceDatetime ? new Date(race.raceDatetime) : null,
        roundOrder: race.roundOrder || '',
        isFinal: race.isFinal || false,
        maxEntries: race.maxEntries || '',
        qualifyCount: race.qualifyCount || '',
        distance: race.distance || ''
      });
    } else {
      setEditingRace(null);
      setFormData({ 
        name: '', 
        raceDatetime: null, 
        roundOrder: '', 
        isFinal: false, 
        maxEntries: '', 
        qualifyCount: '',
        distance: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRace(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        raceDatetime: formData.raceDatetime ? format(formData.raceDatetime, "yyyy-MM-dd'T'HH:mm:ss") : null,
        roundOrder: formData.roundOrder ? parseInt(formData.roundOrder) : null,
        isFinal: formData.isFinal,
        maxEntries: formData.maxEntries ? parseInt(formData.maxEntries) : null,
        qualifyCount: formData.qualifyCount ? parseInt(formData.qualifyCount) : null,
        distance: formData.distance ? parseInt(formData.distance) : null
      };

      if (editingRace) {
        await updateRace(tournament.id, editingRace.id, payload);
      } else {
        await createRace(tournament.id, payload);
      }
      await fetchRaces();
      handleCloseModal();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this race?')) return;
    try {
      await deleteRace(tournament.id, id);
      await fetchRaces();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Are you sure you want to activate this race? It requires referees and valid standards.')) return;
    try {
      await activateRace(tournament.id, id);
      await fetchRaces();
    } catch (err) {
      alert(err.message || 'Failed to activate race');
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
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface">Race Management</h2>
            <p className="font-body-lg text-body-lg text-primary font-bold mt-unit">{tournament.name}</p>
          </div>
        </div>
        <div className="flex gap-stack-sm">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Race
          </motion.button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={itemVariants} className="p-4 bg-error-container text-on-error-container rounded-lg font-interactive-md flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </motion.div>
      )}

      {/* Main Table */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">Races in Tournament</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading races...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">ID</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Race Name</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Date & Time</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Round</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Type</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Status</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Distance</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {races.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-on-surface-variant font-interactive-md">
                      No races found for this tournament. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  races.map((race, i) => (
                    <motion.tr 
                      key={race.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-default group"
                    >
                      <td className="py-stack-sm px-stack-md text-on-surface-variant">#{race.id}</td>
                      <td className="py-stack-sm px-stack-md font-interactive-md">{race.name}</td>
                      <td className="py-stack-sm px-stack-md">{new Date(race.raceDatetime).toLocaleString()}</td>
                      <td className="py-stack-sm px-stack-md">Round {race.roundOrder}</td>
                      <td className="py-stack-sm px-stack-md">
                        {race.isFinal ? (
                          <span className="text-tertiary font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">emoji_events</span> Final
                          </span>
                        ) : 'Qualifier'}
                      </td>
                      <td className="py-stack-sm px-stack-md">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-interactive-md capitalize
                          ${race.status === 'SCHEDULED' || race.status === 'scheduled' ? 'bg-primary/20 text-primary' : 
                            race.status === 'CHECKING' || race.status === 'checking' ? 'bg-secondary/20 text-secondary' : 
                            'bg-surface-container border border-outline-variant'}`}
                        >
                          {race.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-stack-sm px-stack-md">{race.distance ? `${race.distance}m` : '-'}</td>
                      <td className="py-stack-sm px-stack-md text-right">
                        <div className="flex justify-end gap-2">
                          {(race.status === 'SCHEDULED' || race.status === 'scheduled') && (
                            <button 
                              onClick={() => handleActivate(race.id)}
                              className="p-2 text-secondary hover:text-on-secondary hover:bg-secondary rounded-full transition-colors cursor-pointer"
                              title="Activate Race"
                            >
                              <span className="material-symbols-outlined text-[18px]">play_circle</span>
                            </button>
                          )}
                          <button 
                            onClick={() => setAssigningRace(race)}
                            className="p-2 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-full transition-colors cursor-pointer"
                            title="Assign Referees"
                          >
                            <span className="material-symbols-outlined text-[18px]">group_add</span>
                          </button>
                          <button 
                            onClick={() => handleOpenModal(race)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(race.id)}
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
              <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant w-full max-w-lg pointer-events-auto overflow-hidden flex flex-col max-h-full">
                <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {editingRace ? 'Edit Race' : 'New Race'}
                  </h3>
                  <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-stack-md flex-grow overflow-y-auto space-y-4">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Race Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="e.g. Qualifier Heat 1"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Race Date & Time *</label>
                    <DatePicker 
                      selected={formData.raceDatetime} 
                      onChange={(date) => setFormData(prev => ({...prev, raceDatetime: date}))} 
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy h:mm aa"
                      placeholderText="Select date and time"
                      className="custom-datepicker-input"
                      required
                      wrapperClassName="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Round Order *</label>
                      <input 
                        type="number" 
                        name="roundOrder"
                        value={formData.roundOrder}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Distance (meters) *</label>
                      <input 
                        type="number" 
                        name="distance"
                        value={formData.distance}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="1600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Max Entries</label>
                      <input 
                        type="number" 
                        name="maxEntries"
                        value={formData.maxEntries}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Qualify Count</label>
                      <input 
                        type="number" 
                        name="qualifyCount"
                        value={formData.qualifyCount}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="3"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      id="isFinal"
                      name="isFinal"
                      checked={formData.isFinal}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <label htmlFor="isFinal" className="font-interactive-md text-on-surface cursor-pointer select-none">
                      This is a Final Round Race
                    </label>
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
                      {editingRace ? 'Save Changes' : 'Create Race'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assigningRace && (
          <RefereeAssignmentModal 
            race={assigningRace} 
            onClose={() => setAssigningRace(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
