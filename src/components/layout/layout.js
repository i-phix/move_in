import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Nav from './nav';
import Header from './header';
import Footer from './footer';
import { getItem, clearStorage } from '../../utils/localStorage';
import { makeRequest } from '../../utils/makeRequest';
import { checkTokenExpirationURL } from '../../utils/urls';

function Layout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const validateSession = async () => {
      const user = await getItem('AGENTUSER');

      if (!user?.authToken) {
        // No session — decide which login page to send to based on current path
        const isLandlordPath = location.pathname.includes('/move-in/landlord');
        const isAdminPath = location.pathname.includes('/move-in/admin');
        navigate(isAdminPath ? '/admin-login' : (isLandlordPath ? '/landlord-login' : '/login'), { replace: true });
        return;
      }

      // Token expiry check
      try {
        const res = await makeRequest(checkTokenExpirationURL, 'POST', { token: user.authToken });
        if (res.success && res.data?.data === true) {
          await clearStorage();
          navigate('/login', { replace: true });
          return;
        }
      } catch (_) {
        // Network error — leave user in place; API calls will surface 401s
      }

      // Role-based redirect guard
      const role             = user.role;
      const onAdminPath      = location.pathname.startsWith('/move-in/admin');
      const onLandlordPath   = location.pathname.startsWith('/move-in/landlord');
      const onTenantPath     = location.pathname.startsWith('/move-in') && !onLandlordPath && !onAdminPath;

      if (role === 'admin' && !onAdminPath) {
        navigate('/move-in/admin/dashboard', { replace: true });
      } else if (role === 'landlord' && !onLandlordPath) {
        navigate('/move-in/landlord/dashboard', { replace: true });
      } else if (role === 'tenant' && !onTenantPath) {
        navigate('/move-in/dashboard', { replace: true });
      }
    };

    validateSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-shell">
      <Nav />
      <div className="app-main">
        <Header />
        <main className="page-wrap">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
