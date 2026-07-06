import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const handleQuickSelect = (value) => {
    setSelectedQuickAmount(value);
    setAmount(value.toString());
    setError('');
  };

  const handleCustomInput = (e) => {
    // Remove non-numeric characters for raw value
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmount(rawValue);

    // Check if the custom value matches any quick amount to highlight it
    const numValue = parseInt(rawValue, 10);
    if (QUICK_AMOUNTS.includes(numValue)) {
      setSelectedQuickAmount(numValue);
    } else {
      setSelectedQuickAmount(null);
    }

    if (error) setError('');
  };

  const handleSubmit = async () => {
    const numericAmount = parseInt(amount, 10);

    if (!numericAmount || numericAmount < 10000) {
      setError('Minimum deposit amount is 10,000 VNĐ');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // In a real scenario, this would call your paymentApi
      // Example: const response = await createVNPayPayment(numericAmount);
      // For now, we simulate the fetch call based on standard implementation

      const response = await fetch(`http://localhost:8080/api/payment/vn-pay?amount=${numericAmount}&bankCode=NCB`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result && result.result && result.result.paymentUrl) {
        // Redirect to VNPay
        window.location.href = result.result.paymentUrl;
      } else {
        throw new Error('Could not generate payment URL');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Format number to currency style for display
  const formatCurrency = (val) => {
    if (!val) return '';
    return parseInt(val, 10).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full"
      >
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer mx-auto mb-4"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Wallet
          </button>
          <h1 className="font-display text-4xl font-bold text-on-surface">Deposit Funds</h1>
          <p className="text-on-surface-variant font-body mt-2">Add money to your wallet securely to continue racing.</p>
        </div>

        <div className="bg-surface/80 backdrop-blur-xl rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden">

          {/* Header Graphic */}
          <div className="h-32 bg-gradient-to-r from-primary to-primary-container relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-surface rounded-2xl shadow-lg flex items-center justify-center relative z-10"
            >
              <span className="material-symbols-outlined text-4xl text-primary">account_balance_wallet</span>
            </motion.div>
          </div>

          <div className="p-8 space-y-8">

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3 overflow-hidden"
                >
                  <span className="material-symbols-outlined">error</span>
                  <p className="font-body text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Amount Select */}
            <div>
              <label className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 block">
                Select Amount
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {QUICK_AMOUNTS.map((val) => (
                  <motion.button
                    key={val}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickSelect(val)}
                    className={`relative py-3 px-2 rounded-xl font-body font-bold text-sm transition-all duration-300 border cursor-pointer overflow-hidden ${selectedQuickAmount === val
                      ? 'bg-primary text-on-primary border-primary shadow-md'
                      : 'bg-surface-container-low text-on-surface border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-high'
                      }`}
                  >
                    {val.toLocaleString('vi-VN')} đ

                    {selectedQuickAmount === val && (
                      <motion.div
                        layoutId="activeAmountIndicator"
                        className="absolute inset-0 bg-white/20 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <label className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                Or enter custom amount
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formatCurrency(amount)}
                  onChange={handleCustomInput}
                  placeholder="0"
                  className="w-full font-display text-2xl md:text-3xl font-bold text-on-surface px-6 py-4 pl-16 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300"
                />
                <span className="absolute left-6 font-display text-2xl font-bold text-on-surface-variant">₫</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">
                Payment Method
              </label>
              <div className="border-2 border-primary bg-primary/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-md relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden p-2">
                    {/* Mock VNPAY Logo */}
                    <img src="https://vnpay.vn/s1/vnpay/logo.svg" alt="VNPAY" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-on-surface text-lg">VNPAY Gateway</h4>
                    <p className="font-body text-sm text-on-surface-variant">QR Code, ATM, Visa, MasterCard</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-on-primary"></div>
                </div>

                {/* Background decorative element */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !amount}
                className="w-full bg-primary text-on-primary py-4 rounded-2xl font-display font-bold text-xl hover:bg-on-primary-fixed-variant transition-all duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">security</span>
                    Pay {formatCurrency(amount) ? `${formatCurrency(amount)} ₫` : ''}
                  </>
                )}
              </motion.button>
              <p className="text-center font-body text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Secured by VNPAY Sandbox Environment
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
