import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Stethoscope, Activity, Heart, AlertCircle, Eye, Clipboard } from 'lucide-react';
import DetaineeService from '../services/detainee.service';
import AuthService from '../services/auth.service';
import DetaineeDetailModal from './DetaineeDetailModal';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="glass-card stat-card h-100">
        <div className="stat-info">
            <h3>{title}</h3>
            <div className="stat-value">{value}</div>
            {trend && <div className="small mt-2 text-danger">{trend}</div>}
        </div>
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
            {icon}
        </div>
    </div>
);

const DoctorDashboard = () => {
    const [detainees, setDetainees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetainee, setSelectedDetainee] = useState(null);

    useEffect(() => {
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
        fetchDetainees();
    }, []);

    const criticalStatusCount = detainees.filter(d => d.medicalStatus === 'Critique').length;
    const badStatusCount = detainees.filter(d => d.medicalStatus === 'Mauvais').length;

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Chargement de l'espace médical...</p></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">Espace Médical</h2>
                    <p className="text-muted small">Suivi de santé et dossiers médicaux des détenus</p>
                </div>
                <div className="d-flex gap-2">
                    <Button className="btn-premium btn-premium-primary">
                        <Clipboard size={18} /> Nouvelle Consultation
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

            <Row className="mb-4">
                <Col xl={4} md={6} className="mb-3">
                    <StatCard title="Urgences Médicales" value={criticalStatusCount} icon={<AlertCircle size={24} />} color="#e63946" trend="Action requise" />
                </Col>
                <Col xl={4} md={6} className="mb-3">
                    <StatCard title="Suivi Recommandé" value={badStatusCount} icon={<Activity size={24} />} color="#f1c40f" trend="À planifier" />
                </Col>
                <Col xl={4} md={6} className="mb-3">
                    <StatCard title="Patients Totaux" value={detainees.length} icon={<Heart size={24} />} color="#3498db" />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={12}>
                    <div className="glass-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Liste des Patients & Dossiers Médicaux</h5>
                            <div className="d-flex gap-2">
                                <Button variant="light" size="sm" className="rounded-pill px-3">Tous</Button>
                                <Button variant="light" size="sm" className="rounded-pill px-3 text-danger">Critiques</Button>
                            </div>
                        </div>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>État de Santé</th>
                                        <th>Groupe Sanguin</th>
                                        <th>Allergies</th>
                                        <th>Dernière Visite</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detainees.map(detainee => (
                                        <tr key={detainee.id}>
                                            <td className="fw-bold">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-light rounded-circle p-2"><Stethoscope size={16} className="text-primary" /></div>
                                                    {detainee.lastName} {detainee.firstName}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge-custom ${detainee.medicalStatus === 'Critique' ? 'badge-danger' :
                                                        detainee.medicalStatus === 'Mauvais' ? 'badge-warning' :
                                                            detainee.medicalStatus === 'Bon' ? 'badge-success' : 'badge-info'
                                                    }`}>
                                                    {detainee.medicalStatus || 'N/A'}
                                                </span>
                                            </td>
                                            <td><span className="fw-bold text-primary">{detainee.bloodType || 'N/A'}</span></td>
                                            <td><small className="text-muted">{detainee.allergies || 'Aucune'}</small></td>
                                            <td><small>{new Date().toLocaleDateString()}</small></td>
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

            <DetaineeDetailModal
                show={showDetailModal}
                handleClose={() => setShowDetailModal(false)}
                detainee={selectedDetainee}
            />
        </div>
    );
};

export default DoctorDashboard;