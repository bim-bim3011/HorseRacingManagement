import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isTokenExpired, getRolesFromToken } from '../../utils/authUtils';

/**
 * RoleBasedRoute — Route guard that requires specific roles.
 *
 * - If not authenticated or token expired → redirect to redirectLogin
 * - If authenticated but wrong role → redirect to /unauthorized
 * - If authenticated and has required role → render children
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of allowed roles, e.g. ["ROLE_ADMIN"]
 * @param {string} [props.redirectLogin="/login"] - Where to redirect unauthenticated users
 */
export default function RoleBasedRoute({ children, allowedRoles = [], redirectLogin = '/login' }) {
  const { accessToken, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Not authenticated at all
  if (!isAuthenticated || !accessToken) {
    return <Navigate to={redirectLogin} state={{ from: location }} replace />;
  }

  // Token is expired
  if (isTokenExpired(accessToken)) {
    logout();
    return <Navigate to={redirectLogin} state={{ from: location }} replace />;
  }

  // Check roles
  const userRoles = getRolesFromToken(accessToken);
  const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
