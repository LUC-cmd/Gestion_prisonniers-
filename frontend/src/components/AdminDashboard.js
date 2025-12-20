import React, { useState, useEffect } from 'react';
import UserService from '../services/user.service';
import AuthService from '../services/auth.service';
import DetaineeService from '../services/detainee.service';
import DetaineeDetailModal from './DetaineeDetailModal';
import { Table, Button, Form, Alert, Badge, Spinner, Modal, Card, Col, Row, Tabs, Tab } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [detainees, setDetainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetainee, setSelectedDetainee] = useState(null);
  
  const availableRoles = ['ROLE_ADMIN', 'ROLE_MEDECIN', 'ROLE_PERSONNEL'];

  // Data fetching
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      setError("Veuillez vous connecter pour voir ce contenu.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, activeUsersRes, detaineesRes] = await Promise.all([
          UserService.getAllUsers(),
          UserService.getActiveUsers(),
          DetaineeService.getAllDetainees()
        ]);
        setUsers(usersRes.data);
        setActiveUsers(activeUsersRes.data);
        setDetainees(detaineesRes.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // The API interceptor will handle the redirect, do not set local error
          console.log("Intercepted 401 on AdminDashboard, letting the interceptor handle it.");
        } else {
          const resMessage = (err.response?.data?.message) || err.message || 'Une erreur est survenue.';
          setError(resMessage);
        }
      }
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleShowRoleModal = (user) => {
    setCurrentUserToEdit(user);
    setSelectedRoles(user.roles.map(role => role.name));
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setCurrentUserToEdit(null);
    setSelectedRoles([]);
  };

  const handleRoleChange = (role) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleUpdateRoles = async () => {
    if (!currentUserToEdit) return;
    await UserService.updateUserRoles(currentUserToEdit.id, selectedRoles);
    handleCloseRoleModal();
    const response = await UserService.getAllUsers();
    setUsers(response.data);
  };
  
  const handleUpdateStatus = async (userId, newStatus) => {
    await UserService.updateUserStatus(userId, newStatus);
    const response = await UserService.getAllUsers();
    setUsers(response.data);
  };

  const handleDetaineeValidation = async (detaineeId, status, comments = "") => {
    await DetaineeService.updateDetaineeStatus(detaineeId, status, comments);
    const response = await DetaineeService.getAllDetainees();
    setDetainees(response.data);
  };

  const handleShowDetailModal = (detainee) => {
    setSelectedDetainee(detainee);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetainee(null);
  };
  
  // Data processing for UI
  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN': return <Badge bg="danger">ADMIN</Badge>;
      case 'ROLE_MEDECIN': return <Badge bg="info">MÉDECIN</Badge>;
      case 'ROLE_PERSONNEL': return <Badge bg="primary">PERSONNEL</Badge>;
      default: return <Badge bg="secondary">{roleName}</Badge>;
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <Badge bg="success">ACTIF</Badge>;
      case 'SUSPENDED': return <Badge bg="warning">SUSPENDU</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };
  const getDetaineeStatusBadge = (status) => {
    switch (status) {
        case 'PENDING_VALIDATION': return <Badge bg="warning">En attente</Badge>;
        case 'VALIDATED': return <Badge bg="success">Validé</Badge>;
        case 'REJECTED': return <Badge bg="danger">Rejeté</Badge>;
        default: return <Badge bg="secondary">{status}</Badge>;
    }
  };
  const getMedicalStatusBadge = (status) => {
    switch (status) {
        case 'Critique': return <Badge bg="danger">{status}</Badge>;
        case 'Mauvais': return <Badge bg="warning">{status}</Badge>;
        case 'Moyen': return <Badge bg="info">{status}</Badge>;
        case 'Bon': return <Badge bg="success">{status}</Badge>;
        default: return <Badge bg="secondary">{status || 'N/A'}</Badge>;
    }
  };

  const pendingUsers = users.filter(user => user.roles.length === 0);
  const activeRegisteredUsers = users.filter(user => user.roles.length > 0);
  const pendingDetainees = detainees.filter(d => d.status === 'PENDING_VALIDATION');
  
  // Chart Data Processing
  const securityLevels = detainees.reduce((acc, d) => {
    const level = d.securityLevel || 'Non défini';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const securityChartData = {
    labels: Object.keys(securityLevels),
    datasets: [{
      data: Object.values(securityLevels),
      backgroundColor: ['#dc3545', '#ffc107', '#0d6efd', '#6c757d'],
    }]
  };
  
  const arrivals = detainees.reduce((acc, d) => {
    const date = new Date(d.arrivalDate).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const populationChartData = {
    labels: Object.keys(arrivals).sort(),
    datasets: [{
      label: 'Entrées',
      data: Object.keys(arrivals).sort().map(key => arrivals[key]),
      backgroundColor: 'rgba(40, 167, 69, 0.7)',
    }]
  };

  // Render
  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /><p>Chargement...</p></div>;
  }

  return (
    <div className="container-fluid mt-3">
      <h2>Tableau de bord Administrateur</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="supervision" id="admin-dashboard-tabs" className="mb-3">
        <Tab eventKey="supervision" title="Supervision">
            <Row>
                <Col xl={3} md={6} className="mb-3"><Card><Card.Body><Card.Title>Utilisateurs Actifs</Card.Title><div className="stats-number">{activeUsers.length}</div></Card.Body></Card></Col>
                <Col xl={3} md={6} className="mb-3"><Card><Card.Body><Card.Title>Population Totale</Card.Title><div className="stats-number">{detainees.length}</div></Card.Body></Card></Col>
                <Col xl={3} md={6} className="mb-3"><Card><Card.Body><Card.Title>Détenus en Attente</Card.Title><div className="stats-number">{pendingDetainees.length}</div></Card.Body></Card></Col>
            </Row>
            <Row className="mt-4">
                <Col md={8}><Card><Card.Header>Mouvements de population</Card.Header><Card.Body><Bar data={populationChartData} /></Card.Body></Card></Col>
                <Col md={4}><Card><Card.Header>Répartition par niveau de sécurité</Card.Header><Card.Body><Doughnut data={securityChartData} /></Card.Body></Card></Col>
            </Row>
        </Tab>
        <Tab eventKey="userManagement" title="Gestion Utilisateurs">
            <h3 className="mt-3">Utilisateurs en attente ({pendingUsers.length})</h3>
            <Table striped bordered hover responsive>
                <thead><tr><th>ID</th><th>Nom d'utilisateur</th><th>Email</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>{pendingUsers.map(user => (<tr key={user.id}><td>{user.id}</td><td>{user.username}</td><td>{user.email}</td><td>{getStatusBadge(user.status)}</td><td><Button size="sm" onClick={() => handleShowRoleModal(user)}>Attribuer Rôle</Button></td></tr>))}</tbody>
            </Table>

            <h3 className="mt-4">Tous les utilisateurs enregistrés ({activeRegisteredUsers.length})</h3>
            <Table striped bordered hover responsive>
                 <thead><tr><th>ID</th><th>Nom d'utilisateur</th><th>Rôles</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>{activeRegisteredUsers.map(user => (<tr key={user.id}><td>{user.id}</td><td>{user.username}</td><td>{user.roles.map(r => getRoleBadge(r.name))}</td><td>{getStatusBadge(user.status)}</td><td><Button size="sm" variant="warning" onClick={() => handleShowRoleModal(user)}>Modifier</Button></td></tr>))}</tbody>
            </Table>
        </Tab>
        <Tab eventKey="detaineeManagement" title="Gestion Détenus">
            <h3 className="mt-3">Validation des nouveaux détenus ({pendingDetainees.length})</h3>
             <Table striped bordered hover responsive>
                <thead><tr><th>ID</th><th>Nom</th><th>Date d'arrivée</th><th>Actions</th></tr></thead>
                <tbody>{pendingDetainees.map(d => (<tr key={d.id}><td>{d.id}</td><td>{d.lastName}, {d.firstName}</td><td>{new Date(d.arrivalDate).toLocaleDateString()}</td><td><Button size="sm" variant="success" onClick={() => handleDetaineeValidation(d.id, 'VALIDATED')}>Valider</Button><Button size="sm" variant="danger" className="ms-2" onClick={() => handleDetaineeValidation(d.id, 'REJECTED')}>Rejeter</Button><Button size="sm" variant="info" className="ms-2" onClick={() => handleShowDetailModal(d)}>Voir</Button></td></tr>))}</tbody>
             </Table>
            <h3 className="mt-4">Liste de tous les détenus</h3>
            <Table striped bordered hover responsive>
                <thead><tr><th>ID</th><th>Nom</th><th>Statut</th><th>Niveau Sécurité</th><th>Actions</th></tr></thead>
                <tbody>{detainees.map(d => (<tr key={d.id}><td>{d.id}</td><td>{d.lastName}, {d.firstName}</td><td>{getDetaineeStatusBadge(d.status)}</td><td>{d.securityLevel || 'N/A'}</td><td><Button size="sm" variant="info" onClick={() => handleShowDetailModal(d)}>Voir Dossier</Button></td></tr>))}</tbody>
            </Table>
        </Tab>
        <Tab eventKey="medicalView" title="Vue Médicale">
            <h3 className="mt-3">Liste des Patients</h3>
            <Table striped bordered hover responsive>
                <thead><tr><th>Nom</th><th>État de Santé</th><th>Groupe Sanguin</th><th>Allergies</th><th>Actions</th></tr></thead>
                <tbody>{detainees.map(d => (<tr key={d.id}><td>{d.lastName}, {d.firstName}</td><td>{getMedicalStatusBadge(d.medicalStatus)}</td><td>{d.bloodType || 'N/A'}</td><td>{d.allergies || 'Aucune'}</td><td><Button size="sm" variant="info" onClick={() => handleShowDetailModal(d)}>Voir Dossier</Button></td></tr>))}</tbody>
            </Table>
        </Tab>
      </Tabs>
      
      <DetaineeDetailModal show={showDetailModal} handleClose={handleCloseDetailModal} detainee={selectedDetainee} />
      
      <Modal show={showRoleModal} onHide={handleCloseRoleModal}><Modal.Header closeButton><Modal.Title>Modifier les rôles de {currentUserToEdit?.username}</Modal.Title></Modal.Header><Modal.Body><Form>{availableRoles.map(role => (<Form.Check type="checkbox" id={`role-${role}`} label={role.replace('ROLE_','')} key={role} checked={selectedRoles.includes(role)} onChange={() => handleRoleChange(role)} />))}</Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={handleCloseRoleModal}>Annuler</Button><Button variant="primary" onClick={handleUpdateRoles}>Enregistrer</Button></Modal.Footer></Modal>
    </div>
  );
};

export default AdminDashboard;