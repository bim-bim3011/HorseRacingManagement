import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRaceById } from '../api/raceApi';
import { getTournamentById } from '../api/tournamentApi';
import { getEntriesByRace } from '../api/raceEntryApi';
import { getOddsByRace } from '../api/betOddsApi';
import { getMyProfile } from '../api/userApi';
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

  const statusStyle =
    race.status === 'RUNNING' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse' :
      race.status === 'FINISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
        race.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
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
                {race.status === 'RUNNING' && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-ping"></span>}
                {race.status || 'SCHEDULED'}
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

          <button
            onClick={() => navigate(`/live-race/${tournamentId}/${raceId}`)}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-interactive-md font-bold text-lg hover:bg-on-primary-fixed-variant hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
          >
            <span className="material-symbols-outlined text-[24px]">sports_score</span>
            Watch Simulator
          </button>
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

      {/* Betting Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-12 mb-12">
        <BettingBoard 
          raceEntries={raceEntries}
          betOdds={betOdds}
          onSelectBet={handleSelectBet}
          bettingStatus={race?.bettingStatus}
        />
      </div>

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
