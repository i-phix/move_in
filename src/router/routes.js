import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../components/move_in/landing/LandingPage';
import Login from '../components/authentication/login';
import Register from '../components/authentication/register';
import ForgotPassword from '../components/authentication/forgotPassword';
import CodeVerification from '../components/authentication/codeVerification';
import ResetPassword from '../components/authentication/resetPassword';
import VerifyEmail from '../components/authentication/VerifyEmail';
import LandlordLogin from '../components/authentication/LandlordLogin';
import LandlordRegister from '../components/authentication/LandlordRegister';
import LandlordEntry from '../components/authentication/LandlordEntry';
import AdminLogin from '../components/authentication/AdminLogin';
import Layout from '../components/layout/layout';
import Dashboard from '../components/move_in/dashboard/dashboard';
import Tenants from '../components/move_in/tenants/tenants';
import Units from '../components/move_in/units/units';
import Error404Page from '../components/error/Error404Page';
import PreferenceWizard from '../components/move_in/preferences/PreferenceWizard';
import ListingsPage from '../components/move_in/listings/ListingsPage';
import UnitDetailPage from '../components/move_in/listings/UnitDetailPage';
import MyApplications from '../components/move_in/applications/my_applications';
import Profile from '../components/move_in/profile/profile';
import Viewings from '../components/move_in/viewing/viewings';
import Reservations from '../components/move_in/reservations/reservations';
import Notifications from '../components/move_in/notifications/notifications';
import Payments from '../components/move_in/payments/payments';
import Messaging from '../components/move_in/messaging/messaging';
import Checklists from '../components/move_in/checklists/checklists';
import HandoverQueue from '../components/move_in/handover/handover';
import LandlordDashboard from '../components/move_in/landlord/LandlordDashboard';
import LandlordUnits from '../components/move_in/landlord/LandlordUnits';
import LandlordApplications from '../components/move_in/landlord/LandlordApplications';
import LandlordViewings from '../components/move_in/landlord/LandlordViewings';
import LandlordReservations from '../components/move_in/landlord/LandlordReservations';
import LandlordMessages from '../components/move_in/landlord/LandlordMessages';
import AccountPage from '../components/move_in/account/AccountPage';
import AdminDashboard from '../components/move_in/admin/dashboard';
import AdminListings from '../components/move_in/admin/listings';
import AdminApplications from '../components/move_in/admin/applications';
import AdminCustomers from '../components/move_in/admin/customers';
import AdminPreferences from '../components/move_in/admin/preferences';
import AdminLandlords from '../components/move_in/admin/landlords';
import AdminViewings from '../components/move_in/admin/viewings';
import AdminReservations from '../components/move_in/admin/reservations';
import AdminAuditLogs from '../components/move_in/admin/audit_logs';
import AdminDeals from '../components/move_in/admin/deals';

const router = createBrowserRouter(
  [
    { path: '/', element: <LandingPage />, errorElement: <Error404Page /> },

    // Tenant auth
    { path: '/login',             element: <Login /> },
    { path: '/register',          element: <Register /> },
    { path: '/forgot-password',   element: <ForgotPassword /> },
    { path: '/code-verification', element: <CodeVerification /> },
    { path: '/reset-password',    element: <ResetPassword /> },
    { path: '/verify-email/:token', element: <VerifyEmail /> },

    // Landlord auth
    { path: '/landlord-login',    element: <LandlordLogin /> },
    { path: '/landlord-register', element: <LandlordRegister /> },
    { path: '/landlord-entry',    element: <LandlordEntry /> },
    { path: '/admin-login',       element: <AdminLogin /> },

    // Public
    { path: '/preferences',       element: <PreferenceWizard /> },
    { path: '/listings',          element: <ListingsPage /> },
    { path: '/listings/:id',      element: <UnitDetailPage /> },

    // Tenant protected pages
    {
      path: '/move-in',
      element: <Layout />,
      children: [
        { path: 'dashboard',     element: <Dashboard /> },
        { path: 'units',         element: <Units /> },
        { path: 'tenants',       element: <Tenants /> },
        { path: 'applications',  element: <MyApplications /> },
        { path: 'profile',       element: <Profile /> },
        { path: 'settings',      element: <AccountPage mode="settings" /> },
        { path: 'viewings',      element: <Viewings /> },
        { path: 'reservations',  element: <Reservations /> },
        { path: 'notifications', element: <Notifications /> },
        { path: 'payments',      element: <Payments /> },
        { path: 'messages',      element: <Messaging /> },
        { path: 'checklists',    element: <Checklists /> },
        { path: 'handovers',     element: <HandoverQueue /> },

        // Listings (browseable within tenant dashboard)
        { path: 'listings',              element: <ListingsPage embedded={true} /> },
        { path: 'listings/:id',          element: <UnitDetailPage embedded={true} /> },

        // Landlord protected pages (same shell, different nav)
        { path: 'landlord/dashboard',    element: <LandlordDashboard /> },
        { path: 'landlord/units',        element: <LandlordUnits /> },
        { path: 'landlord/applications', element: <LandlordApplications /> },
        { path: 'landlord/viewings',     element: <LandlordViewings /> },
        { path: 'landlord/reservations', element: <LandlordReservations /> },
        { path: 'landlord/messages',     element: <LandlordMessages /> },
        { path: 'landlord/profile',      element: <AccountPage mode="profile" /> },
        { path: 'landlord/settings',     element: <AccountPage mode="settings" /> },

        // Admin pages (Core admin JWT, Move-In shell)
        { path: 'admin/dashboard',    element: <AdminDashboard /> },
        { path: 'admin/listings',     element: <AdminListings /> },
        { path: 'admin/applications', element: <AdminApplications /> },
        { path: 'admin/customers',    element: <AdminCustomers /> },
        { path: 'admin/preferences',  element: <AdminPreferences /> },
        { path: 'admin/landlords',    element: <AdminLandlords /> },
        { path: 'admin/viewings',     element: <AdminViewings /> },
        { path: 'admin/reservations', element: <AdminReservations /> },
        { path: 'admin/deals',        element: <AdminDeals /> },
        { path: 'admin/audit-logs',   element: <AdminAuditLogs /> },
        { path: 'admin/profile',      element: <AccountPage mode="profile" /> },
        { path: 'admin/settings',     element: <AccountPage mode="settings" /> },
      ],
    },
  ],
  { future: { v7_startTransition: true } }
);

export default router;
