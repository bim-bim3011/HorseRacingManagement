import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminLoginApi } from '../api/authApi';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const clearError = () => setError(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminLoginApi(username, password);
      // Save token to localStorage and update AuthContext
      localStorage.setItem('accessToken', result.accessToken);
      // Trigger a manual re-render of AuthContext by dispatching token-refreshed event
      window.dispatchEvent(new CustomEvent('token-refreshed', { detail: result.accessToken }));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased text-on-surface bg-surface">
      <header className="bg-surface border-b border-outline-variant w-full">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 mx-auto max-w-[1280px] w-full">
          <div className="font-display text-2xl font-semibold text-primary tracking-tight">
            Elite Racing Admin
          </div>
          <div>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-lg p-8 border border-outline-variant shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-tr from-primary/10 via-transparent to-transparent"></div>
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-on-surface tracking-tight font-bold">DERBY HUB</h1>
            <p className="font-body text-base text-on-surface-variant mt-2">Administrative Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded text-sm font-body flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
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

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block font-body text-xs font-bold tracking-widest text-on-surface mb-2 uppercase" htmlFor="admin-username">Username</label>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body text-base px-4 py-3 text-on-surface transition-colors duration-300 placeholder-on-surface-variant/50" 
                id="admin-username" 
                name="username" 
                placeholder="Enter username" 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-body text-xs font-bold tracking-widest text-on-surface mb-2 uppercase" htmlFor="admin-password">Password</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body text-base px-4 py-3 text-on-surface transition-colors duration-300 placeholder-on-surface-variant/50 pr-12" 
                  id="admin-password" 
                  name="password" 
                  placeholder="Enter password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button 
                className="w-full bg-on-background text-on-primary font-body text-sm font-semibold uppercase tracking-wider py-4 rounded hover:bg-primary transition-colors duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    SIGNING IN...
                  </span>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminLoginPage;

