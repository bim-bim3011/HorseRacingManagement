import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import { getAllTournaments } from '../../api/tournamentApi';
import { getMyProfile } from '../../api/userApi';

function Header() {
  const { isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Sub-component for Authentication Actions (Login/Register or Avatar dropdown)
  const AuthActions = ({ scrolled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);

    // Fetch balance when authenticated
    useEffect(() => {
      const fetchBalance = async () => {
        try {
          if (isAuthenticated) {
            const data = await getMyProfile();
            setWalletBalance(data.walletBalance);
          }
        } catch (error) {
          console.error("Failed to fetch balance", error);
        }
      };
      fetchBalance();
    }, [isAuthenticated]);

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const performLogout = async () => {
      setIsLoggingOut(true);
      await handleLogout();
      // We don't necessarily need to set it back to false if the component unmounts,
      // but it's safe to do so.
      setIsLoggingOut(false);
    };

    return (
      <div className="flex items-center justify-end min-w-[160px] min-h-[40px]">
        <AnimatePresence mode="wait">
          {isAuthenticated ? (
            <motion.div
              key="authenticated"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative flex items-center gap-3" 
              ref={dropdownRef}
            >
              {/* Wallet Balance Badge */}
              <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-full pl-3 pr-1 py-1 gap-3 shadow-sm hover:border-primary/50 transition-colors">
                <div className="flex flex-col justify-center">
                  <span className="font-display font-bold text-sm text-primary leading-tight">
                    {walletBalance != null ? walletBalance.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
                  </span>
                </div>
                <Link to="/deposit" className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-on-primary-fixed-variant transition-colors shadow-md no-underline">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </Link>
              </div>

              {/* Notification Bell */}
              <NotificationDropdown />

              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`transition-colors duration-200 cursor-pointer flex items-center ${isOpen ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
              >
                <span className={`material-symbols-outlined text-[24px] transition-transform duration-300 ${isOpen ? 'scale-110' : 'hover:scale-110'}`}>
                  account_circle
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 z-50 backdrop-blur-md origin-top-right"
                  >
                    <div className="px-4 py-2 mb-1 border-b border-outline-variant/20">
                      <p className="font-body text-label-caps font-bold text-on-surface-variant uppercase tracking-wider">Account</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 font-body text-body-md text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors no-underline"
                    >
                      <span className="material-symbols-outlined text-[20px]">person</span>
                      Profile
                    </Link>
                    <Link
                      to="#"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 font-body text-body-md text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors no-underline"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                      Settings
                    </Link>
                    {hasRole('ROLE_HORSE_OWNER') && (
                      <Link
                        to="/owner/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 font-body text-body-md text-primary font-bold hover:bg-primary/10 transition-colors no-underline"
                      >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        My Stable
                      </Link>
                    )}
                    <div className="border-t border-outline-variant/20 my-1"></div>
                    <button
                       onClick={performLogout}
                       disabled={isLoggingOut}
                       className="w-full flex items-center gap-3 text-left px-4 py-2.5 font-body text-body-md text-error hover:bg-error-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <svg className="animate-spin h-5 w-5 text-error" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                      )}
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="unauthenticated"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="hidden md:flex items-center gap-4"
            >
              <Link
                to="/login"
                className="font-body text-interactive-md font-semibold text-on-surface hover:text-primary transition-colors duration-200 uppercase tracking-widest no-underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`font-body text-interactive-md font-semibold px-6 py-2 transition-colors duration-300 uppercase tracking-widest no-underline ${
                  scrolled
                    ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-sm'
                    : 'bg-on-surface text-surface hover:bg-primary hover:text-on-primary shadow-sm'
                }`}
              >
                Register
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Sub-component for the Brand Logo and Text
  const Brand = ({ scrolled }) => (
    <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
      <div className={`bg-primary rounded-sm flex items-center justify-center transition-all duration-300 ${scrolled ? 'w-5 h-5' : 'w-6 h-6'}`}>
        <div className={`bg-surface rounded-full transition-all duration-300 ${scrolled ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
      </div>
      <span className={`font-display font-bold text-on-surface uppercase tracking-tight transition-all duration-300 ${scrolled ? 'text-[20px] md:text-[24px]' : 'text-[24px] md:text-[32px]'}`}>
        The elite club
      </span>
    </Link>
  );

  const TournamentsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
      const fetchTournaments = async () => {
        try {
          setLoading(true);
          const data = await getAllTournaments();
          const thisYearTournaments = (data || []).filter(t => {
             const tYear = new Date(t.startDate).getFullYear();
             return tYear === currentYear;
          });
          setTournaments(thisYearTournaments);
        } catch (error) {
          console.error("Failed to fetch tournaments:", error);
        } finally {
          setLoading(false);
        }
      };
      if (isOpen && tournaments.length === 0) {
        fetchTournaments();
      }
    }, [isOpen, tournaments.length, currentYear]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="relative flex items-center h-full" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`font-body text-label-caps font-bold transition-colors duration-200 tracking-[0.15em] uppercase whitespace-nowrap flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 m-0 ${isOpen ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Tournaments
          <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
            expand_more
          </span>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 top-[180%] mt-2 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 z-50 backdrop-blur-md"
            >
              <div className="px-4 py-2 mb-1 border-b border-outline-variant/20">
                <p className="font-body text-label-caps font-bold text-on-surface-variant uppercase tracking-wider">Upcoming in {currentYear}</p>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : tournaments.length > 0 ? (
                  tournaments.map(tournament => (
                    <Link
                      key={tournament.id}
                      to={`/tournaments/${tournament.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 hover:bg-surface-container-low transition-colors no-underline group"
                    >
                      <p className="font-body text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors mb-1 truncate">{tournament.name}</p>
                      <p className="font-body text-label-sm text-on-surface-variant truncate">
                        {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-on-surface-variant font-body">No upcoming tournaments</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <header className={`w-full sticky z-50 transition-all duration-500 ease-in-out ${isScrolled ? '-top-20 bg-surface/95 backdrop-blur-md shadow-md border-b border-outline-variant/50' : 'top-0 bg-surface border-b border-outline-variant'}`}>
      
      {/* Top Row - Main Header (Scrolls out of view via -top-20) */}
      <div className="w-full h-20">
        <div className="flex justify-between items-center w-full px-4 md:px-10 max-w-[1280px] mx-auto h-20">
          <Brand scrolled={false} />
          
          <div className="flex items-center gap-6">
            <AuthActions scrolled={false} />
            <div className="flex items-center gap-4 text-on-surface">
              {/* Removed search icon */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Navigation (Becomes main sticky header when scrolled) */}
      <div className={`w-full transition-all duration-500 ease-in-out ${isScrolled ? 'bg-transparent border-t-0' : 'bg-surface-container-low border-t border-outline-variant/30 hidden md:block'}`}>
        <div className={`flex justify-between items-center w-full px-4 md:px-10 max-w-[1280px] mx-auto transition-all duration-500 ease-in-out ${isScrolled ? 'h-16' : 'h-14'}`}>
          
          {/* Left Side: Brand (if scrolled) + Nav Links */}
          <div className="flex items-center gap-8">
            <div className={`transition-all duration-500 ease-in-out overflow-hidden flex items-center ${isScrolled ? 'max-w-[300px] opacity-100 pr-6 border-r border-outline-variant/30' : 'max-w-0 opacity-0 pr-0 border-r-0'}`}>
               <Brand scrolled={true} />
            </div>
            
            <nav className="flex items-center gap-6 md:gap-8">
              <TournamentsDropdown />
              <Link to="#" className="font-body text-label-caps font-bold text-on-surface-variant hover:text-primary transition-colors duration-200 tracking-[0.15em] uppercase no-underline whitespace-nowrap">
                Races
              </Link>
              <Link to="#" className="font-body text-label-caps font-bold text-on-surface-variant hover:text-primary transition-colors duration-200 tracking-[0.15em] uppercase no-underline whitespace-nowrap">
                Results
              </Link>
            </nav>
          </div>

          {/* Right Side: Auth + Search (if scrolled) */}
          <div className={`flex items-center gap-6 transition-all duration-500 ease-in-out ${isScrolled ? 'max-w-[400px] opacity-100 overflow-visible' : 'max-w-0 opacity-0 overflow-hidden pointer-events-none'}`}>
             <AuthActions scrolled={true} />
             {/* Removed search icon */}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
