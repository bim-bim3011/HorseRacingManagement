import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/layout/PageTransition';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/common/ToastContainer';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthenticatePage from './pages/AuthenticatePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TournamentDetailPage from './pages/TournamentDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import JockeyDashboardPage from './pages/JockeyDashboardPage';
import RefereeDashboardPage from './pages/RefereeDashboardPage';
import DepositPage from './pages/DepositPage';
import DepositResultPage from './pages/DepositResultPage';
import LiveRacePage from './pages/LiveRacePage';
import RaceDetailPage from './pages/RaceDetailPage';
import HorseProfilePage from './pages/HorseProfilePage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/authenticate" element={<PageTransition><AuthenticatePage /></PageTransition>} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <PageTransition><UserProfilePage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/deposit" element={
            <ProtectedRoute>
              <PageTransition><DepositPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/deposit-result" element={
            <ProtectedRoute>
              <PageTransition><DepositResultPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={<PageTransition><AdminLoginPage /></PageTransition>} />
          <Route path="/admin/dashboard" element={
            <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]} redirectLogin="/admin">
              <PageTransition><AdminDashboardPage /></PageTransition>
            </RoleBasedRoute>
          } />
          <Route path="/owner/dashboard" element={
            <RoleBasedRoute allowedRoles={["ROLE_HORSE_OWNER"]}>
              <PageTransition><OwnerDashboardPage /></PageTransition>
            </RoleBasedRoute>
          } />
          <Route path="/jockey/dashboard" element={
            <RoleBasedRoute allowedRoles={["ROLE_JOCKEY"]}>
              <PageTransition><JockeyDashboardPage /></PageTransition>
            </RoleBasedRoute>
          } />

          <Route path="/unauthorized" element={<PageTransition><UnauthorizedPage /></PageTransition>} />
          <Route path="/tournaments/:id" element={<PageTransition><TournamentDetailPage /></PageTransition>} />
          <Route path="/races/:tournamentId/:raceId" element={<PageTransition><RaceDetailPage /></PageTransition>} />
          <Route path="/live-race/:tournamentId/:raceId" element={<PageTransition><LiveRacePage /></PageTransition>} />
          <Route path="/horses/:id" element={<PageTransition><HorseProfilePage /></PageTransition>} />
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer />
          <Routes>
            <Route path="/referee/dashboard" element={
              <RoleBasedRoute allowedRoles={["ROLE_REFEREE"]}>
                <RefereeDashboardPage />
              </RoleBasedRoute>
            } />
            <Route path="/*" element={<AnimatedRoutes />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
