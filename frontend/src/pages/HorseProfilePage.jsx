import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getHorseProfile } from '../api/horseApi';

export default function HorseProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getHorseProfile(id);
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch horse profile');
    } finally {
      setLoading(false);
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h2 className="font-display text-2xl text-on-surface mb-2">Profile Not Found</h2>
        <p className="text-on-surface-variant font-body mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-interactive-md hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  const statusColor = profile.status === 'active' ? 'bg-success/10 text-success border-success/20' :
    profile.status === 'inactive' ? 'bg-surface-variant/30 text-on-surface border-outline-variant' :
      profile.status === 'banned' ? 'bg-error/10 text-error border-error/20' :
        'bg-warning/10 text-warning border-warning/20';

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-20">
      {/* Hero Banner Section */}
      <div className="relative h-[35vh] md:h-[45vh] w-full overflow-hidden bg-surface-container-highest">
        {/* Placeholder gradient for banner */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-surface-container-highest to-surface"></div>
        
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => navigate(-1)} className="bg-surface/50 backdrop-blur-md hover:bg-surface text-on-surface p-2 rounded-full transition-colors flex items-center justify-center shadow-md cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:px-24 flex items-end gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-32 h-32 md:w-40 md:h-40 bg-surface-container-lowest rounded-2xl border-4 border-surface shadow-xl flex items-center justify-center overflow-hidden shrink-0"
          >
            <span className="material-symbols-outlined text-[80px] text-primary/50">pets</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-2"
          >
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${statusColor}`}>
                {profile.status}
              </span>
              <span className="bg-surface/60 backdrop-blur-md text-on-surface text-xs font-bold px-3 py-1 rounded-full border border-outline-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tag</span> {profile.horseCode}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-on-surface tracking-tight mb-2">
              {profile.name}
            </h1>
            <p className="text-on-surface-variant text-lg font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              Owner: {profile.ownerName || 'Unknown'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">flag</span>
            </div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold mb-1">Total Races</p>
            <p className="font-display text-4xl text-on-surface">{profile.totalRaces}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">emoji_events</span>
            </div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold mb-1">Win Rate</p>
            <p className="font-display text-4xl text-on-surface">{profile.winRate.toFixed(1)}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary-variant rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
            </div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold mb-1">Top 3 Rate</p>
            <p className="font-display text-4xl text-on-surface">{profile.top3Rate.toFixed(1)}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold mb-1">Violations</p>
            <p className="font-display text-4xl text-on-surface">{profile.totalViolations}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm">
              <h3 className="font-display text-xl text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Basic Information
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant font-medium text-sm">Breed</span>
                  <span className="font-bold text-on-surface bg-surface-container-high px-2 py-1 rounded text-sm uppercase">{profile.breed || 'Unknown'}</span>
                </li>
                <li className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant font-medium text-sm">Gender</span>
                  <span className="font-bold text-on-surface uppercase">{profile.gender || 'Unknown'}</span>
                </li>
                <li className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant font-medium text-sm">Date of Birth</span>
                  <span className="font-bold text-on-surface">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Unknown'}</span>
                </li>
                <li className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant font-medium text-sm">Height (cm)</span>
                  <span className="font-bold text-on-surface">{profile.height || '--'}</span>
                </li>
                <li className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant font-medium text-sm">Weight (kg)</span>
                  <span className="font-bold text-on-surface">{profile.weight || '--'}</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                  <span className="text-on-surface-variant font-medium text-sm">Health Status</span>
                  <span className={`font-bold text-xs uppercase px-2 py-1 rounded-md ${profile.healthStatus?.toLowerCase().includes('good') ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface'}`}>{profile.healthStatus || 'Not Checked'}</span>
                </li>
              </ul>
              {profile.healthCertificateUrl && (
                 <a href={profile.healthCertificateUrl} target="_blank" rel="noopener noreferrer" className="mt-6 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary py-3 rounded-xl font-interactive-md hover:bg-primary/20 transition-colors">
                   <span className="material-symbols-outlined">description</span>
                   View Health Certificate
                 </a>
              )}
            </div>
          </div>

          {/* Right Column: Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="flex border-b border-outline-variant bg-surface-container-lowest">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 text-center font-interactive-md transition-colors border-b-2 cursor-pointer ${activeTab === 'history' ? 'border-primary text-primary bg-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface/50'}`}
                >
                  Race History
                </button>
                <button
                  onClick={() => setActiveTab('violations')}
                  className={`flex-1 py-4 text-center font-interactive-md transition-colors border-b-2 cursor-pointer ${activeTab === 'violations' ? 'border-error text-error bg-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface/50'}`}
                >
                  Violations
                </button>
              </div>

              <div className="p-0">
                {activeTab === 'history' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-lowest border-b border-outline-variant">
                          <th className="p-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                          <th className="p-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Tournament & Race</th>
                          <th className="p-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Jockey</th>
                          <th className="p-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {profile.raceHistory && profile.raceHistory.length > 0 ? (
                          profile.raceHistory.map((race, index) => (
                            <tr key={index} className="hover:bg-surface-container-lowest/50 transition-colors">
                              <td className="p-4 text-sm text-on-surface">
                                {race.raceDate ? new Date(race.raceDate).toLocaleDateString() : 'TBD'}
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-on-surface text-sm">{race.raceName}</div>
                                <div className="text-xs text-on-surface-variant">{race.tournamentName}</div>
                              </td>
                              <td className="p-4 text-sm text-on-surface">
                                {race.jockeyName || 'No Jockey'}
                              </td>
                              <td className="p-4 text-center">
                                {race.rank ? (
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                    race.rank === 1 ? 'bg-primary/20 text-primary-dark' :
                                    race.rank === 2 ? 'bg-surface-variant text-on-surface-variant' :
                                    race.rank === 3 ? 'bg-error/10 text-error' :
                                    'bg-surface-container-high text-on-surface'
                                  }`}>
                                    {race.rank}
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium px-2 py-1 bg-surface-variant text-on-surface-variant rounded-md">
                                    {race.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-8 text-center text-on-surface-variant">No race history available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'violations' && (
                  <div className="p-6 space-y-4">
                    {profile.violations && profile.violations.length > 0 ? (
                      profile.violations.map((violation, index) => (
                        <div key={index} className="flex gap-4 p-4 rounded-xl border border-error/20 bg-error/5 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                          <div className="mt-1">
                            <span className="material-symbols-outlined text-error text-[24px]">gavel</span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h4 className="font-bold text-error">{violation.penaltyRuleType || 'Rule Violation'}</h4>
                              <span className="text-xs text-on-surface-variant">{violation.tournamentName} - {violation.raceName}</span>
                            </div>
                            <p className="text-sm text-on-surface mb-2">{violation.description}</p>
                            <span className="text-xs font-medium text-on-surface-variant bg-surface px-2 py-1 rounded-md border border-outline-variant">
                              Date: {violation.violationDate ? new Date(violation.violationDate).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-[32px]">check_circle</span>
                        </div>
                        <h4 className="font-display text-lg text-on-surface mb-2">Clean Record</h4>
                        <p className="text-on-surface-variant text-sm">This horse has never committed any rule violations.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
