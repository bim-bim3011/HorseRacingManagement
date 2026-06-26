import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSpectatorApi } from '../api/registerApi';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const clearError = () => setError('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await registerSpectatorApi({ username, email, password });
      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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

      {/* Registration Card */}
      <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_12px_32px_rgba(0,34,34,0.08)] transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(0,34,34,0.12)]">
        {/* Back to Home */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-on-surface font-body text-label-caps font-bold uppercase hover:text-primary transition-all duration-300 no-underline group"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:-translate-x-1">
              arrow_back
            </span>
            HOME
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-display-lg text-primary flex items-center justify-center gap-4 font-bold">
            <span className="h-[1px] w-12 bg-primary-fixed-dim hidden sm:block"></span>
            Register
            <span className="h-[1px] w-12 bg-primary-fixed-dim hidden sm:block"></span>
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-2">
            Create your account to join the Elite.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded text-sm font-body flex items-center gap-2 animate-[fadeIn_0.3s_ease-in-out]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Account created successfully! Redirecting to login...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-sm font-body flex items-center gap-2 animate-[fadeIn_0.3s_ease-in-out]">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
            <button
              onClick={clearError}
              className="ml-auto hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label
              htmlFor="register-username"
              className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase"
            >
              Username *
            </label>
            <input
              id="register-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Secretariat1973"
              required
              disabled={isLoading || success}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-outline/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="register-email"
              className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase"
            >
              Email Address *
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              disabled={isLoading || success}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-outline/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="register-password"
              className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                disabled={isLoading || success}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 pr-12 placeholder:text-outline/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase"
            >
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="register-confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                disabled={isLoading || success}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 pr-12 placeholder:text-outline/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-primary text-on-primary font-body text-interactive-md font-semibold uppercase rounded py-4 mt-4 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm hover:shadow-md"
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
                CREATING ACCOUNT...
              </span>
            ) : (
              'CREATE ACCOUNT'
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

          {/* Google Sign Up */}
          <button
            type="button"
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body text-interactive-md font-semibold uppercase rounded py-3 flex items-center justify-center gap-3 hover:bg-surface-container-low hover:border-outline active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer shadow-sm hover:shadow-md"
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
            Sign up with Google
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center font-body text-body-md text-on-surface">
          <span className="font-bold uppercase tracking-wider">Already have an account?</span>
          <br />
          <Link
            to="/login"
            className="text-secondary font-bold hover:underline hover:text-primary mt-2 inline-block transition-colors duration-300"
          >
            Log in now
          </Link>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
