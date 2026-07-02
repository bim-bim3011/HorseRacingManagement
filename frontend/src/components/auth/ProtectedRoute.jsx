import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isTokenExpired } from '../../utils/authUtils';

/**
 * ProtectedRoute — Route guard that requires authentication.
 *
 * - If not authenticated or token is expired → redirect to login
 * - If authenticated and token valid → render children
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.redirectTo="/login"] - Where to redirect unauthenticated users
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { accessToken, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Not authenticated at all
  if (!isAuthenticated || !accessToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Token is expired
  if (isTokenExpired(accessToken)) {
    // Clear the expired token
    logout();
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}
