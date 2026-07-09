import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface p-4 md:p-10">
      {/* Animated Shield Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-28 h-28 rounded-full bg-error-container flex items-center justify-center mb-8"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="material-symbols-outlined text-error"
          style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}
        >
          shield_lock
        </motion.span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-3"
      >
        Access Denied
      </motion.h1>

      {/* Error Code */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-body text-lg text-error font-semibold mb-2"
      >
        403 — Forbidden
      </motion.p>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-body text-base text-on-surface-variant text-center max-w-md mb-10"
      >
        You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary font-body text-sm font-semibold uppercase tracking-wider px-6 py-3 rounded hover:bg-on-primary-fixed-variant transition-colors no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Go Home
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm font-semibold uppercase tracking-wider px-6 py-3 rounded hover:bg-surface-container transition-colors no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          Sign In
        </Link>
      </motion.div>
    </div>
  );
}
