import { useState, useEffect } from 'react';
import RefereeRaceTimeline from '../components/referee/RefereeRaceTimeline';
import RefereeRaceContent from '../components/referee/RefereeRaceContent';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../api/userApi';
import { getAssignmentsByReferee } from '../api/refereeApi';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['checking', 'racing', 'reviewing', 'finished'];

export default function RefereeDashboardPage() {
  const { userRoles } = useAuth();
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('checking');
  
  const [assignments, setAssignments] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const profile = await getMyProfile();
        const refereeId = profile.id;
        const data = await getAssignmentsByReferee(refereeId);
        setAssignments(data || []);
      } catch (error) {
        console.error("Failed to fetch referee assignments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Simple hardcoded mock logic to switch states for the skeleton demo
  const handleNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStatus);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStatus(STEPS[currentIndex + 1]);
    }
  };

  const handleSelectRace = (assignment) => {
    setSelectedRace(assignment);
    setCurrentStatus('checking');
  };

  const handleBackToAssignments = () => {
    setSelectedRace(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      {/* Header Area */}
      <header className="bg-surface-container-lowest border-b border-outline-variant py-4 px-8 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (selectedRace) {
                handleBackToAssignments();
              } else {
                navigate('/');
              }
            }} 
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            title={selectedRace ? "Back to Assignments" : "Back to Home"}
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-display text-headline-sm text-primary font-bold leading-tight">Referee Dashboard</h1>
            <p className="font-body text-body-sm text-on-surface-variant">
              {selectedRace ? `Active Race: ${selectedRace.raceName}` : 'My Assignments'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {selectedRace && (
            <button 
              onClick={() => setCurrentStatus('checking')} 
              className="text-on-surface-variant hover:text-primary transition-colors text-sm underline cursor-pointer"
            >
              Reset Demo
            </button>
          )}
          <div className="flex items-center gap-2 bg-surface-container py-2 px-4 rounded-full">
            <span className="material-symbols-outlined text-[20px] text-primary">shield_person</span>
            <span className="font-bold text-on-surface text-sm">Official Referee</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative bg-surface-container-lowest">
        <AnimatePresence mode="wait">
          {!selectedRace ? (
            <motion.div 
              key="assignment-list"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full p-8 overflow-y-auto"
            >
              <h2 className="font-display text-headline-md text-on-surface mb-8 font-bold">Upcoming Assignments</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <span className="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
                </div>
              ) : assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignments.map((assignment) => (
                    <motion.div 
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      key={assignment.id}
                      onClick={() => handleSelectRace(assignment)}
                      className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary-container text-on-primary-container p-3 rounded-lg">
                          <span className="material-symbols-outlined">sports_score</span>
                        </div>
                        <span className="bg-tertiary-container text-on-tertiary-container text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                          Assigned
                        </span>
                      </div>
                      <h3 className="font-display text-title-lg text-on-surface font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {assignment.raceName}
                      </h3>
                      <p className="font-body text-body-md text-on-surface-variant mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Race ID: #{assignment.raceId}
                      </p>
                      
                      <div className="w-full border-t border-outline-variant pt-4 flex justify-between items-center text-primary font-bold text-sm">
                        <span>Enter Dashboard</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
                  <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">inbox</span>
                  <p className="font-body text-body-lg">You don't have any race assignments yet.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="race-dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex"
            >
              <RefereeRaceTimeline 
                currentStatus={currentStatus} 
                onStepClick={setCurrentStatus}
              />
              <RefereeRaceContent 
                currentStatus={currentStatus} 
                onNextStep={handleNextStep}
                selectedRace={selectedRace}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
