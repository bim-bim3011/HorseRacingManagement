import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BankSelect from './BankSelect';

export default function WithdrawalModal({ isOpen, onClose, userBalance, onSubmit }) {
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
      setError('');
      setFieldErrors({});
      setFormData({
        amount: '',
        bankName: '',
        bankAccount: '',
        accountHolder: '',
      });
    }
  }, [isOpen]);

  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const response = await fetch('https://api.vietqr.io/v2/banks');
      const data = await response.json();
      if (data.code === '00') {
        setBanks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'accountHolder') {
      // Auto uppercase account holder
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [e.target.name]: value });
    // Clear error for the field being typed
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const removeVietnameseTones = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    let errors = {};
    
    if (!formData.bankName) {
      errors.bankName = 'Please select a bank.';
    }
    
    if (!formData.bankAccount) {
      errors.bankAccount = 'Please enter an account number.';
    } else if (!/^\d+$/.test(formData.bankAccount)) {
      errors.bankAccount = 'Account number must contain only digits.';
    } else if (formData.bankAccount.length < 5 || formData.bankAccount.length > 20) {
      errors.bankAccount = 'Account number must be between 5 and 20 digits.';
    }
    
    if (!formData.accountHolder) {
      errors.accountHolder = 'Please enter the account holder name.';
    } else {
      const normalizedName = removeVietnameseTones(formData.accountHolder);
      if (!/^[A-Z\s]+$/.test(normalizedName)) {
        errors.accountHolder = 'Account holder name must not contain numbers or special characters.';
      }
    }
    
    if (!formData.amount) {
      errors.amount = 'Please enter an amount.';
    } else if (formData.amount < 10000) {
      errors.amount = 'Minimum withdrawal amount is 10,000 VNĐ.';
    } else if (formData.amount > userBalance) {
      errors.amount = 'Withdrawal amount cannot exceed your wallet balance.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-6 border-b border-outline-variant shrink-0">
            <h2 className="font-display text-xl font-bold text-on-surface">Withdraw Funds</h2>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center p-1 rounded-full hover:bg-error-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-body flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex flex-col items-center mb-2">
              <span className="font-body text-xs text-on-surface-variant uppercase tracking-wider mb-1">Available Balance</span>
              <span className="font-display text-2xl font-bold text-primary">
                {userBalance != null ? userBalance.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Bank Name
              </label>
              <BankSelect 
                banks={banks}
                value={formData.bankName}
                onChange={(bin) => {
                  setFormData({ ...formData, bankName: bin });
                  if (fieldErrors.bankName) {
                    setFieldErrors({ ...fieldErrors, bankName: null });
                  }
                }}
                disabled={loadingBanks}
                error={!!fieldErrors.bankName}
              />
              {loadingBanks && <p className="text-xs text-on-surface-variant mt-1">Loading banks...</p>}
              {fieldErrors.bankName && <p className="text-error text-xs mt-1">{fieldErrors.bankName}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Account Number
              </label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="e.g. 1903..."
                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors bg-surface ${fieldErrors.bankAccount ? 'border-error focus:border-error focus:ring-1 focus:ring-error text-error' : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
              />
              {fieldErrors.bankAccount && <p className="text-error text-xs mt-1">{fieldErrors.bankAccount}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                placeholder="e.g. NGUYEN VAN A"
                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors bg-surface uppercase ${fieldErrors.accountHolder ? 'border-error focus:border-error focus:ring-1 focus:ring-error text-error' : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
              />
              {fieldErrors.accountHolder && <p className="text-error text-xs mt-1">{fieldErrors.accountHolder}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Amount (VNĐ)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 50000"
                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors bg-surface ${fieldErrors.amount ? 'border-error focus:border-error focus:ring-1 focus:ring-error text-error' : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
              />
              {fieldErrors.amount && <p className="text-error text-xs mt-1">{fieldErrors.amount}</p>}
            </div>

            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-interactive-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 font-interactive-md text-on-primary bg-primary hover:bg-on-primary-fixed-variant rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
