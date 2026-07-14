import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import OwnerOverviewTab from '../components/owner/OwnerOverviewTab';
import OwnerHorsesTab from '../components/owner/OwnerHorsesTab';
import OwnerJockeysTab from '../components/owner/OwnerJockeysTab';
import OwnerScheduleTab from '../components/owner/OwnerScheduleTab';
import OwnerResultsTab from '../components/owner/OwnerResultsTab';
import NotificationDropdown from '../components/common/NotificationDropdown';

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'overview', icon: 'dashboard', label: 'Stable Overview' },
    { id: 'horses', icon: 'pets', label: 'My Horses' },
    { id: 'jockeys', icon: 'person', label: 'Jockey Management' },
    { id: 'schedule', icon: 'calendar_month', label: 'Schedule & Entries' },
    { id: 'results', icon: 'emoji_events', label: 'Results & Earnings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex">
      {/* Side Navigation */}
      <motion.nav
        initial={{ x: -288 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 flex flex-col z-40 overflow-y-auto px-unit bg-surface border-r border-outline-variant"
      >
        <div className="py-stack-md px-stack-sm flex items-center gap-stack-sm border-b border-outline-variant mb-stack-md">
          <div className="flex items-center gap-stack-sm w-full">
            <Link to="/" className="w-10 h-10 bg-primary flex items-center justify-center rounded-DEFAULT shadow-sm cursor-pointer no-underline shrink-0">
              <span className="material-symbols-outlined text-surface">home</span>
            </Link>
            <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('overview')}>
              <h1 className="font-display-lg text-[20px] leading-none text-on-surface uppercase tracking-wider">My Stable</h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-unit">Owner Dashboard</p>
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
      </motion.nav>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <motion.header
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="sticky top-0 w-full h-16 flex justify-end items-center px-margin-desktop z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant"
        >
          <div className="flex items-center gap-gutter">
            <NotificationDropdown />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">help</span>
            </motion.button>
            
            {/* Avatar Dropdown */}
            <div className="relative ml-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg border-2 border-outline-variant hover:border-primary transition-colors cursor-pointer"
              >
                O
              </motion.div>
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
                      <p className="font-interactive-md text-on-surface">Horse Owner</p>
                      <p className="font-body-sm text-on-surface-variant text-sm truncate">My Stable</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="w-full text-left px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 flex items-center gap-2 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                        My Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-error hover:bg-error-container hover:text-on-error-container flex items-center gap-2 transition-colors cursor-pointer">
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

        {/* Content Canvas */}
        <main className="flex-1 p-margin-desktop bg-surface-container-lowest relative">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OwnerOverviewTab key="overview" onNavigate={setActiveTab} />}
            {activeTab === 'horses' && <OwnerHorsesTab key="horses" />}
            {activeTab === 'jockeys' && <OwnerJockeysTab key="jockeys" />}
            {activeTab === 'schedule' && <OwnerScheduleTab key="schedule" />}
            {activeTab === 'results' && <OwnerResultsTab key="results" />}
            
            {activeTab !== 'overview' && activeTab !== 'horses' && activeTab !== 'jockeys' && activeTab !== 'schedule' && activeTab !== 'results' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center h-full min-h-[50vh] text-on-surface-variant font-interactive-md"
              >
                <div className="text-center">
                  <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">construction</span>
                  <p>The {activeTab} module is currently under construction.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
