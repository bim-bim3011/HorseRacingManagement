import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllWithdrawalRequests, approveWithdrawal, rejectWithdrawal, markWithdrawalAsTransferred } from '../../api/withdrawalApi';

export default function WithdrawalsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [banksList, setBanksList] = useState([]);
  
  // Custom modal states
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'APPROVE' | 'REJECT', id: number }
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchBanksList();
  }, []);

  const fetchBanksList = async () => {
    try {
      const response = await fetch('https://api.vietqr.io/v2/banks');
      const data = await response.json();
      if (data.code === '00') {
        setBanksList(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch banks:', err);
    }
  };

  const getBankDisplayName = (binCode) => {
    if (!banksList || banksList.length === 0) return binCode;
    const bank = banksList.find(b => b.bin === binCode);
    return bank ? bank.shortName : binCode;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllWithdrawalRequests();
      // Sort to show pending first, then newest
      const sorted = data.sort((a, b) => {
        const statusA = a.status.toUpperCase();
        const statusB = b.status.toUpperCase();
        if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
        if (statusB === 'PENDING' && statusA !== 'PENDING') return 1;
        return new Date(b.requestedAt) - new Date(a.requestedAt);
      });
      setRequests(sorted);
    } catch (err) {
      console.error(err);
      alert('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    setConfirmAction({ type: 'APPROVE', id });
    setAdminNote('Approved by admin');
  };

  const handleReject = (id) => {
    setConfirmAction({ type: 'REJECT', id });
    setAdminNote('');
  };

  const confirmProcessAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction.type === 'APPROVE') {
        await approveWithdrawal(confirmAction.id, { adminNote: adminNote || 'Approved by admin' });
      } else if (confirmAction.type === 'REJECT') {
        await rejectWithdrawal(confirmAction.id, { adminNote: adminNote || 'Rejected by admin' });
      }
      setConfirmAction(null);
      setAdminNote('');
      fetchRequests();
    } catch (err) {
      alert(err.message || `Failed to ${confirmAction.type.toLowerCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkTransferred = async (id) => {
    try {
      await markWithdrawalAsTransferred(id);
      setSelectedTransfer(null);
      fetchRequests();
      alert('Successfully marked as transferred!');
    } catch (err) {
      alert(err.message || 'Failed to mark as transferred');
    }
  };

  const generateVietQR = (request) => {
    const bankBinOrName = request.bankName; 
    const bankAccount = request.bankAccount;
    const template = 'compact2';
    
    const amount = request.amount;
    const addInfo = encodeURIComponent(`Rut tien ma ${request.id}`);
    const accountName = encodeURIComponent(request.accountHolder);

    return `https://img.vietqr.io/image/${bankBinOrName}-${bankAccount}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Withdrawal Approvals</h2>
          <p className="font-body text-on-surface-variant">Review user withdrawal requests and process payouts</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="flex items-center gap-2 bg-surface-container-high text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Refresh
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex-grow flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body">
            <thead className="bg-surface-container-low text-on-surface-variant text-sm border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-interactive-md">User</th>
                <th className="px-6 py-4 font-interactive-md">Amount</th>
                <th className="px-6 py-4 font-interactive-md">Bank Details</th>
                <th className="px-6 py-4 font-interactive-md">Requested Date</th>
                <th className="px-6 py-4 font-interactive-md">Status</th>
                <th className="px-6 py-4 font-interactive-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-on-surface-variant">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-on-surface-variant">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-interactive-md text-on-surface">
                      {request.username}
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {request.amount.toLocaleString()} VNĐ
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-bold text-on-surface">{getBankDisplayName(request.bankName)}</p>
                      <p className="text-on-surface-variant">{request.bankAccount}</p>
                      <p className="text-on-surface-variant uppercase text-xs">{request.accountHolder}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(request.requestedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status.toUpperCase() === 'PENDING' ? 'bg-secondary-container text-on-secondary-container' :
                        request.status.toUpperCase() === 'APPROVED' ? 'bg-primary-container text-on-primary-container' :
                        (request.status.toUpperCase() === 'COMPLETED' || request.status.toUpperCase() === 'TRANSFERRED') ? 'bg-green-100 text-green-800' :
                        'bg-error-container text-on-error-container'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {request.status.toUpperCase() === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(request.id)}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded-lg text-sm font-interactive-md transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(request.id)}
                            className="bg-error/10 text-error hover:bg-error hover:text-on-error px-3 py-1.5 rounded-lg text-sm font-interactive-md transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {request.status.toUpperCase() === 'APPROVED' && (
                        <button 
                          onClick={() => setSelectedTransfer(request)}
                          className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant px-4 py-1.5 rounded-lg text-sm font-interactive-md transition-colors shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                          Transfer Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {selectedTransfer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-outline-variant">
                <h2 className="font-display text-xl font-bold text-on-surface">Process Transfer</h2>
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="p-2 border border-outline-variant rounded-xl bg-white shadow-sm inline-block">
                    <img 
                      src={generateVietQR(selectedTransfer)} 
                      alt="VietQR Transfer" 
                      className="w-56 h-56 object-contain"
                      key={selectedTransfer.id} 
                    />
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Recipient</span>
                    <span className="font-bold text-on-surface uppercase">{selectedTransfer.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Bank</span>
                    <span className="font-bold text-on-surface">{getBankDisplayName(selectedTransfer.bankName)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Account Number</span>
                    <span className="font-bold text-on-surface">{selectedTransfer.bankAccount}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant pt-2 mt-2">
                    <span className="text-on-surface-variant">Amount</span>
                    <span className="font-bold text-primary text-lg">{selectedTransfer.amount.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant pt-1">
                    <span>Message</span>
                    <span>Rut tien ma {selectedTransfer.id}</span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant text-center mb-6">
                  Please open your banking app and scan the QR code above to transfer funds. 
                  Once the transfer is successful, click the button below.
                </p>

                <button 
                  onClick={() => handleMarkTransferred(selectedTransfer.id)}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-interactive-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Confirm Transferred
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve/Reject Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-outline-variant">
                <h2 className={`font-display text-xl font-bold ${confirmAction.type === 'REJECT' ? 'text-error' : 'text-primary'}`}>
                  {confirmAction.type === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
                </h2>
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isProcessing}
                  className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6">
                <p className="text-on-surface mb-4">
                  {confirmAction.type === 'APPROVE' 
                    ? 'Are you sure you want to approve this withdrawal request? You will need to transfer the funds afterwards.' 
                    : 'Are you sure you want to reject this withdrawal request? Please provide a reason.'}
                </p>

                {confirmAction.type === 'REJECT' && (
                  <div className="mb-6 space-y-2">
                    <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="e.g. Invalid bank details..."
                      rows="3"
                      className="w-full font-body text-sm px-4 py-3 rounded-xl border transition-colors bg-surface border-outline focus:border-error focus:ring-1 focus:ring-error text-on-surface resize-none custom-scrollbar"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button 
                    onClick={() => setConfirmAction(null)}
                    disabled={isProcessing}
                    className="px-4 py-2 font-interactive-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmProcessAction}
                    disabled={isProcessing}
                    className={`px-6 py-2 font-interactive-md rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 ${
                      confirmAction.type === 'APPROVE' 
                        ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                        : 'bg-error text-on-error hover:bg-error/90'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      confirmAction.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
