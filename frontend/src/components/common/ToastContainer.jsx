import { AnimatePresence, motion } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';

export default function ToastContainer() {
  const { latestToast, clearToast } = useNotification();

  return (
    <div className="fixed top-20 right-4 z-[9999] pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {latestToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-80 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 flex gap-4 items-start relative overflow-hidden group"
          >
            {/* Type Indicator Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                notifications_active
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-on-surface font-semibold text-[15px] leading-tight mb-1 truncate">
                {latestToast.title}
              </h4>
              <p className="font-body text-sm text-on-surface-variant line-clamp-2">
                {latestToast.content}
              </p>
            </div>
            
            <button
              onClick={clearToast}
              className="text-on-surface-variant hover:text-error transition-colors cursor-pointer shrink-0 opacity-50 hover:opacity-100"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
