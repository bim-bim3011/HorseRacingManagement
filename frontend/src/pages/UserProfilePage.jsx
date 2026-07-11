import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProfile, updateMyProfile } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WithdrawalModal from '../components/common/WithdrawalModal';
import { createWithdrawalRequest, getMyWithdrawalRequests } from '../api/withdrawalApi';

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('personal_info');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Withdrawal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [banksList, setBanksList] = useState([]);

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
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

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchWithdrawalHistory();
    }
  }, [activeTab]);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getMyWithdrawalRequests();
      setWithdrawalHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleWithdrawSubmit = async (formData) => {
    // The modal will catch any errors thrown here
    await createWithdrawalRequest(formData);
    setIsWithdrawModalOpen(false);
    // Refresh profile to get updated balance
    fetchProfile();
    // Refresh history
    fetchWithdrawalHistory();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const updateData = {
        username: profile.username,
        // HorseOwner & Jockey
        fullName: profile.fullName,
        phone: profile.phone,
        // Jockey specific
        firstName: profile.firstName,
        lastName: profile.lastName,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        dob: profile.dob,
        experienceYears: profile.experienceYears,
      };

      const updatedProfile = await updateMyProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h2 className="font-display text-2xl text-on-surface mb-2">Profile Not Found</h2>
        <p className="text-on-surface-variant font-body mb-6">{error}</p>
      </div>
    );
  }

  const isHorseOwner = profile.roles?.includes('HORSE_OWNER') || profile.roles?.includes('ROLE_HORSE_OWNER');
  const isJockey = profile.roles?.includes('JOCKEY') || profile.roles?.includes('ROLE_JOCKEY');
  
  const displayFullName = profile.fullName || profile.firstName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : profile.fullName || profile.username;

  return (
    <div className="min-h-screen bg-surface-container-lowest py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-2">My Account</h1>
        <p className="text-on-surface-variant font-body text-sm mb-8">Manage your personal information, security, and activities</p>

        {error && (
          <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="font-body text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Summary Card */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-display text-2xl font-bold shrink-0">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-display text-lg font-bold text-on-surface truncate">{displayFullName}</h3>
                <p className="font-body text-sm text-on-surface-variant truncate">{profile.email}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden py-2">
              <button 
                onClick={() => setActiveTab('personal_info')}
                className={`w-full flex items-center gap-4 px-6 py-4 font-interactive-md transition-colors cursor-pointer text-left ${activeTab === 'personal_info' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Personal Information
              </button>
              
              <button 
                onClick={() => setActiveTab('wallet')}
                className={`w-full flex items-center gap-4 px-6 py-4 font-interactive-md transition-colors cursor-pointer text-left ${activeTab === 'wallet' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                Wallet Management
              </button>
              
              <button 
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-4 px-6 py-4 font-interactive-md transition-colors cursor-pointer text-left ${activeTab === 'password' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined text-[20px]">key</span>
                Change Password
              </button>

              <div className="h-px bg-outline-variant/50 my-2 mx-4"></div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 font-interactive-md transition-colors cursor-pointer text-left text-error hover:bg-error-container"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'personal_info' && (
                <motion.div 
                  key="personal_info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface rounded-2xl border border-outline-variant p-6 md:p-8 shadow-sm"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <h2 className="font-display text-xl text-on-surface font-bold">Personal Information</h2>
                        <p className="font-body text-sm text-on-surface-variant">Manage your personal details</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg font-interactive-md transition-colors border border-outline-variant cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                           </svg>
                           Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">{isEditing ? 'save' : 'edit'}</span>
                          {isEditing ? 'Save' : 'Edit'}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Upload Section */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="relative w-32 h-32">
                        <div className="w-full h-full rounded-full bg-primary text-on-primary flex items-center justify-center font-display text-5xl font-bold shadow-inner">
                          {profile.username?.charAt(0).toUpperCase()}
                        </div>
                        {isEditing && (
                          <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg border-2 border-surface hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                          </button>
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="font-body text-sm font-bold text-on-surface">Avatar</h3>
                        <p className="font-body text-xs text-on-surface-variant mt-1">JPG, PNG or GIF.<br/>Max 5MB.</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-grow">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="space-y-2">
                          <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Username</label>
                          <input 
                            type="text" 
                            value={profile.username || ''}
                            onChange={(e) => setProfile({...profile, username: e.target.value})}
                            disabled={!isEditing}
                            className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                          <input 
                            type="email" 
                            value={profile.email || ''}
                            disabled
                            className="w-full font-body text-body-md px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant cursor-not-allowed"
                          />
                        </div>

                        {/* Horse Owner specific fields */}
                        {isHorseOwner && (
                          <>
                            <div className="space-y-2 md:col-span-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                              <input 
                                type="text" 
                                value={profile.fullName || ''}
                                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Enter full name"
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                              <input 
                                type="text" 
                                value={profile.phone || ''}
                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Enter phone number"
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                          </>
                        )}

                        {/* Jockey specific fields */}
                        {isJockey && (
                          <>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">First Name</label>
                              <input 
                                type="text" 
                                value={profile.firstName || ''}
                                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                                disabled={!isEditing}
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Last Name</label>
                              <input 
                                type="text" 
                                value={profile.lastName || ''}
                                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                                disabled={!isEditing}
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Weight (kg)</label>
                              <input 
                                type="number" 
                                value={profile.weight || ''}
                                onChange={(e) => setProfile({...profile, weight: parseFloat(e.target.value)})}
                                disabled={!isEditing}
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Height (cm)</label>
                              <input 
                                type="number" 
                                value={profile.height || ''}
                                onChange={(e) => setProfile({...profile, height: parseFloat(e.target.value)})}
                                disabled={!isEditing}
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Experience (Years)</label>
                              <input 
                                type="number" 
                                value={profile.experienceYears || ''}
                                onChange={(e) => setProfile({...profile, experienceYears: parseInt(e.target.value)})}
                                disabled={!isEditing}
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gender</label>
                              <select 
                                value={profile.gender || ''}
                                onChange={(e) => setProfile({...profile, gender: e.target.value})}
                                disabled={!isEditing}
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors cursor-pointer ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                              >
                                <option value="" disabled>-- Select --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
                              <DatePicker 
                                selected={profile.dob ? new Date(profile.dob) : null}
                                disabled={!isEditing}
                                onChange={(date) => {
                                  if (date) {
                                    const formattedDate = date.toISOString().split('T')[0];
                                    setProfile({...profile, dob: formattedDate});
                                  } else {
                                    setProfile({...profile, dob: ''});
                                  }
                                }} 
                                dateFormat="yyyy-MM-dd"
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={100}
                                placeholderText="Select Date of Birth"
                                className={`w-full font-body text-body-md px-4 py-3 rounded-xl border transition-colors ${!isEditing ? 'bg-surface-container-lowest border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'}`}
                                wrapperClassName="w-full block"
                              />
                            </div>
                          </>
                        )}
                        
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'wallet' && (
                <motion.div 
                  key="wallet"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface rounded-2xl border border-outline-variant p-6 md:p-8 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-8">
                    <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-on-surface font-bold">Wallet Management</h2>
                      <p className="font-body text-sm text-on-surface-variant">Manage your balance and transactions</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-container to-primary/10 rounded-2xl p-8 mb-8 border border-primary/20 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-20">
                      <span className="material-symbols-outlined text-[150px] text-primary">account_balance_wallet</span>
                    </div>
                    <p className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2 relative z-10">Available Balance</p>
                    <h3 className="font-display text-5xl font-bold text-primary relative z-10">
                      {profile.walletBalance != null ? profile.walletBalance.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
                    </h3>
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button onClick={() => navigate('/deposit')} className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-interactive-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex justify-center items-center gap-2 cursor-pointer">
                      <span className="material-symbols-outlined">add_circle</span> Deposit
                    </button>
                    <button 
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-xl font-interactive-md hover:bg-surface-container-highest transition-colors border border-outline-variant shadow-sm flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">payments</span> Withdraw
                    </button>
                  </div>

                  {/* Withdrawal History */}
                  <div>
                    <h3 className="font-display text-lg font-bold text-on-surface mb-4">Withdrawal History</h3>
                    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body">
                          <thead className="bg-surface-container-low text-on-surface-variant text-sm border-b border-outline-variant">
                            <tr>
                              <th className="px-4 py-3 font-interactive-md">Date</th>
                              <th className="px-4 py-3 font-interactive-md">Amount</th>
                              <th className="px-4 py-3 font-interactive-md">Bank Info</th>
                              <th className="px-4 py-3 font-interactive-md">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant">
                            {loadingHistory ? (
                              <tr>
                                <td colSpan="4" className="text-center py-8 text-on-surface-variant">Loading history...</td>
                              </tr>
                            ) : withdrawalHistory.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="text-center py-8 text-on-surface-variant">No withdrawal requests found.</td>
                              </tr>
                            ) : (
                              withdrawalHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                                  <td className="px-4 py-3 text-sm text-on-surface whitespace-nowrap">
                                    {new Date(item.requestedAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-on-surface">
                                    {item.amount.toLocaleString()} VNĐ
                                  </td>
                                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                                    {getBankDisplayName(item.bankName)} - {item.bankAccount}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      item.status.toUpperCase() === 'PENDING' ? 'bg-secondary-container text-on-secondary-container' :
                                      item.status.toUpperCase() === 'APPROVED' ? 'bg-primary-container text-on-primary-container' :
                                      (item.status.toUpperCase() === 'COMPLETED' || item.status.toUpperCase() === 'TRANSFERRED') ? 'bg-green-100 text-green-800' :
                                      'bg-error-container text-on-error-container'
                                    }`}>
                                      {item.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <WithdrawalModal 
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    userBalance={profile.walletBalance || 0}
                    onSubmit={handleWithdrawSubmit}
                  />
                </motion.div>
              )}

              {activeTab === 'password' && (
                <motion.div 
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface rounded-2xl border border-outline-variant p-6 md:p-8 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-8">
                    <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">key</span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-on-surface font-bold">Change Password</h2>
                      <p className="font-body text-sm text-on-surface-variant">Protect your account with a secure password</p>
                    </div>
                  </div>

                  <form className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full font-body text-body-md px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full font-body text-body-md px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full font-body text-body-md px-4 py-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary text-on-surface transition-colors"
                      />
                    </div>
                    <button type="button" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-interactive-md hover:bg-on-primary-fixed-variant transition-colors cursor-pointer w-full shadow-sm">
                      Save New Password
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
