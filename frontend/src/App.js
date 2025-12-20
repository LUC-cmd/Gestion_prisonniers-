import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Badge } from 'react-bootstrap';

import Login from './components/Login';
import Register from './components/Register';
import DetaineeForm from './components/DetaineeForm';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PersonnelDashboard from './components/PersonnelDashboard';
import AuthService from './services/auth.service';
import UserService from './services/user.service';

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
    else if (roles.includes("ROLE_MEDECIN")) navigate('/doctor-dashboard');
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
  const [pendingUserCount, setPendingUserCount] = useState(0);

  useEffect(() => {
    if (currentUser && currentUser.roles.includes("ROLE_ADMIN")) {
      const fetchPendingUsers = async () => {
        try {
          const response = await UserService.getAllUsers();
          const pending = response.data.filter(user => user.roles.length === 0);
          setPendingUserCount(pending.length);
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
    event.preventDefault();
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      AuthService.logout();
      setCurrentUser(undefined);
    }
  };

  const hasRole = (roleName) => currentUser && currentUser.roles && currentUser.roles.includes(roleName);

  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <Link to="/" className="navbar-brand ms-3">SGP</Link>
          <div className="navbar-nav mr-auto">
            {currentUser && (
              <>
                <li className="nav-item"><Link to="/home" className="nav-link">Accueil</Link></li>
                {hasRole("ROLE_ADMIN") && <li className="nav-item"><Link to="/admin-dashboard" className="nav-link position-relative">Admin {pendingUserCount > 0 && <Badge pill bg="danger">{pendingUserCount}</Badge>}</Link></li>}
                {hasRole("ROLE_MEDECIN") && <li className="nav-item"><Link to="/doctor-dashboard" className="nav-link">Médecin</Link></li>}
                {hasRole("ROLE_PERSONNEL") && <li className="nav-item"><Link to="/personnel-dashboard" className="nav-link">Personnel</Link></li>}
                {(hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) && <li className="nav-item"><Link to="/detenus/nouveau" className="nav-link">Nouveau Détenu</Link></li>}
              </>
            )}
          </div>
          {currentUser ? (
            <div className="navbar-nav ms-auto me-3">
              <li className="nav-item"><Link to="/profile" className="nav-link">{currentUser.username}</Link></li>
              <li className="nav-item"><a href="/login" className="nav-link" onClick={logOut}>Déconnexion</a></li>
            </div>
          ) : (
            <div className="navbar-nav ms-auto me-3">
              <li className="nav-item"><Link to="/login" className="nav-link">Connexion</Link></li>
              <li className="nav-item"><Link to="/register" className="nav-link">S'inscrire</Link></li>
            </div>
          )}
        </nav>
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={currentUser ? <DashboardRedirector /> : <Navigate to="/login" replace />} />
            <Route path="/home" element={<DashboardRedirector />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-dashboard" element={hasRole("ROLE_ADMIN") ? <AdminDashboard /> : <UnauthorizedPage />} />
            <Route path="/doctor-dashboard" element={hasRole("ROLE_MEDECIN") ? <DoctorDashboard /> : <UnauthorizedPage />} />
            <Route path="/personnel-dashboard" element={hasRole("ROLE_PERSONNEL") ? <PersonnelDashboard /> : <UnauthorizedPage />} />
            <Route path="/detenus/nouveau" element={(hasRole("ROLE_ADMIN") || hasRole("ROLE_PERSONNEL")) ? <DetaineeForm /> : <UnauthorizedPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/pending-role-assignment" element={<PendingRoleAssignmentPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
