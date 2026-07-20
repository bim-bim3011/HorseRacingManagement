import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_ROLES = [
  { id: 1, name: 'ROLE_ADMIN', label: 'Admin' },
  { id: 2, name: 'ROLE_GENERAL', label: 'General / Spectator' },
  { id: 3, name: 'ROLE_JOCKEY', label: 'Jockey' },
  { id: 4, name: 'ROLE_HORSE_OWNER', label: 'Horse Owner' },
  { id: 5, name: 'ROLE_REFEREE', label: 'Referee' },
];

export default function UserRoleAssignmentModal({ isOpen, onClose, user, onSave }) {
  const [selectedRoleIds, setSelectedRoleIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && user.roles) {
      const ids = user.roles.map(roleName => {
        const found = AVAILABLE_ROLES.find(r => r.name === roleName);
        return found ? found.id : null;
      }).filter(Boolean);
      setSelectedRoleIds(new Set(ids));
    } else {
      setSelectedRoleIds(new Set());
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleToggleRole = (id) => {
    const newSet = new Set(selectedRoleIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRoleIds(newSet);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(user.id, Array.from(selectedRoleIds));
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-surface rounded-2xl border border-outline-variant shadow-lg w-full max-w-md overflow-hidden"
          >
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-display text-xl font-bold text-on-surface">Assign Roles</h3>
              <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center p-1 rounded-full hover:bg-error-container">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-stack-md">
              <p className="font-body text-sm text-on-surface-variant mb-4">
                Select roles for <span className="font-bold text-on-surface">{user?.username}</span>:
              </p>
              
              <div className="flex flex-col gap-2">
                {AVAILABLE_ROLES.map(role => {
                  const isSelected = selectedRoleIds.has(role.id);
                  return (
                    <label 
                      key={role.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-lowest'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-primary border-primary' : 'border-on-surface-variant'
                      }`}>
                        {isSelected && <span className="material-symbols-outlined text-[14px] text-surface font-bold">check</span>}
                      </div>
                      <span className={`font-interactive text-interactive ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {role.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <button 
                onClick={onClose} 
                className="px-4 py-2 font-interactive text-interactive text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-4 py-2 bg-primary text-on-primary font-interactive text-interactive rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2 shadow-sm"
                disabled={isSaving}
              >
                {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {isSaving ? 'Saving...' : 'Save Roles'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
