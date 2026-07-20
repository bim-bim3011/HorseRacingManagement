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
  const [paymentMethod, setPaymentMethod] = useState('PAYOS'); // Default to PayOS
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

    if (!numericAmount || numericAmount < 5000) {
      setError('Minimum deposit amount is 5,000 VNĐ');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (paymentMethod === 'VNPAY') {
        const response = await fetch(`/api/payment/vn-pay?amount=${numericAmount}&bankCode=NCB`, {
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
          throw new Error('Could not generate VNPAY payment URL');
        }
      } else if (paymentMethod === 'PAYOS') {
        const response = await fetch(`/api/payment/payos/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount: numericAmount })
        });

        const result = await response.json();

        if (result && result.result && result.result.checkoutUrl) {
          // Redirect to PayOS
          window.location.href = result.result.checkoutUrl;
        } else {
          throw new Error('Could not generate PayOS payment URL');
        }
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
        className="max-w-4xl lg:max-w-5xl w-full"
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
                  className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3 overflow-hidden mb-6"
                >
                  <span className="material-symbols-outlined">error</span>
                  <p className="font-body text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Amounts */}
              <div className="space-y-8">
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
              </div>

              {/* Right Column: Payment Methods & Submit */}
              <div className="space-y-8 flex flex-col justify-between">
                {/* Payment Method */}
                <div>
                  <label className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 block transition-colors duration-300">
                    Payment Method
                  </label>

                  <div className="flex flex-col gap-4">
                    {/* PayOS Option */}
                    <div
                      onClick={() => setPaymentMethod('PAYOS')}
                      className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-md relative overflow-hidden ${paymentMethod === 'PAYOS'
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]'
                          : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50'
                        }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-[#00c06f]/10 rounded-xl flex items-center justify-center p-2 transition-transform duration-300 hover:scale-110 border border-[#00c06f]/20">
                          <span className="material-symbols-outlined text-3xl text-[#00c06f]">qr_code_scanner</span>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-on-surface text-lg">PayOS Gateway</h4>
                          <p className="font-body text-sm text-on-surface-variant">Quét mã QR cực nhanh</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${paymentMethod === 'PAYOS' ? 'bg-primary' : 'bg-surface-container-high border border-outline'}`}>
                        {paymentMethod === 'PAYOS' && <motion.div layoutId="radio-dot" className="w-2.5 h-2.5 rounded-full bg-on-primary"></motion.div>}
                      </div>
                      {paymentMethod === 'PAYOS' && (
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                    </div>

                    {/* VNPAY Option */}
                    <div
                      onClick={() => setPaymentMethod('VNPAY')}
                      className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-md relative overflow-hidden ${paymentMethod === 'VNPAY'
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.02]'
                          : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50'
                        }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-[#005b9f]/10 rounded-xl flex items-center justify-center p-2 transition-transform duration-300 hover:scale-110 border border-[#005b9f]/20">
                          <span className="material-symbols-outlined text-3xl text-[#005b9f]">account_balance</span>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-on-surface text-lg">VNPAY Gateway</h4>
                          <p className="font-body text-sm text-on-surface-variant">Thẻ ATM, Visa, MasterCard</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${paymentMethod === 'VNPAY' ? 'bg-primary' : 'bg-surface-container-high border border-outline'}`}>
                        {paymentMethod === 'VNPAY' && <motion.div layoutId="radio-dot" className="w-2.5 h-2.5 rounded-full bg-on-primary"></motion.div>}
                      </div>
                      {paymentMethod === 'VNPAY' && (
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none transition-opacity duration-300"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
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
                  <p className="text-center font-body text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1 transition-all duration-300">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Secured by <span className="font-bold">{paymentMethod === 'PAYOS' ? 'PayOS Payment Gateway' : 'VNPAY Sandbox Environment'}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
