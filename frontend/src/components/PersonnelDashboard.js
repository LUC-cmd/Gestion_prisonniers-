import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Users, PlusCircle, AlertTriangle, Calendar, Eye, Activity, Building2 } from 'lucide-react';
import DetaineeService from '../services/detainee.service';
import AuthService from '../services/auth.service';
import DetaineeDetailModal from './DetaineeDetailModal';
import IncidentModal from './IncidentModal';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="glass-card stat-card h-100">
        <div className="stat-info">
            <h3>{title}</h3>
            <div className="stat-value">{value}</div>
            {trend && <div className="small mt-2 text-success">{trend}</div>}
        </div>
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
            {icon}
        </div>
    </div>
);

const PersonnelDashboard = () => {
    const navigate = useNavigate();
    const [detainees, setDetainees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetainee, setSelectedDetainee] = useState(null);

    const fetchDetainees = async () => {
        try {
            setLoading(true);
            const response = await DetaineeService.getAllDetainees();
            setDetainees(response.data);
            setError('');
        } catch (err) {
            const resMessage = (err.response?.data?.message) || err.message || 'Une erreur est survenue.';
            setError(resMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetainees();
    }, []);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Chargement de l'espace personnel...</p></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">Espace Personnel de Surveillance</h2>
                    <p className="text-muted small">Gestion quotidienne des détenus et incidents</p>
                </div>
                <div className="d-flex gap-2">
                    <Button className="btn-premium btn-premium-primary" onClick={() => navigate('/detenus/nouveau')}>
                        <PlusCircle size={18} /> Nouveau Détenu
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

            <Row className="mb-4">
                <Col xl={3} md={6} className="mb-3">
                    <StatCard title="Population Totale" value={detainees.length} icon={<Users size={24} />} color="#3c4b64" trend="+2" />
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <StatCard title="Capacité Secteur" value="78%" icon={<Building2 size={24} />} color="#2ecc71" />
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <StatCard title="Incidents Récents" value="3" icon={<AlertTriangle size={24} />} color="#e63946" />
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <StatCard title="Visites Prévues" value="12" icon={<Calendar size={24} />} color="#3498db" />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={4}>
                    <div className="glass-card p-4 h-100">
                        <h5 className="fw-bold mb-4">Actions de Terrain</h5>
                        <div className="d-grid gap-3">
                            <Button variant="light" className="text-start p-3 border-0 shadow-sm d-flex align-items-center gap-3" onClick={() => setShowIncidentModal(true)}>
                                <div className="bg-danger text-white p-2 rounded-3"><AlertTriangle size={20} /></div>
                                <div>
                                    <div className="fw-bold">Signaler un Incident</div>
                                    <div className="text-muted small">Rapport immédiat d'événement</div>
                                </div>
                            </Button>
                            <Button variant="light" className="text-start p-3 border-0 shadow-sm d-flex align-items-center gap-3">
                                <div className="bg-info text-white p-2 rounded-3"><Calendar size={20} /></div>
                                <div>
                                    <div className="fw-bold">Planifier une Visite</div>
                                    <div className="text-muted small">Gestion des parloirs</div>
                                </div>
                            </Button>
                            <Button variant="light" className="text-start p-3 border-0 shadow-sm d-flex align-items-center gap-3">
                                <div className="bg-primary text-white p-2 rounded-3"><Activity size={20} /></div>
                                <div>
                                    <div className="fw-bold">Rapport de Ronde</div>
                                    <div className="text-muted small">Validation des secteurs</div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </Col>
                <Col lg={8}>
                    <div className="glass-card p-4 h-100">
                        <h5 className="fw-bold mb-4">Derniers Détenus Enregistrés</h5>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Arrivée</th>
                                        <th>Type</th>
                                        <th>Statut</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detainees.slice(0, 5).map(detainee => (
                                        <tr key={detainee.id}>
                                            <td className="fw-bold">{detainee.lastName} {detainee.firstName}</td>
                                            <td>{new Date(detainee.arrivalDate).toLocaleDateString()}</td>
                                            <td><span className="small text-muted">{detainee.detentionType}</span></td>
                                            <td>
                                                <span className={`badge-custom ${detainee.status === 'VALIDATED' ? 'badge-success' : 'badge-warning'}`}>
                                                    {detainee.status === 'VALIDATED' ? 'Validé' : 'En attente'}
                                                </span>
                                            </td>
                                            <td>
                                                <Button variant="light" size="sm" className="rounded-pill" onClick={() => { setSelectedDetainee(detainee); setShowDetailModal(true); }}>
                                                    <Eye size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Col>
            </Row>

            <IncidentModal
                show={showIncidentModal}
                handleClose={() => setShowIncidentModal(false)}
                onIncidentReported={() => fetchDetainees()}
            />
            <DetaineeDetailModal
                show={showDetailModal}
                handleClose={() => setShowDetailModal(false)}
                detainee={selectedDetainee}
            />
        </div>
    );
};

export default PersonnelDashboard;