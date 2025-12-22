import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';
import DetaineeService from '../services/detainee.service';
import DetaineeDetailModal from './DetaineeDetailModal';
import { Button, Form, Alert, Spinner, Modal, Col, Row, Tabs, Tab } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Users, UserCheck, ShieldAlert, Activity, Eye, CheckCircle, XCircle, UserPlus, FileText, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="glass-card stat-card h-100">
    <div className="stat-info">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`small mt-2 ${trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
          {trend} depuis hier
        </div>
      )}
    </div>
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
      {icon}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [detainees, setDetainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetainee, setSelectedDetainee] = useState(null);

  const availableRoles = ['ROLE_ADMIN', 'ROLE_MEDECIN', 'ROLE_PERSONNEL'];

  useEffect(() => {
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
        const resMessage = (err.response?.data?.message) || err.message || 'Une erreur est survenue.';
        setError(resMessage);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleShowRoleModal = (user) => {
    setCurrentUserToEdit(user);
    setSelectedRoles(user.roles.map(role => role.name || role));
    setShowRoleModal(true);
  };

  const handleUpdateRoles = async () => {
    await UserService.updateUserRoles(currentUserToEdit.id, selectedRoles);
    setShowRoleModal(false);
    const response = await UserService.getAllUsers();
    setUsers(response.data);
  };

  const handleDetaineeValidation = async (detaineeId, status) => {
    await DetaineeService.updateDetaineeStatus(detaineeId, status, "Validé par l'administrateur");
    const response = await DetaineeService.getAllDetainees();
    setDetainees(response.data);
  };

  const pendingUsers = users.filter(user => user.roles.length === 0);
  const pendingDetainees = detainees.filter(d => d.status === 'PENDING_VALIDATION');

  const securityLevels = detainees.reduce((acc, d) => {
    const level = d.securityLevel || 'Non défini';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const securityChartData = {
    labels: Object.keys(securityLevels),
    datasets: [{
      data: Object.values(securityLevels),
      backgroundColor: ['#e63946', '#f1c40f', '#3498db', '#95a5a6'],
      borderWidth: 0,
    }]
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Chargement du système...</p></div>;

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Tableau de Bord Administrateur</h2>
          <p className="text-muted small">Supervision globale du système pénitentiaire</p>
        </div>
        <div className="d-flex gap-2">
          <Button className="btn-premium btn-premium-primary" onClick={() => navigate('/incidents')}>
            <ShieldAlert size={18} /> Registre Incidents
          </Button>
          <Button variant="light" className="rounded-pill shadow-sm" onClick={() => navigate('/planning')}>
            <Calendar size={18} className="me-2" /> Planning
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-3">
          <StatCard title="Population Totale" value={detainees.length} icon={<Users size={24} />} color="#3c4b64" trend="+2.3%" />
        </Col>
        <Col xl={3} md={6} className="mb-3">
          <StatCard title="Utilisateurs Actifs" value={activeUsers.length} icon={<UserCheck size={24} />} color="#2ecc71" trend="+5%" />
        </Col>
        <Col xl={3} md={6} className="mb-3">
          <StatCard title="Alertes Sécurité" value="14" icon={<ShieldAlert size={24} />} color="#e63946" trend="-12%" />
        </Col>
        <Col xl={3} md={6} className="mb-3">
          <StatCard title="En Attente" value={pendingDetainees.length} icon={<Activity size={24} />} color="#f1c40f" />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4">Mouvements de Population</h5>
            <div style={{ height: '300px' }}>
              <Line
                data={{
                  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                  datasets: [{
                    label: 'Entrées',
                    data: [12, 19, 3, 5, 2, 3, 9],
                    borderColor: '#3c4b64',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(60, 75, 100, 0.05)'
                  }]
                }}
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
        </Col>
        <Col lg={4}>
          <div className="glass-card p-4 h-100 text-center">
            <h5 className="fw-bold mb-4">Niveaux de Sécurité</h5>
            <div style={{ height: '250px' }}>
              <Doughnut data={securityChartData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            </div>
            <div className="mt-3 small text-muted">Répartition par dangerosité</div>
          </div>
        </Col>
      </Row>

      <div className="glass-card p-0 overflow-hidden">
        <Tabs defaultActiveKey="users" className="custom-tabs px-4 pt-3 border-0">
          <Tab eventKey="users" title="Gestion Utilisateurs">
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Utilisateurs en attente ({pendingUsers.length})</h6>
              </div>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id}>
                        <td className="fw-bold">{user.username}</td>
                        <td>{user.email}</td>
                        <td><span className="badge-custom badge-warning">En attente</span></td>
                        <td>
                          <Button size="sm" className="btn-premium btn-premium-primary" onClick={() => handleShowRoleModal(user)}>
                            <UserPlus size={14} /> Attribuer Rôle
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pendingUsers.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">Aucun utilisateur en attente</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab>
          <Tab eventKey="detainees" title="Validation Détenus">
            <div className="p-4">
              <h6 className="fw-bold mb-3">Nouveaux dossiers à valider ({pendingDetainees.length})</h6>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nom complet</th>
                      <th>Date d'arrivée</th>
                      <th>Niveau de risque</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDetainees.map(d => (
                      <tr key={d.id}>
                        <td className="fw-bold">{d.lastName} {d.firstName}</td>
                        <td>{new Date(d.arrivalDate).toLocaleDateString()}</td>
                        <td><span className={`badge-custom ${d.securityLevel === 'HAUT' ? 'badge-danger' : 'badge-info'}`}>{d.securityLevel || 'MOYEN'}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="success" size="sm" className="rounded-pill" onClick={() => handleDetaineeValidation(d.id, 'VALIDATED')}>
                              <CheckCircle size={14} />
                            </Button>
                            <Button variant="danger" size="sm" className="rounded-pill" onClick={() => handleDetaineeValidation(d.id, 'REJECTED')}>
                              <XCircle size={14} />
                            </Button>
                            <Button variant="info" size="sm" className="rounded-pill text-white" onClick={() => { setSelectedDetainee(d); setShowDetailModal(true); }}>
                              <Eye size={14} />
                            </Button>
                            <Button variant="primary" size="sm" className="rounded-pill" onClick={() => navigate(`/detenus/${d.id}`)}>
                              <FileText size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingDetainees.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">Aucun dossier en attente de validation</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      <DetaineeDetailModal show={showDetailModal} handleClose={() => setShowDetailModal(false)} detainee={selectedDetainee} />

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Attribuer un rôle à {currentUserToEdit?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {availableRoles.map(role => (
              <div key={role} className="mb-3 p-3 glass-card d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-bold">{role.replace('ROLE_', '')}</div>
                  <div className="text-muted small">Accès aux fonctionnalités {role.toLowerCase().replace('role_', '')}</div>
                </div>
                <Form.Check
                  type="checkbox"
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onChange={() => setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])}
                />
              </div>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowRoleModal(false)}>Annuler</Button>
          <Button className="btn-premium btn-premium-primary" onClick={handleUpdateRoles}>Enregistrer les modifications</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;