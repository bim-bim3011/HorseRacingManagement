import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registerSpectatorApi, registerHorseOwnerApi, registerJockeyApi, verifyAccountApi, resendOtpApi } from '../api/registerApi';
import { updateJockeyCompetitionProfileApi } from '../api/jockeyApi';
import { loginApi } from '../api/authApi';
import { getGoogleAuthUrl } from '../configuration/configuration';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function RegisterPage() {
  const [step, setStep] = useState(0); // 0: Role Selection, 1: Basic Info, 2: Jockey Profile
  const [role, setRole] = useState(null); // 'spectator', 'horseOwner', 'jockey'

  // Basic Info State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Horse Owner specific
  const [ownerFullName, setOwnerFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Jockey Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jockeyFullName, setJockeyFullName] = useState('');
  const [experienceYear, setExperienceYear] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [file, setFile] = useState(null);
  const [jockeyId, setJockeyId] = useState(null);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Validation State
  const [fieldErrors, setFieldErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState('');

  const clearError = () => { setError(''); setInfoMessage(''); };

  useEffect(() => {
    let timer;
    if (step === 1.5 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(1);
    clearError();
    setCountdown(60);
    setCanResend(false);
  };

  const validateForm = () => {
    const errors = {};
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!usernameRegex.test(username)) {
      errors.username = 'Username must be 3-20 characters (letters, numbers, underscores).';
    }
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 8 chars (1 uppercase, 1 lowercase, 1 number, 1 special char).';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (role === 'horseOwner') {
      if (!ownerFullName.trim()) {
        errors.ownerFullName = 'Full name is required.';
      }
      if (!phoneRegex.test(phone)) {
        errors.phone = 'Please enter a valid phone number (10-11 digits).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (role === 'spectator') {
        await registerSpectatorApi({ username, email, password });
        setStep(1.5);
      } else if (role === 'horseOwner') {
        await registerHorseOwnerApi({ username, email, password, fullName: ownerFullName, phone });
        setStep(1.5);
      } else if (role === 'jockey') {
        const res = await registerJockeyApi({ username, email, password });
        setJockeyId(res.id);
        setStep(1.5);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Current empty, move focus to previous
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = e.key;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpChange = (index, value) => {
    // This mostly handles mobile inputs where onKeyDown might not fire reliably for virtual keyboards
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take the last character in case of double input
    setOtp(newOtp);
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    clearError();

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyAccountApi(email, otpCode);
      setSuccess(true);

      if (role === 'jockey') {
        // Auto login for jockey to continue profile setup
        await loginApi(username, password);
        setTimeout(() => {
          setSuccess(false);
          setStep(2);
        }, 1500);
      } else {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    clearError();
    
    try {
      await resendOtpApi(email);
      setInfoMessage('A new 6-digit code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJockeyProfileSubmit = async (e) => {
    e.preventDefault();
    clearError();

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      if (jockeyFullName) formData.append('fullName', jockeyFullName);
      if (experienceYear) formData.append('experience_year', experienceYear);
      formData.append('height', height);
      formData.append('weight', weight);
      formData.append('gender', gender);
      if (dob) formData.append('dob', dob);
      if (file) formData.append('file', file);

      await updateJockeyCompetitionProfileApi(jockeyId, formData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message || 'Profile update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Variants for framer-motion transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  return (
    <main className="flex-grow flex items-center justify-center relative py-8 px-4 md:px-10 overflow-x-hidden min-h-screen">
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

      {/* Registration Container */}
      <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_12px_32px_rgba(0,34,34,0.08)] transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(0,34,34,0.12)]">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-on-surface font-body text-label-caps font-bold uppercase hover:text-primary transition-all duration-300 no-underline group"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:-translate-x-1">
              arrow_back
            </span>
            HOME
          </Link>
          {step > 0 && step !== 1.5 && !success && (
            <button
              onClick={() => step === 2 ? setStep(1) : setStep(0)}
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold uppercase cursor-pointer"
            >
              Change Role
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-display-lg text-primary flex items-center justify-center gap-4 font-bold">
            <span className="h-[1px] w-8 sm:w-12 bg-primary-fixed-dim hidden sm:block"></span>
            {step === 0 ? 'Select Role' : step === 1 ? 'Register' : step === 1.5 ? 'Verification' : 'Jockey Profile'}
            <span className="h-[1px] w-8 sm:w-12 bg-primary-fixed-dim hidden sm:block"></span>
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-2">
            {step === 0 ? 'Choose how you want to experience the track.' : step === 1 ? `Create your ${role === 'horseOwner' ? 'Horse Owner' : role} account.` : step === 1.5 ? 'Verify your email address.' : 'Complete your competition profile.'}
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded text-sm font-body flex items-center gap-2 animate-[fadeIn_0.3s_ease-in-out]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {step === 2 ? 'Profile updated! Redirecting...' : step === 1.5 ? (role === 'jockey' ? 'Verified! Preparing profile setup...' : 'Account activated successfully! Redirecting...') : 'Success!'}
          </div>
        )}

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

        {infoMessage && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded text-sm font-body flex items-center gap-2 animate-[fadeIn_0.3s_ease-in-out]">
            <span className="material-symbols-outlined text-[18px]">info</span>
            {infoMessage}
            <button
              onClick={() => setInfoMessage('')}
              className="ml-auto hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: ROLE SELECTION */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <button onClick={() => handleRoleSelect('spectator')} className="p-4 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container flex items-center gap-4 transition-all duration-300 group text-left cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">stadium</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Spectator</h3>
                  <p className="text-on-surface-variant text-sm">Follow races, view results, and enjoy the show.</p>
                </div>
              </button>

              <button onClick={() => handleRoleSelect('jockey')} className="p-4 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container flex items-center gap-4 transition-all duration-300 group text-left cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">sports_score</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Jockey</h3>
                  <p className="text-on-surface-variant text-sm">Ride to victory and build your racing career.</p>
                </div>
              </button>

              <button onClick={() => handleRoleSelect('horseOwner')} className="p-4 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container flex items-center gap-4 transition-all duration-300 group text-left cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">military_tech</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Horse Owner</h3>
                  <p className="text-on-surface-variant text-sm">Manage your stable and register horses in tournaments.</p>
                </div>
              </button>


              <div className="mt-4 text-center font-body text-body-md text-on-surface">
                <span className="font-bold uppercase tracking-wider">Already have an account?</span>
                <br />
                <Link to="/login" className="text-secondary font-bold hover:underline hover:text-primary mt-2 inline-block transition-colors duration-300">
                  Log in now
                </Link>
              </div>
            </motion.div>
          )}

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleBasicSubmit} className="space-y-4">
                <div>
                  <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Username *</label>
                  <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: '' })); }} required disabled={isLoading || success} className={`w-full bg-surface-container-lowest border rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all duration-300 placeholder:text-outline/50 ${fieldErrors.username ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'}`} placeholder="e.g. Secretariat1973" />
                  {fieldErrors.username && <p className="text-error text-xs mt-1 animate-[fadeIn_0.3s]">{fieldErrors.username}</p>}
                </div>
                <div>
                  <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Email Address *</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' })); }} required disabled={isLoading || success} className={`w-full bg-surface-container-lowest border rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all duration-300 placeholder:text-outline/50 ${fieldErrors.email ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'}`} placeholder="name@domain.com" />
                  {fieldErrors.email && <p className="text-error text-xs mt-1 animate-[fadeIn_0.3s]">{fieldErrors.email}</p>}
                </div>

                {role === 'horseOwner' && (
                  <>
                    <div>
                      <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Full Name *</label>
                      <input type="text" value={ownerFullName} onChange={(e) => { setOwnerFullName(e.target.value); if (fieldErrors.ownerFullName) setFieldErrors(prev => ({ ...prev, ownerFullName: '' })); }} required disabled={isLoading || success} className={`w-full bg-surface-container-lowest border rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all ${fieldErrors.ownerFullName ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'}`} />
                      {fieldErrors.ownerFullName && <p className="text-error text-xs mt-1 animate-[fadeIn_0.3s]">{fieldErrors.ownerFullName}</p>}
                    </div>
                    <div>
                      <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Phone *</label>
                      <input type="text" value={phone} onChange={(e) => { setPhone(e.target.value); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' })); }} required disabled={isLoading || success} className={`w-full bg-surface-container-lowest border rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all ${fieldErrors.phone ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'}`} />
                      {fieldErrors.phone && <p className="text-error text-xs mt-1 animate-[fadeIn_0.3s]">{fieldErrors.phone}</p>}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' })); }} required disabled={isLoading || success} className={`w-full bg-surface-container-lowest border rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all pr-10 ${fieldErrors.password ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-error text-xs mt-1 animate-[fadeIn_0.3s]">{fieldErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Confirm *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' })); }} required disabled={isLoading || success} className={`w-full bg-surface-container-lowest border rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all pr-10 ${fieldErrors.confirmPassword ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-error text-xs mt-1 animate-[fadeIn_0.3s]">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>

                <button type="submit" disabled={isLoading || success} className="w-full bg-primary text-on-primary font-body text-interactive-md font-semibold uppercase rounded py-4 mt-4 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer disabled:opacity-60">
                  {isLoading ? 'PROCESSING...' : role === 'jockey' ? 'CONTINUE TO PROFILE' : 'CREATE ACCOUNT'}
                </button>

                {role === 'spectator' && (
                  <>
                    <div className="relative flex items-center py-4 mt-2">
                      <div className="flex-grow border-t border-outline-variant"></div>
                      <span className="flex-shrink-0 mx-4 font-body text-label-caps font-bold text-outline uppercase">
                        OR
                      </span>
                      <div className="flex-grow border-t border-outline-variant"></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { window.location.href = getGoogleAuthUrl(); }}
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body text-interactive-md font-semibold uppercase rounded py-3 flex items-center justify-center gap-3 hover:bg-surface-container-low transition-all duration-300 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Register with Google
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          )}

          {/* STEP 1.5: OTP VERIFICATION */}
          {step === 1.5 && (
            <motion.div
              key="step1.5"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
                </div>
                <p className="font-body text-body-md text-on-surface">
                  We've sent a 6-digit code to <span className="font-bold text-primary">{email}</span>.
                  <br />
                  Please enter it below to verify your account.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-8">
                <div className="flex justify-center gap-2 sm:gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      disabled={isLoading || success}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-surface-container-lowest border-2 border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  ))}
                </div>

                <button type="submit" disabled={isLoading || success || otp.join('').length < 6} className="w-full bg-primary text-on-primary font-body text-interactive-md font-semibold uppercase rounded py-4 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {isLoading ? 'VERIFYING...' : 'VERIFY ACCOUNT'}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm font-body text-on-surface-variant">
                    Didn't receive the code?{' '}
                    {countdown > 0 ? (
                      <span className="text-outline font-bold">Resend in {countdown}s</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-primary font-bold hover:underline cursor-pointer disabled:opacity-50 transition-all duration-300"
                      >
                        Resend Code
                      </button>
                    )}
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: JOCKEY PROFILE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleJockeyProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">First Name *</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Last Name *</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Full Name</label>
                    <input type="text" value={jockeyFullName} onChange={(e) => setJockeyFullName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Experience (Years)</label>
                    <input type="number" value={experienceYear} onChange={(e) => setExperienceYear(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Height (cm) *</label>
                    <input type="number" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)} required className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Weight (kg) *</label>
                    <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Gender *</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Date of Birth</label>
                    <DatePicker
                      selected={dob ? new Date(dob) : null}
                      onChange={(date) => {
                        if (date) {
                          // Format to YYYY-MM-DD
                          const formattedDate = date.toISOString().split('T')[0];
                          setDob(formattedDate);
                        } else {
                          setDob('');
                        }
                      }}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      placeholderText="Select Date of Birth"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Avatar / Certificate</label>
                  <input type="file" onChange={handleFileChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                </div>

                <button type="submit" disabled={isLoading || success} className="w-full bg-primary text-on-primary font-body text-interactive-md font-semibold uppercase rounded py-4 mt-4 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer disabled:opacity-60">
                  {isLoading ? 'SAVING PROFILE...' : 'COMPLETE REGISTRATION'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default RegisterPage;
