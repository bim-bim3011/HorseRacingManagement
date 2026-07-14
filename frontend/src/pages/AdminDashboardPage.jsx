import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OverviewTab from '../components/admin/OverviewTab';
import TournamentsTab from '../components/admin/TournamentsTab';
import RefereesTab from '../components/admin/RefereesTab';
import ApprovalsTab from '../components/admin/ApprovalsTab';
import TournamentManagementView from '../components/admin/TournamentManagementView';
import WithdrawalsTab from '../components/admin/WithdrawalsTab';
import NotificationDropdown from '../components/common/NotificationDropdown';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigationItems = [
    { id: 'overview', icon: 'dashboard', label: 'System Overview' },
    { id: 'tournaments', icon: 'calendar_today', label: 'Tournament Scheduling' },
    { id: 'horse_approvals', icon: 'how_to_reg', label: 'Horse Approvals' },
    { id: 'referees', icon: 'assignment_ind', label: 'Referee Management' },
    { id: 'withdrawals', icon: 'payments', label: 'Withdrawal Approvals' }
  ];

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* Top App Bar */}
      <motion.header
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 right-0 h-16 flex justify-between items-center px-margin-desktop z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-18rem)]'}`}
      >
        <div className="flex items-center gap-stack-md">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {/* Search Bar placeholder */}
          <div className="relative hidden md:block group">
            <span className="material-symbols-outlined absolute left-unit top-1/2 -translate-y-1/2 text-on-surface-variant text-interactive-md transition-colors group-focus-within:text-primary">search</span>
            <input className="bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-4 py-2 font-interactive-md text-interactive-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-64" placeholder="Search..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-gutter">
          <NotificationDropdown />
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`transition-colors duration-200 cursor-pointer flex items-center ${isProfileDropdownOpen ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[24px] transition-transform duration-300 ${isProfileDropdownOpen ? 'scale-110' : 'hover:scale-110'}`}>
                account_circle
              </span>
            </motion.button>
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
        className={`fixed left-0 top-0 h-full flex flex-col z-50 overflow-y-auto bg-surface border-r border-outline-variant transition-all duration-300 ${isSidebarCollapsed ? 'w-20 px-2' : 'w-72 px-unit'}`}
      >
        <div className={`py-stack-md flex items-center border-b border-outline-variant mb-stack-md ${isSidebarCollapsed ? 'justify-center px-0' : 'px-stack-sm gap-stack-sm'}`}>
          <div className={`flex items-center w-full ${isSidebarCollapsed ? 'justify-center' : 'gap-stack-sm'}`}>
            <Link to="/" className="w-10 h-10 bg-primary flex items-center justify-center rounded-DEFAULT shadow-sm cursor-pointer no-underline shrink-0 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-md group">
              <span className="material-symbols-outlined text-surface transition-transform duration-300 group-hover:scale-110">home</span>
            </Link>
            {!isSidebarCollapsed && (
              <div className="flex flex-col cursor-pointer overflow-hidden whitespace-nowrap" onClick={() => setActiveTab('overview')}>
                <h1 className="font-display-lg text-[20px] leading-none text-on-surface uppercase tracking-wider">The Elite Club</h1>
                <p className="font-label-caps text-label-caps text-on-surface-variant mt-unit">Admin Dashboard</p>
              </div>
            )}
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
                  title={isSidebarCollapsed ? item.label : ""}
                  className={`w-full flex items-center py-stack-sm font-interactive-md text-interactive-md transition-all duration-200 rounded-DEFAULT relative group cursor-pointer
                    ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-stack-sm px-stack-md'}
                    ${isActive ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}
                  `}
                >
                  <span className="material-symbols-outlined relative z-10 group-hover:scale-110 transition-transform">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="relative z-10 text-left flex-grow whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
        <div className={`mt-auto mb-stack-md ${isSidebarCollapsed ? 'px-0' : 'px-stack-sm'}`}>
          <motion.button
            onClick={() => setActiveTab('tournaments')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={isSidebarCollapsed ? "Manage Tournaments" : ""}
            className={`w-full bg-surface-container-low border border-primary text-primary font-interactive-md text-interactive-md py-stack-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
          >
            {isSidebarCollapsed ? (
              <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            ) : (
              "Manage Tournaments"
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content Canvas */}
      <main className={`mt-16 p-margin-desktop bg-surface-container-lowest min-h-[calc(100vh-4rem)] relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" />}
          {activeTab === 'tournaments' && (
            <TournamentsTab 
              key="tournaments" 
              onManage={(tournament) => {
                setSelectedTournament(tournament);
                setActiveTab('tournament_detail');
              }}
            />
          )}
          {activeTab === 'referees' && <RefereesTab key="referees" />}
          {activeTab === 'horse_approvals' && <ApprovalsTab key="horse_approvals" />}
          {activeTab === 'tournament_detail' && (
            <TournamentManagementView
              key="tournament_detail"
              tournament={selectedTournament}
              onBack={() => setActiveTab('tournaments')}
            />
          )}
          {activeTab === 'withdrawals' && <WithdrawalsTab key="withdrawals" />}
          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && activeTab !== 'withdrawals' && activeTab !== 'tournaments' && activeTab !== 'referees' && activeTab !== 'horse_approvals' && activeTab !== 'tournament_detail' && (
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




