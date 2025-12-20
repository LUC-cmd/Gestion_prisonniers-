import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import DetaineeService from '../services/detainee.service';
import AuthService from '../services/auth.service';
import DetaineeDetailModal from './DetaineeDetailModal';

const DoctorDashboard = () => {
    const [detainees, setDetainees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetainee, setSelectedDetainee] = useState(null);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            setError("Veuillez vous connecter pour voir ce contenu.");
            setLoading(false);
            return;
        }

        const fetchDetainees = async () => {
            try {
                setLoading(true);
                const response = await DetaineeService.getAllDetainees();
                setDetainees(response.data);
                setError('');
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    // The API interceptor will handle the redirect, do not set local error
                    console.log("Intercepted 401 on DoctorDashboard, letting the interceptor handle it.");
                } else {
                    const resMessage = (err.response?.data?.message) || err.message || err.toString();
                    setError(resMessage);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetainees();
    }, []);

    const getMedicalStatusBadge = (status) => {
        switch (status) {
            case 'Critique': return <Badge bg="danger">{status}</Badge>;
            case 'Mauvais': return <Badge bg="warning">{status}</Badge>;
            case 'Moyen': return <Badge bg="info">{status}</Badge>;
            case 'Bon': return <Badge bg="success">{status}</Badge>;
            default: return <Badge bg="secondary">{status || 'N/A'}</Badge>;
        }
    };
    
    // Handlers for the detail modal
    const handleShowDetailModal = (detainee) => {
        setSelectedDetainee(detainee);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDetainee(null);
    };

    const criticalStatusCount = detainees.filter(d => d.medicalStatus === 'Critique').length;
    const badStatusCount = detainees.filter(d => d.medicalStatus === 'Mauvais').length;

    return (
        <div className="container-fluid mt-3">
            <h1 className="h2 page-title">Tableau de bord Médecin</h1>
            <p>Gestion des dossiers médicaux des détenus, consultations, etc.</p>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col xl={4} md={6}>
                    <Card className="border-start border-4 border-warning">
                        <Card.Body>
                            <div className="text-xs fw-bold text-warning text-uppercase mb-1">Visites Médicales en Attente</div>
                            <div className="stats-number">{loading ? <Spinner as="span" size="sm" /> : badStatusCount}</div>
                            <small className="text-muted">(Basé sur le statut 'Mauvais')</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={4} md={6}>
                    <Card className="border-start border-4 border-danger">
                        <Card.Body>
                            <div className="text-xs fw-bold text-danger text-uppercase mb-1">Détenus en État Critique</div>
                            <div className="stats-number">{loading ? <Spinner as="span" size="sm" /> : criticalStatusCount}</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Patient List */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>Liste des Patients</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {loading ? (
                                <div className="text-center"><Spinner animation="border" /></div>
                            ) : (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Nom Complet</th>
                                            <th>État de Santé</th>
                                            <th>Groupe Sanguin</th>
                                            <th>Allergies</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detainees.map(detainee => (
                                            <tr key={detainee.id}>
                                                <td>{detainee.lastName} {detainee.firstName}</td>
                                                <td>{getMedicalStatusBadge(detainee.medicalStatus)}</td>
                                                <td>{detainee.bloodType || 'N/A'}</td>
                                                <td>{detainee.allergies || 'Aucune'}</td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleShowDetailModal(detainee)}>
                                                        <i className="bi bi-eye"></i> Voir Dossier
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Modal */}
            {selectedDetainee && (
                 <DetaineeDetailModal 
                    show={showDetailModal} 
                    handleClose={handleCloseDetailModal} 
                    detainee={selectedDetainee}
                />
            )}
        </div>
    );
};

export default DoctorDashboard;