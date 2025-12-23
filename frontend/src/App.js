import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/premium.css';

import Login from './components/Login';
import DetaineeForm from './components/DetaineeForm';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PersonnelDashboard from './components/PersonnelDashboard';
import MainLayout from './components/MainLayout';
import AuthService from './services/auth.service';
import UserService from './services/user.service';
import IncidentList from './components/IncidentList';
import IncidentFormPage from './components/IncidentFormPage';
import DetaineeFile from './components/DetaineeFile';
import DetaineeList from './components/DetaineeList';
import Planning from './components/Planning';

const DashboardRedirector = () => {
  const currentUser = AuthService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.status === 'SUSPENDED') {
      navigate('/unauthorized');
      return;
    }
    const roles = currentUser.roles || [];
    if (roles.includes("ROLE_ADMIN")) navigate('/admin-dashboard');
    else if (roles.includes("ROLE_INFIRMIER")) navigate('/doctor-dashboard');
    else if (roles.includes("ROLE_PERSONNEL")) navigate('/personnel-dashboard');
    else if (roles.length === 0) navigate('/pending-role-assignment');
    else navigate('/unauthorized');
  }, [currentUser, navigate]);

  return <div className="container mt-3"><p>Redirection...</p></div>;
};

const UnauthorizedPage = () => (
  <div className="container mt-3 alert alert-danger">
    Vous n'avez pas les autorisations nécessaires pour accéder à cette page. Votre compte pourrait être suspendu ou vous n'avez pas de rôle attribué.
  </div>
);

const PendingRoleAssignmentPage = () => (
  <div className="container mt-3 alert alert-info">
    Votre compte a été créé avec succès et est en attente d'attribution de rôle par un administrateur. Veuillez patienter.
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    if (currentUser && currentUser.roles.includes("ROLE_ADMIN")) {
      const fetchPendingUsers = async () => {
        try {
          await UserService.getAllUsers();
        } catch (error) {
          console.error("Could not fetch pending users:", error);
        }
      };
      fetchPendingUsers();
      const interval = setInterval(fetchPendingUsers, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const logOut = (event) => {
    if (event) event.preventDefault();
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      AuthService.logout();
      setCurrentUser(undefined);
    }
  };

  const hasRole = (roleName) => currentUser && currentUser.roles && currentUser.roles.includes(roleName);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route path="/" element={
          currentUser ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <DashboardRedirector />
            </MainLayout>
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/admin-dashboard" element={
          hasRole("ROLE_ADMIN") ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <AdminDashboard />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/doctor-dashboard" element={
          hasRole("ROLE_INFIRMIER") ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <DoctorDashboard />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/personnel-dashboard" element={
          hasRole("ROLE_PERSONNEL") ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <PersonnelDashboard />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/detenus" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <DetaineeList />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/detenus/nouveau" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <DetaineeForm />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/detenus/modifier/:id" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <DetaineeForm isEdit={true} />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/detenus/:id" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL") || hasRole("ROLE_INFIRMIER")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <DetaineeFile />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/incidents" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <IncidentList />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/incidents/nouveau" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <IncidentFormPage />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/planning" element={
          (hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL") || hasRole("ROLE_INFIRMIER")) ? (
            <MainLayout user={currentUser} onLogout={logOut}>
              <Planning />
            </MainLayout>
          ) : <UnauthorizedPage />
        } />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/pending-role-assignment" element={<PendingRoleAssignmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;

