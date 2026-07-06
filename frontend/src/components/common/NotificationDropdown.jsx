import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

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

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    // Optional: Add logic to navigate or open modal based on notification type
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer ${
          isOpen ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
        }`}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center border border-surface">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-xl shadow-lg border border-outline-variant overflow-hidden z-50 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <div>
                <h3 className="font-display font-semibold text-on-surface">Notifications</h3>
                <p className="text-xs text-on-surface-variant font-body">You have {unreadCount} unread messages</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 hover:underline font-interactive-md transition-colors cursor-pointer bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-96 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-3 opacity-20">notifications_off</span>
                  <p className="font-interactive-md">No notifications yet</p>
                  <p className="text-xs mt-1">We'll let you know when something arrives!</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 ${
                        !notif.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        !notif.isRead ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {notif.type === 'HORSE_APPROVED' ? 'check_circle' : 
                           notif.type === 'HORSE_REJECTED' ? 'cancel' : 'notifications'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-interactive-md text-sm mb-0.5 truncate ${!notif.isRead ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                          {notif.title}
                        </h4>
                        <p className={`text-sm line-clamp-2 ${!notif.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          {notif.content}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-2 font-body flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-outline-variant bg-surface-container-lowest text-center">
                <button className="text-sm text-primary hover:underline font-interactive-md transition-colors cursor-pointer">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
