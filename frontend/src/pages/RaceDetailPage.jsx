import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRaceById } from '../api/raceApi';
import { getTournamentById } from '../api/tournamentApi';
import { getEntriesByRace } from '../api/raceEntryApi';
import { getOddsByRace } from '../api/betOddsApi';
import { getMyProfile } from '../api/userApi';
import { raceSimulatorApi } from '../api/raceSimulatorApi';
import { getViolations } from '../api/violationApi';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import BettingBoard from '../components/betting/BettingBoard';
import BettingModal from '../components/betting/BettingModal';

export default function RaceDetailPage() {
  const { tournamentId, raceId } = useParams();
  const navigate = useNavigate();

  const [race, setRace] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [raceEntries, setRaceEntries] = useState([]);
  const [betOdds, setBetOdds] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedBet, setSelectedBet] = useState(null);
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);

  const [raceResults, setRaceResults] = useState([]);
  const [violations, setViolations] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const promises = [
          getRaceById(tournamentId, raceId),
          getTournamentById(tournamentId),
          getEntriesByRace(raceId),
          getOddsByRace(raceId).catch(() => []) // Handle case where odds are not generated yet
        ];
        
        if (isAuthenticated) {
          promises.push(getMyProfile().catch(() => null));
        }

        const results = await Promise.all(promises);
        
        setRace(results[0]);
        setTournament(results[1]);
        setRaceEntries(results[2]);
        setBetOdds(results[3]);
        
        if (isAuthenticated && results[4]) {
          setWalletBalance(results[4].walletBalance || 0);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load race details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId, raceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !race) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h2 className="font-display text-2xl mb-2">Race Not Found</h2>
        <p className="text-on-surface-variant font-body mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-interactive-md hover:bg-on-primary-fixed-variant transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const normalizedStatus = race.status?.toUpperCase() || 'SCHEDULED';
  const statusStyle =
    normalizedStatus === 'RACING' || normalizedStatus === 'RUNNING' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse' :
      normalizedStatus === 'FINISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
        normalizedStatus === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
          'bg-surface-variant/30 text-on-surface-variant border-outline-variant';

  const handleSelectBet = (betInfo) => {
    if (!isAuthenticated) {
      showToast('Error', 'Please login to place a bet');
      navigate('/login');
      return;
    }
    setSelectedBet(betInfo);
    setIsBettingModalOpen(true);
  };

  const handleBetSuccess = (response) => {
    showToast('Success', 'Bet placed successfully!');
    // Update local wallet balance
    setWalletBalance(prev => prev - response.amount);
  };

  const handleWatchResult = async () => {
    try {
      setLoading(true);
      const [resultsData, violationsData] = await Promise.all([
        raceSimulatorApi.getRaceResults(tournamentId, raceId).catch(() => []),
        getViolations(tournamentId, raceId).catch(() => [])
      ]);
      
      setRaceResults(resultsData || []);
      setViolations(violationsData || []);
      setShowResult(true);
      
      setTimeout(() => {
        document.getElementById('race-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      showToast('Error', 'Failed to load race results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-20">
      {/* Hero Header */}
      <div className="relative pt-12 pb-8 px-6 lg:px-12 bg-surface border-b border-outline-variant">
        <button
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
          className="text-on-surface-variant hover:text-primary transition-colors mb-6 flex items-center text-sm font-interactive-md"
        >
          <span className="material-symbols-outlined mr-1 text-[18px]">arrow_back</span>
          Back to Tournament
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-bold rounded-full border border-outline-variant">
                {tournament?.name}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border transition-all duration-300 ${statusStyle}`}>
                {(normalizedStatus === 'RACING' || normalizedStatus === 'RUNNING') && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-ping"></span>}
                {normalizedStatus}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-on-surface font-bold uppercase tracking-tight">
              {race.name || `Race #${race.id}`}
            </h1>
            <p className="text-on-surface-variant font-body mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">straighten</span> {race.distance || 1000}m</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_month</span> {new Date(race.startTime).toLocaleString()}</span>
            </p>
          </div>

          {normalizedStatus === 'FINISHED' ? (
            <button
              onClick={handleWatchResult}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-interactive-md font-bold text-lg hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">emoji_events</span>
              Watch Result
            </button>
          ) : (
            <button
              onClick={() => navigate(`/live-race/${tournamentId}/${raceId}`)}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-interactive-md font-bold text-lg hover:bg-on-primary-fixed-variant hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">sports_score</span>
              Watch Simulator
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-12">
        <h3 className="font-display text-2xl text-on-surface mb-6 uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">groups</span>
          Race Participants ({raceEntries?.length || 0})
        </h3>

        {raceEntries?.length > 0 ? (
          <div className="overflow-x-auto bg-surface rounded-2xl border border-outline-variant shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-display text-sm uppercase tracking-wider border-b border-outline-variant">
                  <th className="p-5 font-semibold w-24 text-center">Lane</th>
                  <th className="p-5 font-semibold">Horse Name</th>
                  <th className="p-5 font-semibold">Jockey Name</th>
                  <th className="p-5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {raceEntries.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                    className="border-b border-outline-variant/50 hover:bg-surface-container-highest transition-all duration-300"
                  >
                    <td className="p-5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-display shadow-inner border border-primary/30">
                        {entry.laneNumber || index + 1}
                      </div>
                    </td>
                    <td className="p-5 font-body text-lg font-bold text-on-surface">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary/70">pets</span>
                        {entry.horseName || 'Unknown Horse'}
                      </div>
                    </td>
                    <td className="p-5 font-body text-on-surface-variant">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant/70">person</span>
                        {entry.jockeyName || 'Unknown Jockey'}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${entry.status === 'ACTIVE' || entry.status === 'READY' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-surface-variant text-on-surface-variant border-outline-variant'}`}>
                        {entry.status || 'READY'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[48px] opacity-30 text-on-surface-variant mb-4">pets</span>
            <p className="text-on-surface-variant">No horses have been assigned to this race yet.</p>
          </div>
        )}
      </div>

      <div className={`max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-12 mb-12 ${showResult ? 'hidden' : 'block'}`}>
        <BettingBoard 
          raceEntries={raceEntries}
          betOdds={betOdds}
          onSelectBet={handleSelectBet}
          bettingStatus={race?.bettingStatus}
        />
      </div>

      {/* Race Results Section */}
      {showResult && (
        <div id="race-results-section" className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-16 mb-12">
          <div className="flex flex-col items-center mb-12">
            <span className="px-4 py-1.5 bg-green-500/10 text-green-600 text-sm font-bold uppercase tracking-wider rounded-full border border-green-500/20 mb-4">Official Results</span>
            <h3 className="font-display text-4xl text-on-surface uppercase tracking-tight text-center">
              Race Leaderboard
            </h3>
          </div>

          {raceResults.length > 0 ? (
            <div className="space-y-16">
              {/* Podium */}
              <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 h-auto md:h-64 mt-10">
                {/* 2nd Place */}
                {raceResults.find(r => r.position === 2 && !r.isDisqualified) && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full md:w-48 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg shadow-lg border border-gray-300 flex flex-col items-center justify-start pt-6 h-48 relative overflow-hidden">
                    <div className="absolute -top-6 text-[48px]">🥈</div>
                    <span className="text-gray-500 font-display font-bold text-xl mt-4">2nd</span>
                    <span className="font-bold text-on-surface mt-2 text-center px-2 line-clamp-1">{raceResults.find(r => r.position === 2).horseName}</span>
                    <span className="text-xs text-on-surface-variant mt-1">{raceResults.find(r => r.position === 2).jockeyName}</span>
                  </motion.div>
                )}

                {/* 1st Place */}
                {raceResults.find(r => r.position === 1 && !r.isDisqualified) && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full md:w-56 bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-t-lg shadow-xl border border-yellow-300 flex flex-col items-center justify-start pt-6 h-64 relative overflow-hidden z-10">
                    <div className="absolute -top-8 text-[64px] drop-shadow-md">🥇</div>
                    <span className="text-yellow-600 font-display font-bold text-2xl mt-6">1st</span>
                    <span className="font-bold text-on-surface mt-2 text-center px-2 text-lg line-clamp-1">{raceResults.find(r => r.position === 1).horseName}</span>
                    <span className="text-sm text-on-surface-variant mt-1">{raceResults.find(r => r.position === 1).jockeyName}</span>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {raceResults.find(r => r.position === 3 && !r.isDisqualified) && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="w-full md:w-48 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-lg shadow-md border border-orange-300 flex flex-col items-center justify-start pt-6 h-40 relative overflow-hidden">
                    <div className="absolute -top-6 text-[48px]">🥉</div>
                    <span className="text-orange-600 font-display font-bold text-xl mt-4">3rd</span>
                    <span className="font-bold text-on-surface mt-2 text-center px-2 line-clamp-1">{raceResults.find(r => r.position === 3).horseName}</span>
                    <span className="text-xs text-on-surface-variant mt-1">{raceResults.find(r => r.position === 3).jockeyName}</span>
                  </motion.div>
                )}
              </div>

              {/* Table */}
              <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-display text-sm uppercase tracking-wider border-b border-outline-variant">
                      <th className="p-4 font-semibold w-24 text-center">Rank</th>
                      <th className="p-4 font-semibold">Horse</th>
                      <th className="p-4 font-semibold">Jockey</th>
                      <th className="p-4 font-semibold">Lane</th>
                      <th className="p-4 font-semibold text-right">Finish Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raceResults.sort((a,b) => {
                      if (a.isDisqualified && !b.isDisqualified) return 1;
                      if (!a.isDisqualified && b.isDisqualified) return -1;
                      return a.position - b.position;
                    }).map((res, index) => (
                      <tr key={res.id} className={`border-b border-outline-variant/50 transition-colors ${res.isDisqualified ? 'bg-error/5 hover:bg-error/10 text-on-surface-variant/70' : 'hover:bg-surface-container-highest text-on-surface'}`}>
                        <td className="p-4 text-center font-bold">
                          {res.isDisqualified ? (
                            <span className="text-error uppercase text-xs tracking-wider">DSQ</span>
                          ) : (
                            <span className={res.position <= 3 ? 'text-primary text-xl' : 'text-on-surface-variant'}>#{res.position}</span>
                          )}
                        </td>
                        <td className={`p-4 font-body font-bold ${res.isDisqualified ? 'line-through' : ''}`}>
                          {res.horseName}
                        </td>
                        <td className="p-4 font-body">{res.jockeyName}</td>
                        <td className="p-4 font-body text-center text-on-surface-variant">{res.laneNumber}</td>
                        <td className="p-4 font-body text-right font-mono text-sm">
                          {res.isDisqualified ? '-' : res.finishTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-outline-variant">
              <p className="text-on-surface-variant">Results are not available or pending confirmation.</p>
            </div>
          )}

          {/* Violations Section */}
          <div className="mt-16">
            <h3 className="font-display text-2xl text-on-surface mb-6 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-error">gavel</span>
              Race Violations & Penalties
            </h3>
            
            {violations.length > 0 ? (
              <div className="flex flex-col gap-4">
                {violations.map((vio) => (
                  <motion.div 
                    key={vio.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-xl border border-error/40 bg-error/5 flex flex-col md:flex-row md:items-center gap-4 hover:border-error transition-all"
                  >
                    <div className="flex items-center gap-3 md:w-1/4 min-w-[200px]">
                      <span className="material-symbols-outlined text-[20px] text-error">warning</span>
                      <div>
                        <h4 className="font-display text-lg font-bold text-error uppercase tracking-tight line-clamp-1">{vio.horseName}</h4>
                        <span className="text-xs text-on-surface-variant">Lane {vio.laneNumber}</span>
                      </div>
                    </div>
                    
                    <div className="md:w-2/4 flex-grow">
                      <p className="text-sm font-bold text-on-surface mb-1">{vio.violationType}</p>
                      <p className="text-xs text-on-surface-variant">{vio.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 md:w-1/4 md:justify-end shrink-0">
                      {vio.pointDeduction > 0 && (
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          -{vio.pointDeduction} Pts
                        </span>
                      )}
                      {vio.fineAmount > 0 && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          ${vio.fineAmount.toLocaleString()}
                        </span>
                      )}
                      {vio.banDays > 0 && (
                        <span className="px-2 py-1 bg-surface-variant text-on-surface-variant border border-outline-variant rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          {vio.banDays}d Ban
                        </span>
                      )}
                      {(vio.pointDeduction === 0 && vio.fineAmount === 0 && vio.banDays === 0) && (
                        <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-wider">
                          Warning
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-surface rounded-2xl border border-dashed border-outline-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-[40px] text-success/50 mb-3">verified</span>
                <p className="text-on-surface-variant font-medium">Clean Race</p>
                <p className="text-sm text-on-surface-variant/70">No violations were recorded during this race.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <BettingModal
        isOpen={isBettingModalOpen}
        onClose={() => setIsBettingModalOpen(false)}
        selectedBet={selectedBet}
        walletBalance={walletBalance}
        onBetSuccess={handleBetSuccess}
      />
    </div>
  );
}
