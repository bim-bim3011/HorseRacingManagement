import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function MainLayout({ children }) {
  const location = useLocation();
  const noLayoutRoutes = ['/login', '/register', '/admin', '/admin/dashboard'];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideLayout && <Header />}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </div>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default MainLayout;
