import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registerSpectatorApi, registerHorseOwnerApi, registerJockeyApi } from '../api/registerApi';
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

  const clearError = () => setError('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(1);
    clearError();
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    clearError();

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
      if (role === 'spectator') {
        await registerSpectatorApi({ username, email, password });
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else if (role === 'horseOwner') {
        await registerHorseOwnerApi({ username, email, password, fullName: ownerFullName, phone });
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else if (role === 'jockey') {
        const res = await registerJockeyApi({ username, email, password });
        setJockeyId(res.id);
        
        // Auto-login to get JWT token before proceeding to profile update
        await loginApi(username, password);
        
        // Proceed to Step 2
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          {step > 0 && !success && (
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
            {step === 0 ? 'Select Role' : step === 1 ? 'Register' : 'Jockey Profile'}
            <span className="h-[1px] w-8 sm:w-12 bg-primary-fixed-dim hidden sm:block"></span>
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-2">
            {step === 0 ? 'Choose how you want to experience the track.' : step === 1 ? `Create your ${role === 'horseOwner' ? 'Horse Owner' : role} account.` : 'Complete your competition profile.'}
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded text-sm font-body flex items-center gap-2 animate-[fadeIn_0.3s_ease-in-out]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {step === 2 ? 'Profile updated! Redirecting...' : 'Account created successfully! Redirecting...'}
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
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading || success} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-outline/50" placeholder="e.g. Secretariat1973" />
                </div>
                <div>
                  <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Email Address *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || success} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-outline/50" placeholder="name@domain.com" />
                </div>
                
                {role === 'horseOwner' && (
                  <>
                    <div>
                      <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Full Name *</label>
                      <input type="text" value={ownerFullName} onChange={(e) => setOwnerFullName(e.target.value)} required disabled={isLoading || success} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Phone *</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isLoading || success} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading || success} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-label-caps font-bold text-on-surface-variant mb-1 uppercase">Confirm *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading || success} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
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
