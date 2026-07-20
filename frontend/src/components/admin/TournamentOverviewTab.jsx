import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { updateTournament } from '../../api/tournamentApi';

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function TournamentOverviewTab({ tournament, onTournamentUpdated }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
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


  useEffect(() => {
    if (!isEditMode) {
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
    }
  }, [tournament, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
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
      // Not handling banner change in inline edit to keep it simple, 
      // but can be added later if needed.

      await updateTournament(tournament.id, submitData);
      if (onTournamentUpdated) {
        await onTournamentUpdated();
      }
      setIsEditMode(false);
    } catch (err) {
      alert(err.message || 'Failed to update tournament');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original tournament data
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
    setIsEditMode(false);
  };

  // Helper for timeline
  const getTimelineStep = () => {
    const status = tournament.status?.toUpperCase() || 'UNKNOWN';
    if (status === 'FINISHED') return 4;
    if (status === 'ONGOING') return 3;
    if (status === 'UPCOMING') return 2;
    return 1; // Draft or default
  };
  const currentStep = getTimelineStep();

  return (
    <div className="relative min-h-[500px]">
      {/* Edit Toggle Button - Only visible in View Mode */}
      <AnimatePresence>
        {!isEditMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-0 right-0 z-10"
          >
            <button 
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg transition-colors shadow-sm font-interactive-md border border-outline-variant hover:border-primary/50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Tournament
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isEditMode ? (
          // ================= VIEW MODE =================
          <motion.div 
            key="view-mode"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6 pt-2"
          >
            {/* Timeline Stepper */}
            <div className="p-6 border border-outline-variant rounded-xl bg-surface">
              <h3 className="font-headline-md text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">linear_scale</span>
                Tournament Lifecycle
              </h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container-high -z-10"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-1000 -z-10" 
                  style={{ width: `${(currentStep - 1) * 33.33}%` }}
                ></div>
                
                {['Draft/Created', 'Upcoming', 'Ongoing (Racing)', 'Finished'].map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber <= currentStep;
                  const isCurrent = stepNumber === currentStep;
                  
                  return (
                    <div key={label} className="flex flex-col items-center gap-2 bg-surface px-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-500 ${
                        isActive 
                          ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                          : 'bg-surface-container-high text-on-surface-variant'
                      } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                        {isActive ? <span className="material-symbols-outlined text-[20px]">check</span> : stepNumber}
                      </div>
                      <span className={`font-interactive-md text-sm ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tournament Details Widget */}
              <div className="p-6 border border-outline-variant rounded-xl bg-surface hover:shadow-md transition-shadow">
                <h3 className="font-headline-md text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Core Details
                </h3>
                <ul className="space-y-3 font-body text-on-surface-variant">
                  <li className="flex justify-between border-b border-outline-variant pb-2">
                    <span>Prize Pool:</span>
                    <span className="font-bold text-tertiary text-lg">${tournament.prizePool?.toLocaleString() || 0}</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant pb-2">
                    <span>Registration Fee:</span>
                    <span className="font-bold text-on-surface">${tournament.registrationFee?.toLocaleString() || 0}</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant pb-2">
                    <span>Registration Period:</span>
                    <span className="font-bold text-on-surface">{tournament.registrationStart || '-'} to {tournament.registrationEnd || '-'}</span>
                  </li>
                </ul>
              </div>

              {/* Entry Requirements Widget */}
              <div className="p-6 border border-outline-variant rounded-xl bg-surface hover:shadow-md transition-shadow">
                <h3 className="font-headline-md text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">rule</span>
                  Entry Requirements
                </h3>
                <ul className="space-y-3 font-body text-on-surface-variant">
                  <li className="flex justify-between border-b border-outline-variant pb-2">
                    <span>Age Limit:</span>
                    <span className="font-bold text-on-surface">{tournament.minHorseAge} - {tournament.maxHorseAge} years</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant pb-2">
                    <span>Weight Limit:</span>
                    <span className="font-bold text-on-surface">Max {tournament.weightLimit} kg</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant pb-2">
                    <span>Allowed Breed:</span>
                    <span className="font-bold text-on-surface uppercase bg-surface-container px-2 py-0.5 rounded text-sm">{tournament.allowedBreed}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Regulations Document View */}
            <div className="p-6 border border-outline-variant rounded-xl bg-surface">
              <h3 className="font-headline-md text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Official Regulations
              </h3>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {tournament.regulations ? (
                  <div className="prose prose-sm max-w-none text-on-surface font-body whitespace-pre-wrap">
                    {tournament.regulations}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 py-8">
                    <span className="material-symbols-outlined text-[48px] mb-2">article</span>
                    <p className="font-interactive-md">No regulations provided for this tournament.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          // ================= EDIT MODE =================
          <motion.div 
            key="edit-mode"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface rounded-xl border border-primary/30 p-6 shadow-lg shadow-primary/5"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">edit_square</span>
              </div>
              <div>
                <h2 className="font-headline-lg text-on-surface">Editing Tournament</h2>
                <p className="text-on-surface-variant text-sm">Update tournament settings directly. Changes will apply immediately.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Tournament Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Start Date *</label>
                  <DatePicker 
                    selected={formData.startDate} 
                    onChange={(date) => setFormData(prev => ({...prev, startDate: date}))} 
                    dateFormat="dd/MM/yyyy"
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
                    className="custom-datepicker-input"
                    minDate={formData.startDate}
                    required
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Registration Start</label>
                  <DatePicker 
                    selected={formData.registrationStart} 
                    onChange={(date) => setFormData(prev => ({...prev, registrationStart: date}))} 
                    dateFormat="dd/MM/yyyy"
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
                    className="custom-datepicker-input"
                    minDate={formData.registrationStart}
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Prize Pool</label>
                  <input 
                    type="number" 
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Registration Fee *</label>
                  <input 
                    type="number" 
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Weight Limit (kg) *</label>
                  <input 
                    type="number" 
                    name="weightLimit"
                    value={formData.weightLimit}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Min Age *</label>
                  <input 
                    type="number" 
                    name="minHorseAge"
                    value={formData.minHorseAge}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Max Age *</label>
                  <input 
                    type="number" 
                    name="maxHorseAge"
                    value={formData.maxHorseAge}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Allowed Breed *</label>
                  <select 
                    name="allowedBreed"
                    value={formData.allowedBreed}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 font-interactive-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
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

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Regulations</label>
                <textarea 
                  name="regulations"
                  value={formData.regulations}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y custom-scrollbar"
                  placeholder="Enter tournament rules and regulations..."
                ></textarea>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-6 py-2.5 font-interactive-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-interactive-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md shadow-primary/20 hover:shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
