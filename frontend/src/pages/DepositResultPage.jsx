import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DepositResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  const isSuccess = status === 'PAID' || status === 'success';
  const isCancelled = status === 'cancelled';

  return (
    <div className="min-h-screen bg-surface-container-lowest py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-md w-full bg-surface/80 backdrop-blur-xl rounded-3xl border border-outline-variant/30 shadow-2xl p-8 text-center"
      >
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Payment Successful!</h1>
            <p className="text-on-surface-variant font-body mb-8">
              Your deposit has been processed successfully. The funds will be added to your wallet shortly.
            </p>
            {orderCode && (
              <p className="text-sm text-on-surface-variant mb-8 bg-surface-container-lowest py-2 px-4 rounded-lg inline-block">
                Order ID: <span className="font-bold">{orderCode}</span>
              </p>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Back to Wallet
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-error">cancel</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-on-surface mb-2">
              Payment unsuccessful
            </h1>
            <p className="text-on-surface-variant font-body mb-8">
              An error occurred during the payment process. Please try again.
            </p>
            {orderCode && (
              <p className="text-sm text-on-surface-variant mb-8 bg-surface-container-lowest py-2 px-4 rounded-lg inline-block">
                Order ID: <span className="font-bold">{orderCode}</span>
              </p>
            )}
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/deposit')}
                className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-surface-container-highest text-on-surface py-4 rounded-2xl font-bold text-lg hover:bg-surface-container-highest/80 transition-all"
              >
                Go to Home
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
