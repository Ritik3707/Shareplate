import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import DonationsPage from './pages/donations/DonationsPage';
import CreateDonationPage from './pages/donations/CreateDonationPage';
import DonationDetailPage from './pages/donations/DonationDetailPage';
import NgosPage from './pages/ngo/NgosPage';
import VolunteersPage from './pages/volunteer/VolunteersPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/donations/create" element={<CreateDonationPage />} />
            <Route path="/donations/:id" element={<DonationDetailPage />} />
            <Route path="/ngos" element={<NgosPage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
