import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { placeBet } from '../../api/betApi';

export default function BettingModal({ 
  isOpen, 
  onClose, 
  selectedBet, 
  walletBalance, 
  onBetSuccess 
}) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens with new selection
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen, selectedBet]);

  if (!selectedBet) return null;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const addAmount = (value) => {
    const current = amount ? parseInt(amount, 10) : 0;
    setAmount((current + value).toString());
    setError('');
  };

  const setMaxAmount = () => {
    setAmount(Math.floor(walletBalance).toString());
    setError('');
  };

  const handlePlaceBet = async () => {
    const betAmount = parseInt(amount, 10);
    
    if (!betAmount || betAmount < 1000) {
      setError('Minimum bet amount is 1,000');
      return;
    }

    if (betAmount > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const request = {
        entryId: selectedBet.entry.id,
        betType: selectedBet.betType,
        amount: betAmount
      };
      
      const response = await placeBet(request);
      onBetSuccess(response);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const numAmount = parseInt(amount, 10) || 0;
  const potentialPayout = numAmount * selectedBet.odds;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-50 bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-outline-variant flex flex-col top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-surface-container-high p-6 border-b border-outline-variant relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/20">
                  {selectedBet.betType} BET
                </span>
                <span className="text-on-surface-variant text-sm font-medium">Odds: <strong className="text-primary">{selectedBet.odds.toFixed(2)}</strong></span>
              </div>
              
              <h2 className="text-2xl font-display font-bold text-on-surface uppercase truncate">
                {selectedBet.entry.horseName || 'Horse'}
              </h2>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">person</span>
                {selectedBet.entry.jockeyName || 'Jockey'}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-on-surface-variant font-medium text-sm">Wallet Balance</span>
                <span className="text-on-surface font-bold text-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                  ${walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Bet Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">$</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full bg-surface-container text-on-surface pl-10 pr-4 py-4 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xl font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => addAmount(1000)} className="py-2 bg-surface-container hover:bg-surface-variant rounded-lg text-sm font-bold text-on-surface border border-outline-variant transition-colors">+1K</button>
                  <button onClick={() => addAmount(5000)} className="py-2 bg-surface-container hover:bg-surface-variant rounded-lg text-sm font-bold text-on-surface border border-outline-variant transition-colors">+5K</button>
                  <button onClick={() => addAmount(10000)} className="py-2 bg-surface-container hover:bg-surface-variant rounded-lg text-sm font-bold text-on-surface border border-outline-variant transition-colors">+10K</button>
                  <button onClick={setMaxAmount} className="py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-bold text-primary border border-primary/20 transition-colors">ALL IN</button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-error/10 text-error rounded-lg flex items-start gap-2 text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </motion.div>
                )}

                <div className="mt-8 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-on-surface-variant">Potential Payout</span>
                    <span className="text-on-surface font-bold">Odds x{selectedBet.odds.toFixed(2)}</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-green-500">
                    ${potentialPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant">
              <button
                onClick={handlePlaceBet}
                disabled={isSubmitting || !amount || parseInt(amount) < 1000}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/30 hover:bg-on-primary-fixed-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'CONFIRM BET'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
