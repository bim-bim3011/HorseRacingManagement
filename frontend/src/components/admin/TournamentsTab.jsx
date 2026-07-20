import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllTournaments, 
  createTournament, 
  updateTournament, 
  deleteTournament 
} from '../../api/tournamentApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

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

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '50%' : '-50%',
    opacity: 0,
    position: 'absolute',
    width: '100%'
  }),
  center: {
    x: 0,
    opacity: 1,
    position: 'relative',
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: (direction) => ({
    x: direction < 0 ? '50%' : '-50%',
    opacity: 0,
    position: 'absolute',
    width: '100%',
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  })
};

export default function TournamentsTab({ onManage }) {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: null,
    endDate: null,
    registrationStart: null,
    registrationEnd: null,
    prizePool: '',
    registrationFee: '',
    maxParticipants: '',
    weightLimit: '',
    minHorseAge: '',
    maxHorseAge: '',
    allowedBreed: '',
    regulations: ''
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    // Validate current step fields before moving next
    const form = document.getElementById('tournament-form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTournaments();
      setTournaments(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (tournament = null) => {
    if (tournament) {
      setEditingTournament(tournament);
      setFormData({
        name: tournament.name || '',
        startDate: tournament.startDate ? new Date(tournament.startDate) : null,
        endDate: tournament.endDate ? new Date(tournament.endDate) : null,
        registrationStart: tournament.registrationStart ? new Date(tournament.registrationStart) : null,
        registrationEnd: tournament.registrationEnd ? new Date(tournament.registrationEnd) : null,
        prizePool: tournament.prizePool || '',
        registrationFee: tournament.registrationFee || '',
        maxParticipants: tournament.maxParticipants || '',
        weightLimit: tournament.weightLimit || '',
        minHorseAge: tournament.minHorseAge || '',
        maxHorseAge: tournament.maxHorseAge || '',
        allowedBreed: tournament.allowedBreed || '',
        regulations: tournament.regulations || ''
      });
    } else {
      setEditingTournament(null);
      setFormData({ 
        name: '', startDate: null, endDate: null, 
        registrationStart: null, registrationEnd: null, prizePool: '',
        registrationFee: '', maxParticipants: '',
        weightLimit: '', minHorseAge: '', maxHorseAge: '', allowedBreed: '',
        regulations: '' 
      });
    }
    setBannerFile(null);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTournament(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          if (formData[key] instanceof Date) {
            submitData.append(key, format(formData[key], 'yyyy-MM-dd'));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      if (bannerFile) {
        submitData.append('banner', bannerFile);
      }

      if (editingTournament) {
        await updateTournament(editingTournament.id, submitData);
      } else {
        await createTournament(submitData);
      }
      await fetchTournaments();
      handleCloseModal();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await deleteTournament(id);
      await fetchTournaments();
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
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-end border-b border-outline-variant pb-stack-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Tournament Scheduling</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-unit">Manage all racing tournaments, schedules, and regulations.</p>
        </div>
        <div className="flex gap-stack-sm">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-unit px-4 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Tournament
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
          <h3 className="font-headline-md text-headline-md text-on-surface">All Tournaments</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="mt-2 font-interactive-md">Loading tournaments...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">ID</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Name</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Start Date</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">End Date</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps">Status</th>
                  <th className="py-stack-sm px-stack-md font-label-caps text-label-caps text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-on-surface-variant font-interactive-md">
                      No tournaments found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  tournaments.map((tournament, i) => (
                    <motion.tr 
                      key={tournament.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-default group"
                    >
                      <td className="py-stack-sm px-stack-md text-on-surface-variant">#{tournament.id}</td>
                      <td className="py-stack-sm px-stack-md font-interactive-md">{tournament.name}</td>
                      <td className="py-stack-sm px-stack-md">{tournament.startDate}</td>
                      <td className="py-stack-sm px-stack-md">{tournament.endDate}</td>
                      <td className="py-stack-sm px-stack-md">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-interactive-md 
                          ${tournament.status === 'UPCOMING' ? 'bg-primary-fixed text-on-primary-fixed' : 
                            tournament.status === 'ONGOING' ? 'bg-error-container text-on-error-container' : 
                            'bg-surface-container border border-outline-variant'}`}
                        >
                          {tournament.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-stack-sm px-stack-md text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => onManage(tournament)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-colors font-interactive-md text-sm cursor-pointer border border-primary/20"
                            title="Manage Tournament"
                          >
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            Manage
                          </button>
                          <button 
                            onClick={() => handleDelete(tournament.id)}
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
              <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant w-full max-w-2xl pointer-events-auto overflow-hidden flex flex-col max-h-full">
                <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {editingTournament ? 'Edit Tournament' : 'New Tournament'}
                  </h3>
                  <button onClick={handleCloseModal} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                {/* Stepper Header */}
                <div className="bg-surface-container-lowest px-stack-md py-4 border-b border-outline-variant">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-outline-variant/30 z-0"></div>
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500 ease-in-out"
                      style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    ></div>

                    {[
                      { id: 1, label: 'General Info' },
                      { id: 2, label: 'Registration' },
                      { id: 3, label: 'Rules' }
                    ].map((step) => (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                          currentStep >= step.id 
                            ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                            : 'bg-surface-variant text-on-surface-variant border border-outline-variant'
                        }`}>
                          {currentStep > step.id ? (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          ) : (
                            step.id
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${currentStep >= step.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <form id="tournament-form" onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                  <div className="relative flex-grow overflow-x-hidden overflow-y-auto p-stack-md min-h-[350px]">
                    <AnimatePresence mode="wait" custom={direction}>
                      
                      {/* STEP 1: General Info */}
                      {currentStep === 1 && (
                        <motion.div
                          key="step1"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div>
                            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Tournament Name *</label>
                            <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                              placeholder="e.g. Royal Ascot 2026"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Start Date *</label>
                              <DatePicker 
                                selected={formData.startDate} 
                                onChange={(date) => setFormData(prev => ({...prev, startDate: date}))} 
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select start date"
                                className="custom-datepicker-input"
                                required
                                wrapperClassName="w-full"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">End Date *</label>
                              <DatePicker 
                                selected={formData.endDate} 
                                onChange={(date) => setFormData(prev => ({...prev, endDate: date}))} 
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select end date"
                                className="custom-datepicker-input"
                                minDate={formData.startDate}
                                required
                                wrapperClassName="w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Banner Image</label>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2: Registration & Prizes */}
                      {currentStep === 2 && (
                        <motion.div
                          key="step2"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Registration Start</label>
                              <DatePicker 
                                selected={formData.registrationStart} 
                                onChange={(date) => setFormData(prev => ({...prev, registrationStart: date}))} 
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select date"
                                className="custom-datepicker-input"
                                wrapperClassName="w-full"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Registration End</label>
                              <DatePicker 
                                selected={formData.registrationEnd} 
                                onChange={(date) => setFormData(prev => ({...prev, registrationEnd: date}))} 
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select date"
                                className="custom-datepicker-input"
                                minDate={formData.registrationStart}
                                wrapperClassName="w-full"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Registration Fee *</label>
                              <input 
                                type="number" 
                                name="registrationFee"
                                value={formData.registrationFee}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="e.g. 500"
                              />
                            </div>
                            <div>
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Max Participants *</label>
                              <input 
                                type="number" 
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="e.g. 100"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Prize Pool</label>
                            <input 
                              type="number" 
                              name="prizePool"
                              value={formData.prizePool}
                              onChange={handleInputChange}
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                              placeholder="e.g. 50000"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 3: Rules & Limitations */}
                      {currentStep === 3 && (
                        <motion.div
                          key="step3"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Weight Limit (kg) *</label>
                              <input 
                                type="number" 
                                name="weightLimit"
                                value={formData.weightLimit}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Allowed Breed *</label>
                              <select 
                                name="allowedBreed"
                                value={formData.allowedBreed}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 ease-in-out cursor-pointer"
                              >
                                <option value="" disabled>Select a breed</option>
                                <option value="Thoroughbred">Thoroughbred</option>
                                <option value="Quarter Horse">Quarter Horse</option>
                                <option value="Standardbred">Standardbred</option>
                                <option value="Arabian">Arabian</option>
                                <option value="Appaloosa">Appaloosa</option>
                                <option value="Paint">Paint</option>
                                <option value="Any">Any (All breeds allowed)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Min Horse Age *</label>
                              <input 
                                type="number" 
                                name="minHorseAge"
                                value={formData.minHorseAge}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Max Horse Age *</label>
                              <input 
                                type="number" 
                                name="maxHorseAge"
                                value={formData.maxHorseAge}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Regulations</label>
                            <textarea 
                              name="regulations"
                              value={formData.regulations}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
                              placeholder="Enter tournament rules and regulations..."
                            ></textarea>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="px-stack-md py-4 flex justify-between bg-surface-container-low border-t border-outline-variant">
                    <button 
                      type="button" 
                      onClick={currentStep === 1 ? handleCloseModal : prevStep}
                      className="px-4 py-2 font-interactive-md text-interactive-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer border border-outline-variant/50"
                    >
                      {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                    
                    {currentStep < 3 ? (
                      <button 
                        type="button" 
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer"
                      >
                        Next
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-interactive-md text-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                        {editingTournament ? 'Save Changes' : 'Create Tournament'}
                      </button>
                    )}
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
