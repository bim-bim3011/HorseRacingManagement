import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { outboundAuthenticateApi } from '../api/authApi';

function AuthenticatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Prevent double-call in React StrictMode
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const code = searchParams.get('code');

    if (!code) {
      setStatus('error');
      setErrorMessage('No authorization code found. Please try logging in again.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const result = await outboundAuthenticateApi(code);

        // Save access token to Context/localStorage
        loginWithToken(result.accessToken);

        setStatus('success');

        // Navigate to home after a brief success animation
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
      }
    };

    exchangeCode();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <main className="flex-grow flex items-center justify-center relative py-8 px-4 md:px-10 overflow-hidden min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="bg-cover bg-center w-full h-full opacity-[0.03]"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKpB9c-6zZnj3be_iFxqarCGuGnbYlP4SNTRxJXG0VDlFHDzf-QMahdMAVbegKfIJGUzzz5j4K1gMA_GkJfY5jpgARZmsVgnGtLuJCzDm5zwsERA-j8SbOw9wIC_lnSWhlppEuAvnK9IxjrodaPosjxcHvS5JVw0HVQfytY-XH5J7mVo45XixhAdOdK0NH-bqVqlPYkOOMeTZ6EqL5aCjlYGNBlHWkvGzYYoIk_-GxDPeEXszokl_BMGpNJ5s8L3Y7SF9LhN06wdCP")',
          }}
          role="img"
          aria-label="Atmospheric horse racing track background"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 to-surface"></div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-lg border border-outline-variant p-10 shadow-[0_12px_32px_rgba(0,34,34,0.08)] text-center"
      >
        {/* Loading State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Animated horse icon */}
            <div className="relative w-20 h-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-[3px] border-outline-variant border-t-primary"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="material-symbols-outlined text-[32px] text-primary"
                >
                  trophy
                </motion.span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-headline-sm text-primary font-bold mb-2">
                Signing you in...
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Verifying your Google account
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '85%' }}
                transition={{ duration: 3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim rounded-full"
              />
            </div>

            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="material-symbols-outlined text-[40px] text-green-600"
              >
                check_circle
              </motion.span>
            </motion.div>

            <div>
              <h2 className="font-display text-headline-sm text-primary font-bold mb-2">
                Welcome!
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Authentication successful. Redirecting...
              </p>
            </div>

            {/* Full progress bar */}
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '85%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[40px] text-error">
                error
              </span>
            </motion.div>

            <div>
              <h2 className="font-display text-headline-sm text-error font-bold mb-2">
                Authentication Failed
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Link
                to="/login"
                className="flex-1 bg-primary text-on-primary font-body text-interactive-md font-semibold uppercase rounded py-3 text-center hover:bg-on-primary-fixed-variant transition-all duration-300 no-underline"
              >
                Back to Login
              </Link>
              <Link
                to="/"
                className="flex-1 bg-surface-container-lowest border border-outline-variant text-on-surface font-body text-interactive-md font-semibold uppercase rounded py-3 text-center hover:bg-surface-container-low transition-all duration-300 no-underline"
              >
                Go Home
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}

export default AuthenticatePage;
