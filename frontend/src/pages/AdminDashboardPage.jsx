import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OverviewTab from '../components/admin/OverviewTab';
import TournamentsTab from '../components/admin/TournamentsTab';
import RacesTab from '../components/admin/RacesTab';
import RefereesTab from '../components/admin/RefereesTab';
import PenaltyRulesTab from '../components/admin/PenaltyRulesTab';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigationItems = [
    { id: 'overview', icon: 'dashboard', label: 'System Overview' },
    { id: 'tournaments', icon: 'calendar_today', label: 'Tournament Scheduling' },
    { id: 'approvals', icon: 'fact_check', label: 'Entry Approvals' },
    { id: 'listings', icon: 'pets', label: 'Jockey & Horse Listings' },
    { id: 'referees', icon: 'assignment_ind', label: 'Referee Management' },
    { id: 'results', icon: 'publish', label: 'Result Publishing' },
    { id: 'predictions', icon: 'online_prediction', label: 'Prediction Management' },
    { id: 'permissions', icon: 'verified_user', label: 'Role Permissions' },
    { id: 'accounts', icon: 'manage_accounts', label: 'Account Management' }
  ];

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* Top App Bar */}
      <motion.header
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 w-[calc(100%-18rem)] h-16 flex justify-between items-center px-margin-desktop z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant"
      >
        <div className="flex items-center gap-stack-md">
          {/* Search Bar placeholder */}
          <div className="relative hidden md:block group">
            <span className="material-symbols-outlined absolute left-unit top-1/2 -translate-y-1/2 text-on-surface-variant text-interactive-md transition-colors group-focus-within:text-primary">search</span>
            <input className="bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-64" placeholder="Search..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-gutter">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </motion.button>
          
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              alt="Administrator Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-outline-variant hover:border-primary transition-colors cursor-pointer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnXm12wA8D2l4tyX6h3WnbUqmygy8FJN6TuTAvqGkNIcQsfcUA7DVtj480uv1lh3E8FnqvGFg1Z4p64vOEzsmLarL3t_zvY2ZnCR2bETl2D9SendIPRKFu74XVbIF5qhWue9WH_KyIrjE4nkaf_v4iuOMA4gJr0eohaZCg8ABC3c-wpI_M6lWi7GtZqk5beybiqDuEM8_BfSH9aV-fZoHjupTkKfmFi36n8RNvdG8rHD5SJ3ieTDriJ6IIkM1bujZCjzu0aIsVAKut"
            />
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-outline-variant overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant">
                    <p className="font-interactive-md text-on-surface">Administrator</p>
                    <p className="font-body-sm text-on-surface-variant text-sm truncate">admin@theeliteclub.com</p>
                  </div>
                  <div className="py-2">
                    <Link to="/profile" className="w-full text-left px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 flex items-center gap-2 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                      My Profile
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-error hover:bg-error-container hover:text-on-error-container flex items-center gap-2 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Side Navigation */}
      <motion.nav
        initial={{ x: -288 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 flex flex-col z-40 overflow-y-auto px-unit bg-surface border-r border-outline-variant"
      >
        <div className="py-stack-md px-stack-sm flex items-center gap-stack-sm border-b border-outline-variant mb-stack-md">
          <div className="flex items-center gap-stack-sm">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 bg-primary flex items-center justify-center rounded-DEFAULT shadow-sm cursor-pointer"
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-4 h-4 bg-surface-container-lowest rounded-full"></div>
            </motion.div>
            <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('overview')}>
              <h1 className="font-display-lg text-[20px] leading-none text-on-surface uppercase tracking-wider">The Elite Club</h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-unit">Admin Dashboard</p>
            </div>
          </div>
        </div>
        <ul className="flex flex-col gap-unit flex-grow">
          {/* Navigation Items */}
          {navigationItems.map((item, index) => {
            const isActive = activeTab === item.id;
            return (
              <motion.li
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-stack-sm px-stack-md py-stack-sm font-interactive-md text-interactive-md transition-all duration-200 rounded-DEFAULT relative overflow-hidden group cursor-pointer
                    ${isActive ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}
                  `}
                >
                  <span className="material-symbols-outlined relative z-10 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="relative z-10 text-left flex-grow">{item.label}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-auto mb-stack-md px-stack-sm">
          <motion.button
            onClick={() => setActiveTab('tournaments')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-surface-container-low border border-primary text-primary font-interactive-md text-interactive-md py-stack-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            Manage Tournaments
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content Canvas */}
      <main className="ml-72 mt-16 p-margin-desktop bg-surface-container-lowest min-h-[calc(100vh-4rem)] relative">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" />}
          {activeTab === 'tournaments' && (
            <TournamentsTab 
              key="tournaments" 
              onManageRaces={(tournament) => {
                setSelectedTournament(tournament);
                setActiveTab('races');
              }}
              onManagePenaltyRules={(tournament) => {
                setSelectedTournament(tournament);
                setActiveTab('penalty_rules');
              }}
            />
          )}
          {activeTab === 'races' && (
            <RacesTab 
              key="races" 
              tournament={selectedTournament} 
              onBack={() => setActiveTab('tournaments')} 
            />
          )}
          {activeTab === 'penalty_rules' && (
            <PenaltyRulesTab 
              key="penalty_rules" 
              tournament={selectedTournament} 
              onBack={() => setActiveTab('tournaments')} 
            />
          )}
          {activeTab === 'referees' && <RefereesTab key="referees" />}
          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && activeTab !== 'tournaments' && activeTab !== 'races' && activeTab !== 'penalty_rules' && activeTab !== 'referees' && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center h-full min-h-[50vh] text-on-surface-variant font-interactive-md"
            >
              <div className="text-center">
                <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">construction</span>
                <p>This module is currently under construction.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}




