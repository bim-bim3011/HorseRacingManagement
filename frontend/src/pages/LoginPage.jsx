import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGoogleAuthUrl } from '../configuration/configuration';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch {
      // Error is already set in AuthContext
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center relative py-8 px-4 md:px-10 overflow-hidden min-h-screen">
      {/* Background Image */}
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_12px_32px_rgba(0,34,34,0.08)]">
        {/* Back to Home */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-on-surface font-body text-label-caps font-bold uppercase hover:text-primary transition-colors no-underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            HOME
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-headline-sm sm:text-display-sm text-primary flex items-center justify-center gap-2 sm:gap-4 font-bold whitespace-nowrap">
            <span className="h-[1px] w-8 sm:w-12 bg-primary-fixed-dim hidden sm:block"></span>
            Welcome Back
            <span className="h-[1px] w-8 sm:w-12 bg-primary-fixed-dim hidden sm:block"></span>
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-sm font-body flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
            <button
              onClick={clearError}
              className="ml-auto hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase"
            >
              Username or Email *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-between items-center pt-2">
            <a
              href="#"
              className="font-body text-body-md text-on-surface-variant underline hover:text-secondary transition-colors"
            >
              Forgot your password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-body text-interactive-md font-semibold uppercase rounded py-4 mt-4 hover:bg-on-primary-fixed-variant transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                SIGNING IN...
              </span>
            ) : (
              'SIGN IN'
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 font-body text-label-caps font-bold text-outline uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => { window.location.href = getGoogleAuthUrl(); }}
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body text-interactive-md font-semibold uppercase rounded py-3 flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center font-body text-body-md text-on-surface">
          <span className="font-bold uppercase tracking-wider">DON&apos;T HAVE AN ACCOUNT?</span>
          <br />
          <Link to="/register" className="text-secondary font-bold hover:underline hover:text-primary mt-2 inline-block transition-colors duration-300">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
