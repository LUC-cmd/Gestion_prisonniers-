import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import DetaineeService from '../services/detainee.service';
import AuthService from '../services/auth.service';
import DetaineeDetailModal from './DetaineeDetailModal';
import IncidentModal from './IncidentModal'; // Import the new modal

// Placeholder for VisitModal
const VisitModal = ({ show, handleClose }) => (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`} tabIndex="-1">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Planifier une Visite</h5>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                </div>
                <div className="modal-body">
                    <p>Le formulaire pour planifier une visite sera implémenté ici.</p>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={handleClose}>Fermer</Button>
                    <Button variant="primary">Planifier</Button>
                </div>
            </div>
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

    // State for the detail modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetainee, setSelectedDetainee] = useState(null);

    const fetchDetainees = async () => {
        try {
            setLoading(true);
            const response = await DetaineeService.getAllDetainees();
            setDetainees(response.data);
            setError('');
        } catch (err) {
            if (err.response && err.response.status === 401) {
              // The API interceptor will handle the redirect, do not set local error
              console.log("Intercepted 401 on PersonnelDashboard, letting the interceptor handle it.");
            } else {
                const resMessage =
                    (err.response &&
                        err.response.data &&
                        err.response.data.message) ||
                    err.message ||
                    err.toString();
                setError(resMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            setError("Veuillez vous connecter pour voir ce contenu.");
            setLoading(false);
            return;
        }
        fetchDetainees();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_VALIDATION': return <Badge bg="warning">En attente</Badge>;
            case 'VALIDATED': return <Badge bg="success">Validé</Badge>;
            case 'REJECTED': return <Badge bg="danger">Rejeté</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
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

    const handleIncidentReported = () => {
        // This function can be used to refresh data, e.g., an incident list
        console.log("Incident reported, refresh data here in the future.");
    };

    return (
        <div className="container-fluid mt-3">
            <h1 className="h2 page-title">Tableau de bord du Personnel</h1>
            
            {/* Quick Actions */}
            <Row className="mb-4">
                <Col md={4}>
                    <h4>Actions Rapides</h4>
                    <Button variant="primary" className="me-2 mb-2 w-100 text-start" onClick={() => navigate('/detainee-form')}>
                        <i className="bi bi-plus-circle me-2"></i>Nouveau Détenu
                    </Button>
                    <Button variant="outline-danger" className="me-2 mb-2 w-100 text-start" onClick={() => setShowIncidentModal(true)}>
                        <i className="bi bi-clipboard-plus me-2"></i>Signaler un Incident
                    </Button>
                    <Button variant="outline-info" className="mb-2 w-100 text-start" onClick={() => setShowVisitModal(true)}>
                        <i className="bi bi-calendar-event me-2"></i>Planifier une Visite
                    </Button>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col xl={3} md={6}>
                    <Card>
                        <Card.Body>
                            <div className="text-xs fw-bold text-primary text-uppercase mb-1">Population Totale</div>
                            <div className="stats-number">{loading ? <Spinner as="span" size="sm" /> : detainees.length}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={3} md={6}>
                    <Card>
                        <Card.Body>
                            <div className="text-xs fw-bold text-success text-uppercase mb-1">Capacité</div>
                            <div className="stats-number">{loading ? <Spinner as="span" size="sm" /> : "N/A"}%</div>
                             <small className="text-muted">Donnée non disponible</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Detainee List */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>Derniers détenus enregistrés</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Chargement...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Prénom</th>
                                            <th>Date d'arrivée</th>
                                            <th>Type de détention</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detainees.slice(0, 10).map(detainee => ( // Show first 10 for now
                                            <tr key={detainee.id}>
                                                <td>{detainee.lastName}</td>
                                                <td>{detainee.firstName}</td>
                                                <td>{new Date(detainee.arrivalDate).toLocaleDateString()}</td>
                                                <td>{detainee.detentionType}</td>
                                                <td>{getStatusBadge(detainee.status)}</td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleShowDetailModal(detainee)}>
                                                        <i className="bi bi-eye"></i> Voir
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

            {/* Modals */}
            <IncidentModal 
                show={showIncidentModal} 
                handleClose={() => setShowIncidentModal(false)} 
                onIncidentReported={handleIncidentReported}
            />
            <VisitModal show={showVisitModal} handleClose={() => setShowVisitModal(false)} />
            <DetaineeDetailModal 
                show={showDetailModal} 
                handleClose={handleCloseDetailModal} 
                detainee={selectedDetainee} 
            />
        </div>
    );
};

export default PersonnelDashboard;