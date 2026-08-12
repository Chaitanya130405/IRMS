import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { Login, Register, Forgot, ResetPassword } from './pages/AuthPages';
import LandingPage from './pages/LandingPage';
import { Dashboard, Jobs, Apply, Applications, ApplicationDetails, Profile, Notifications, AccessDenied, UserManagement, CreateAdmin } from './pages/AppPages';
import './styles/app.css';

const Candidate = () => <ProtectedRoute role="candidate"><AppLayout /></ProtectedRoute>;
const Admin = () => <ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>;
const SuperAdmin = () => <ProtectedRoute role="superadmin"><AppLayout /></ProtectedRoute>;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route element={<Candidate />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/apply/:id" element={<Apply />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<Admin />}>
            <Route path="/admin" element={<Dashboard admin />} />
            <Route path="/admin/jobs" element={<Jobs admin />} />
            <Route path="/admin/applications" element={<Applications admin />} />
            <Route path="/admin/applications/:id" element={<ApplicationDetails />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
          <Route element={<SuperAdmin />}>
            <Route path="/superadmin" element={<UserManagement />} />
            <Route path="/superadmin/create-admin" element={<CreateAdmin />} />
            <Route path="/superadmin/profile" element={<Profile />} />
          </Route>
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
