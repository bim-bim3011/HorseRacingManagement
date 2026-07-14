import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BankSelect({ banks, value, onChange, disabled, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedBank = banks.find((b) => b.bin === value) || null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredBanks = banks.filter((bank) => {
    const search = searchTerm.toLowerCase();
    return (
      (bank.shortName && bank.shortName.toLowerCase().includes(search)) ||
      (bank.name && bank.name.toLowerCase().includes(search)) ||
      (bank.bin && bank.bin.includes(search))
    );
  });

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Selected Value / Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between font-body text-body-md px-4 py-3 rounded-xl border transition-colors bg-surface text-left cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed border-outline-variant text-on-surface-variant' : 
            error ? 'border-error focus:border-error focus:ring-1 focus:ring-error text-error' : 
            'border-outline hover:border-primary text-on-surface focus:border-primary focus:ring-1 focus:ring-primary'}
        `}
      >
        {selectedBank ? (
          <div className="flex items-center gap-3">
            <img 
              src={selectedBank.logo} 
              alt={selectedBank.shortName} 
              className="w-8 h-8 object-contain bg-white rounded-md p-1 border border-outline-variant"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=Bank' }}
            />
            <div className="flex flex-col">
              <span className="font-bold leading-tight">{selectedBank.shortName}</span>
              <span className="text-xs text-on-surface-variant leading-tight truncate max-w-[200px]">{selectedBank.name}</span>
            </div>
          </div>
        ) : (
          <span className="text-on-surface-variant">-- Select Bank --</span>
        )}
        <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden flex flex-col"
            style={{ maxHeight: '300px' }}
          >
            <div className="p-2 border-b border-outline-variant sticky top-0 bg-surface">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by name, short name or BIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {filteredBanks.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">
                  No banks found.
                </div>
              ) : (
                <ul className="py-1">
                  {filteredBanks.map((bank) => (
                    <li key={bank.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(bank.bin);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/5 transition-colors text-left cursor-pointer
                          ${value === bank.bin ? 'bg-primary/10' : ''}
                        `}
                      >
                        <img 
                          src={bank.logo} 
                          alt={bank.shortName} 
                          className="w-8 h-8 object-contain bg-white rounded-md p-1 border border-outline-variant shrink-0"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=Bank' }}
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-sm leading-tight truncate ${value === bank.bin ? 'font-bold text-primary' : 'font-bold text-on-surface'}`}>
                            {bank.shortName}
                          </span>
                          <span className="text-xs text-on-surface-variant leading-tight truncate">
                            {bank.name}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
