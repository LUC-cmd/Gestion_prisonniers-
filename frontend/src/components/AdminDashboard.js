import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';
import DetaineeService from '../services/detainee.service';
import DetaineeDetailModal from './DetaineeDetailModal';
import { Button, Form, Alert, Spinner, Modal, Col, Row, Tabs, Tab, Badge } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Users, UserCheck, ShieldAlert, Activity, Eye, CheckCircle, XCircle, UserPlus, FileText, Calendar, Lock, Shield } from 'lucide-react';

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

  const [availableRoles, setAvailableRoles] = useState(['ROLE_ADMIN', 'ROLE_INFIRMIER', 'ROLE_PERSONNEL']);
  const [permissions, setPermissions] = useState({
    'ROLE_ADMIN': ['ALL_ACCESS', 'MANAGE_USERS', 'MANAGE_DETAINEES', 'VIEW_REPORTS'],
    'ROLE_INFIRMIER': ['VIEW_DETAINEES', 'MANAGE_MEDICAL_RECORDS'],
    'ROLE_PERSONNEL': ['VIEW_DETAINEES', 'MANAGE_INCIDENTS', 'MANAGE_PLANNING']
  });

  const [editingRole, setEditingRole] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'ROLE_PERSONNEL' });

  const allPossiblePermissions = [
    'ALL_ACCESS', 'MANAGE_USERS', 'MANAGE_DETAINEES', 'VIEW_DETAINEES',
    'MANAGE_MEDICAL_RECORDS', 'MANAGE_INCIDENTS', 'MANAGE_PLANNING', 'VIEW_REPORTS'
  ];

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Use UserService to create user (we'll need to add this method or use a generic update if it's mock)
      // For now, let's simulate it by updating the local state and localStorage if mock
      const usersList = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const createdUser = {
        id: usersList.length + 1,
        ...newUser,
        roles: [newUser.role],
        status: 'ACTIVE'
      };
      usersList.push(createdUser);
      localStorage.setItem('mock_users', JSON.stringify(usersList));

      setUsers([...users, createdUser]);
      setShowCreateUserModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'ROLE_PERSONNEL' });
      alert("Utilisateur créé avec succès !");
    } catch (err) {
      setError("Erreur lors de la création de l'utilisateur");
    }
  };

  const handleShowRoleModal = (user) => {
    setCurrentUserToEdit(user);
    setSelectedRoles(user.roles.map(role => role.name || role));
    setShowRoleModal(true);
  };

  const handleUpdateRoles = async () => {
    try {
      await UserService.updateUserRoles(currentUserToEdit.id, selectedRoles);
      // Also update status to ACTIVE if it was pending and roles are now assigned
      if (currentUserToEdit.roles.length === 0 && selectedRoles.length > 0) {
        await UserService.updateUserStatus(currentUserToEdit.id, 'ACTIVE');
      }
      setShowRoleModal(false);
      const response = await UserService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError("Erreur lors de la mise à jour des rôles.");
    }
  };

  const handleCreateOrUpdateRole = () => {
    const roleKey = editingRole || `ROLE_${newRoleName.toUpperCase().replace(/\s+/g, '_')}`;

    setPermissions(prev => ({
      ...prev,
      [roleKey]: newRolePermissions
    }));

    if (!editingRole) {
      setAvailableRoles(prev => [...prev, roleKey]);
    }

    setShowNewRoleModal(false);
    setNewRoleName('');
    setNewRolePermissions([]);
    setEditingRole(null);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setNewRoleName(role.replace('ROLE_', ''));
    setNewRolePermissions(permissions[role] || []);
    setShowNewRoleModal(true);
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
          <Button variant="success" className="rounded-pill shadow-sm" onClick={() => navigate('/register')}>
            <UserPlus size={18} className="me-2" /> Nouvel Utilisateur
          </Button>
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
                <h6 className="fw-bold mb-0">Tous les utilisateurs ({users.length})</h6>
                <Button className="btn-premium btn-premium-primary" size="sm" onClick={() => setShowCreateUserModal(true)}>
                  <UserPlus size={16} className="me-1" /> Nouveau Utilisateur
                </Button>
              </div>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Rôles</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="fw-bold">{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role, idx) => (
                                <Badge key={idx} bg="info" className="fw-normal">
                                  {typeof role === 'string' ? role.replace('ROLE_', '') : (role.name ? role.name.replace('ROLE_', '') : 'N/A')}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted small">Aucun rôle</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg={user.roles && user.roles.length > 0 ? 'success' : 'warning'} className="fw-normal">
                            {user.roles && user.roles.length > 0 ? 'Actif' : 'En attente'}
                          </Badge>
                        </td>
                        <td>
                          <Button size="sm" className="btn-premium btn-premium-primary" onClick={() => handleShowRoleModal(user)}>
                            <Shield size={14} className="me-1" /> {user.roles && user.roles.length > 0 ? 'Modifier Rôles' : 'Attribuer Rôle'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">Aucun utilisateur trouvé</td></tr>}
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
          <Tab eventKey="roles" title="Rôles & Accès">
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0">Configuration des Rôles et Permissions</h6>
                <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => { setEditingRole(null); setNewRoleName(''); setNewRolePermissions([]); setShowNewRoleModal(true); }}>
                  <Shield size={14} className="me-1" /> Créer un nouveau rôle
                </Button>
              </div>
              <Row>
                {availableRoles.map(role => (
                  <Col md={4} key={role} className="mb-4">
                    <div className="glass-card p-4 h-100 border-top border-4" style={{ borderColor: role === 'ROLE_ADMIN' ? '#e63946' : role === 'ROLE_MEDECIN' ? '#3498db' : '#2ecc71' }}>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">{role.replace('ROLE_', '')}</h6>
                          <div className="small text-muted">Permissions système</div>
                        </div>
                        <Lock size={18} className="text-muted" />
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        {permissions[role]?.map(p => (
                          <Badge key={p} bg="light" className="text-dark border fw-normal">{p}</Badge>
                        ))}
                      </div>
                      <Button variant="light" size="sm" className="w-100 rounded-pill mt-auto" onClick={() => handleEditRole(role)}>Modifier les accès</Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Tab>
        </Tabs>
      </div>

      <DetaineeDetailModal show={showDetailModal} handleClose={() => setShowDetailModal(false)} detainee={selectedDetainee} />

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Attribuer un rôle à {currentUserToEdit?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          <div className="d-flex flex-column gap-3">
            {availableRoles.map(role => {
              const isSelected = selectedRoles.includes(role);
              return (
                <div
                  key={role}
                  className={`p-3 rounded-4 border-2 cursor-pointer transition-all d-flex align-items-center justify-content-between ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-white shadow-sm'}`}
                  onClick={() => setSelectedRoles([role])}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className={`fw-bold mb-1 ${isSelected ? 'text-primary' : ''}`}>{role.replace('ROLE_', '')}</div>
                    <div className="text-muted small">Accès aux fonctionnalités {role.toLowerCase().replace('role_', '')}</div>
                  </div>
                  <Form.Check
                    type="radio"
                    name="userRole"
                    id={`role-${role}`}
                    checked={isSelected}
                    onChange={() => { }} // Handled by div click
                    className="custom-radio-lg"
                  />
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-4">
          <Button variant="light" className="px-4 rounded-pill" onClick={() => setShowRoleModal(false)}>Annuler</Button>
          <Button className="btn-premium btn-premium-primary px-4" onClick={handleUpdateRoles}>Enregistrer les modifications</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNewRoleModal} onHide={() => setShowNewRoleModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">{editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Nom du rôle</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: SURVEILLANT_CHEF"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                disabled={!!editingRole}
                className="border-0 bg-light rounded-3"
              />
              <Form.Text className="text-muted">Le préfixe ROLE_ sera ajouté automatiquement.</Form.Text>
            </Form.Group>

            <Form.Label className="fw-bold mb-3">Permissions associées</Form.Label>
            <Row>
              {allPossiblePermissions.map(perm => (
                <Col md={6} key={perm} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id={`perm-${perm}`}
                    label={perm.replace(/_/g, ' ')}
                    checked={newRolePermissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewRolePermissions([...newRolePermissions, perm]);
                      } else {
                        setNewRolePermissions(newRolePermissions.filter(p => p !== perm));
                      }
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowNewRoleModal(false)}>Annuler</Button>
          <Button className="btn-premium btn-premium-primary" onClick={handleCreateOrUpdateRole}>
            {editingRole ? 'Enregistrer' : 'Créer le rôle'}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Create User Modal */}
      <Modal show={showCreateUserModal} onHide={() => setShowCreateUserModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Créer un nouvel utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nom d'utilisateur</Form.Label>
              <Form.Control
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="border-0 bg-light rounded-3"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border-0 bg-light rounded-3"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Mot de passe</Form.Label>
              <Form.Control
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border-0 bg-light rounded-3"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Rôle initial</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="border-0 bg-light rounded-3"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role.replace('ROLE_', '')}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowCreateUserModal(false)}>Annuler</Button>
              <Button type="submit" className="btn-premium btn-premium-primary">Créer l'utilisateur</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;