import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTournamentById, registerHorseForTournament } from '../api/tournamentApi';
import { getMyHorses } from '../api/horseApi';
import { useAuth } from '../contexts/AuthContext';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, isAuthenticated } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('races');

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [myHorses, setMyHorses] = useState([]);
  const [loadingHorses, setLoadingHorses] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTournamentById(id);
      setTournament(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegisterModal = async () => {
    setIsRegisterModalOpen(true);
    setRegisterError('');
    setRegisterSuccess('');
    setSelectedHorse('');
    
    if (myHorses.length === 0) {
      try {
        setLoadingHorses(true);
        const horses = await getMyHorses();
        // Filter horses based on status or let the backend handle validation
        setMyHorses(horses || []);
      } catch (err) {
        setRegisterError('Failed to load your horses.');
      } finally {
        setLoadingHorses(false);
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHorse) {
      setRegisterError('Please select a horse.');
      return;
    }
    
    try {
      setRegistering(true);
      setRegisterError('');
      await registerHorseForTournament(id, selectedHorse);
      setRegisterSuccess('Successfully registered horse for the tournament!');
      setTimeout(() => {
        setIsRegisterModalOpen(false);
      }, 2000);
    } catch (err) {
      setRegisterError(err.message || 'Failed to register horse.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h2 className="font-display text-2xl text-on-surface mb-2">Tournament Not Found</h2>
        <p className="text-on-surface-variant font-body mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-interactive-md hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
          Back to Home
        </button>
      </div>
    );
  }

  const isRegistrationOpen = new Date() >= new Date(tournament.registrationStart) && new Date() <= new Date(tournament.registrationEnd);
  const statusColor = tournament.status === 'upcoming' ? 'bg-primary/10 text-primary border-primary/20' : 
                      tournament.status === 'ongoing' ? 'bg-error/10 text-error border-error/20' : 
                      'bg-surface-variant/30 text-on-surface border-outline-variant';

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-20">
      {/* Hero Banner Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tournament.bannerUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuACI341eh3wx3JppWIv59acRwmsD6u8Fr79sy_Nvm0eRkj4gdLD2oCzJ7VZW3N0LPoKRcbrjwjuBafVCByly7k-4gmBH_ekmRq2Dl6KNi1d40_0DXtlav-AX__7Bw-9nBkkp7wMdbDdVlcvUiU5xYc0d1UPbFBnTNACxueyjSexdzsZoHaS_NnozHhaFWs5oiV2C7KegCNCNJT81AM92twytSH6CtGzjBpYtd26bvFk1Ftkjhpw7axAtLEpcrjuwiuTC2l95PsC6ybr'})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${statusColor}`}>
                {tournament.status}
              </span>
              <span className="px-3 py-1 bg-surface/50 backdrop-blur-md text-on-surface text-xs font-bold rounded-full border border-outline-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-on-surface font-bold uppercase tracking-tight mb-4 drop-shadow-lg">
              {tournament.name}
            </h1>
            <div className="flex items-center gap-2 text-primary font-display text-2xl drop-shadow-md">
              <span className="material-symbols-outlined text-[28px]">payments</span>
              ${tournament.prizePool?.toLocaleString()} Prize Pool
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Tabs) */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="flex border-b border-outline-variant bg-surface-container-low overflow-x-auto hide-scrollbar">
                {['races', 'rankings', 'rules'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 font-interactive-md text-sm md:text-base capitalize transition-colors relative whitespace-nowrap cursor-pointer ${activeTab === tab ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    {tab === 'races' && <span className="material-symbols-outlined align-middle mr-2 text-[20px]">sports_score</span>}
                    {tab === 'rankings' && <span className="material-symbols-outlined align-middle mr-2 text-[20px]">leaderboard</span>}
                    {tab === 'rules' && <span className="material-symbols-outlined align-middle mr-2 text-[20px]">gavel</span>}
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'races' && (
                    <motion.div key="races" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <h3 className="font-display text-2xl text-on-surface mb-6 uppercase">Tournament Races</h3>
                      {tournament.races?.length > 0 ? (
                        <div className="space-y-4">
                          {tournament.races.map((race) => (
                            <div key={race.id} className="flex justify-between items-center p-4 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors bg-surface-container-lowest">
                              <div>
                                <h4 className="font-body text-lg font-bold text-on-surface">{race.name || `Race ${race.id}`}</h4>
                                <div className="flex gap-4 mt-2 text-sm text-on-surface-variant">
                                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_month</span> {new Date(race.startTime).toLocaleString()}</span>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-bold uppercase rounded-md border border-outline-variant">
                                {race.status || 'SCHEDULED'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                          <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">event_busy</span>
                          <p>No races have been scheduled for this tournament yet.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {activeTab === 'rankings' && (
                    <motion.div key="rankings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <h3 className="font-display text-2xl text-on-surface mb-6 uppercase">Leaderboard</h3>
                      <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                        <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">emoji_events</span>
                        <p>Rankings will be available once the tournament begins.</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'rules' && (
                    <motion.div key="rules" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <h3 className="font-display text-2xl text-on-surface mb-6 uppercase">Tournament Rules & Penalties</h3>
                      {tournament.penaltyRules?.length > 0 ? (
                        <div className="grid gap-4">
                          {tournament.penaltyRules.map((rule) => (
                            <div key={rule.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest">
                              <h4 className="font-bold text-on-surface mb-1">{rule.name || rule.ruleType}</h4>
                              <p className="text-sm text-on-surface-variant">{rule.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                          <p>Standard racing rules apply.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar / Requirements */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
              
              <h3 className="font-display text-xl text-on-surface uppercase tracking-tight mb-2">Registration</h3>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-1">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>Opens: {new Date(tournament.registrationStart).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  <span>Closes: {new Date(tournament.registrationEnd).toLocaleDateString()}</span>
                </div>
              </div>

              {!isAuthenticated ? (
                <button onClick={() => navigate('/login')} className="w-full bg-surface-container-high text-on-surface px-4 py-3 rounded-xl font-interactive-md hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 cursor-pointer border border-outline-variant">
                  <span className="material-symbols-outlined">login</span>
                  Login to Register
                </button>
              ) : hasRole('ROLE_HORSE_OWNER') ? (
                isRegistrationOpen ? (
                  <button onClick={handleOpenRegisterModal} className="w-full bg-primary text-on-primary px-4 py-3 rounded-xl font-interactive-md hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg">
                    <span className="material-symbols-outlined">add_circle</span>
                    Register Horse
                  </button>
                ) : (
                  <div className="w-full bg-error-container text-on-error-container px-4 py-3 rounded-xl text-center font-interactive-md font-semibold border border-error/20">
                    Registration Closed
                  </div>
                )
              ) : (
                <div className="w-full bg-surface-container text-on-surface-variant px-4 py-3 rounded-xl text-center text-sm border border-outline-variant">
                  Only Horse Owners can register entries.
                </div>
              )}
            </div>

            {/* Requirements Card */}
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-display text-xl text-on-surface uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rule</span>
                Entry Requirements
              </h3>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">cake</span>
                    Age Limit
                  </div>
                  <span className="font-bold text-on-surface">{tournament.minHorseAge} - {tournament.maxHorseAge} years</span>
                </li>
                <li className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">scale</span>
                    Weight Limit
                  </div>
                  <span className="font-bold text-on-surface">Max {tournament.weightLimit} kg</span>
                </li>
                <li className="flex justify-between items-center pb-1">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">pets</span>
                    Breed
                  </div>
                  <span className="font-bold text-on-surface bg-surface-container-high px-2 py-1 rounded text-sm uppercase">{tournament.allowedBreed}</span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-container-highest/80 backdrop-blur-sm"
              onClick={() => setIsRegisterModalOpen(false)}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface relative w-full max-w-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-outline-variant overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-display text-xl uppercase tracking-tight text-on-surface">Register Horse</h3>
                <button onClick={() => setIsRegisterModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="p-6">
                {registerSuccess ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="material-symbols-outlined text-[32px]">check</span>
                    </motion.div>
                    <h4 className="font-display text-xl text-on-surface mb-2">Registration Submitted!</h4>
                    <p className="text-on-surface-variant">Your registration is pending approval.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit}>
                    {registerError && (
                      <div className="mb-4 p-3 bg-error-container text-error rounded-lg text-sm flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <p>{registerError}</p>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Horse</label>
                      {loadingHorses ? (
                        <div className="flex justify-center py-4"><svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
                      ) : myHorses.length === 0 ? (
                        <div className="text-sm text-error bg-error-container p-3 rounded-lg">You don't have any horses registered yet.</div>
                      ) : (
                        <select
                          value={selectedHorse}
                          onChange={(e) => setSelectedHorse(e.target.value)}
                          required
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                        >
                          <option value="" disabled>-- Choose a horse --</option>
                          {myHorses.map(horse => (
                            <option key={horse.id} value={horse.id}>{horse.name} (Age: {horse.age}, Breed: {horse.breed})</option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant mb-6 text-sm text-on-surface-variant flex gap-3">
                      <span className="material-symbols-outlined text-primary">info</span>
                      <p>By registering, you confirm that your horse meets all entry requirements including age, weight, and breed.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={registering || !selectedHorse}
                      className="w-full bg-primary text-on-primary py-3 rounded-xl font-interactive-md hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex justify-center items-center gap-2"
                    >
                      {registering ? (
                        <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processing...</>
                      ) : (
                        'Submit Registration'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
