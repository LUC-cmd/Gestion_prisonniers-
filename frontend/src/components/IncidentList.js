import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Filter, AlertTriangle, Clock, MapPin, Eye, FileText, XCircle } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import IncidentService from '../services/incident.service';

const IncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGravity, setFilterGravity] = useState('Tous');
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await IncidentService.getAllIncidents();
            setIncidents(response.data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGravityBadge = (gravity) => {
        switch (gravity) {
            case 'Élevée': return <Badge className="badge-custom badge-danger">Élevée</Badge>;
            case 'Moyenne': return <Badge className="badge-custom badge-warning">Moyenne</Badge>;
            case 'Faible': return <Badge className="badge-custom badge-success">Faible</Badge>;
            default: return <Badge className="badge-custom badge-info">{gravity}</Badge>;
        }
    };

    const filteredIncidents = incidents.filter(incident => {
        const description = incident.description || '';
        const location = incident.location || '';
        const type = incident.type || '';

        const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGravity = filterGravity === 'Tous' || incident.gravity === filterGravity;
        return matchesSearch && matchesGravity;
    });

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">Registre des Incidents</h2>
                    <p className="text-muted small">Suivi et gestion des événements signalés dans l'établissement</p>
                </div>
                <Button className="btn-premium btn-premium-primary" onClick={() => window.location.href = '/incidents/nouveau'}>
                    <AlertTriangle size={18} /> Signaler un nouvel incident
                </Button>
            </div>

            <Row className="mb-4">
                <Col md={8}>
                    <InputGroup className="glass-card border-0 shadow-sm overflow-hidden">
                        <InputGroup.Text className="bg-white border-0 ps-3">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Rechercher un incident (description, lieu, type...)"
                            className="border-0 py-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <InputGroup className="glass-card border-0 shadow-sm overflow-hidden">
                        <InputGroup.Text className="bg-white border-0 ps-3">
                            <Filter size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Select
                            className="border-0 py-3"
                            value={filterGravity}
                            onChange={(e) => setFilterGravity(e.target.value)}
                        >
                            <option value="Tous">Toutes les gravités</option>
                            <option value="Faible">Faible</option>
                            <option value="Moyenne">Moyenne</option>
                            <option value="Élevée">Élevée</option>
                        </Form.Select>
                    </InputGroup>
                </Col>
            </Row>

            <div className="custom-table-container animate-fade-in">
                <Table hover responsive className="custom-table mb-0">
                    <thead>
                        <tr>
                            <th>Type & Gravité</th>
                            <th>Date & Heure</th>
                            <th>Lieu</th>
                            <th>Détenu impliqué</th>
                            <th>Description</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-5">Chargement des incidents...</td></tr>
                        ) : filteredIncidents.length > 0 ? (
                            filteredIncidents.map((incident) => (
                                <tr key={incident.id}>
                                    <td>
                                        <div className="fw-bold mb-1">{incident.type}</div>
                                        {getGravityBadge(incident.gravity)}
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <Clock size={14} className="text-muted" />
                                            {incident.date ? new Date(incident.date).toLocaleString('fr-FR') : 'Date inconnue'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <MapPin size={14} className="text-muted" />
                                            {incident.location}
                                        </div>
                                    </td>
                                    <td>
                                        {incident.detainee ? (
                                            <div className="fw-bold text-primary">
                                                {incident.detainee.lastName ? incident.detainee.lastName.toUpperCase() : 'N/A'} {incident.detainee.firstName || ''}
                                                <div className="small text-muted fw-normal">ID: {incident.detainee.id}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted italic">Non spécifié</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                            {incident.description}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="rounded-circle p-2"
                                                onClick={() => { setSelectedIncident(incident); setShowDetailModal(true); }}
                                            >
                                                <Eye size={16} className="text-primary" />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="rounded-circle p-2"
                                                onClick={() => { setSelectedIncident(incident); setShowReportModal(true); }}
                                            >
                                                <FileText size={16} className="text-secondary" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">Aucun incident trouvé.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Incident Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Détails de l'Incident</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedIncident && (
                        <Row>
                            <Col md={12} className="mb-4">
                                <div className="p-3 bg-light rounded-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="fw-bold mb-0">{selectedIncident.type}</h5>
                                        {getGravityBadge(selectedIncident.gravity)}
                                    </div>
                                    <div className="text-muted small">
                                        <Clock size={14} className="me-1" /> {new Date(selectedIncident.date).toLocaleString('fr-FR')}
                                        <MapPin size={14} className="ms-3 me-1" /> {selectedIncident.location}
                                    </div>
                                </div>
                            </Col>
                            <Col md={6} className="mb-4">
                                <h6 className="fw-bold">Détenu impliqué</h6>
                                <div className="p-3 border rounded-3">
                                    {selectedIncident.detainee ? (
                                        <>
                                            <div className="fw-bold">{selectedIncident.detainee.lastName?.toUpperCase()} {selectedIncident.detainee.firstName}</div>
                                            <div className="small text-muted">ID: {selectedIncident.detainee.id}</div>
                                        </>
                                    ) : "Non spécifié"}
                                </div>
                            </Col>
                            <Col md={12}>
                                <h6 className="fw-bold">Description des faits</h6>
                                <div className="p-3 border rounded-3 bg-white">
                                    {selectedIncident.description}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowDetailModal(false)}>Fermer</Button>
                    <Button variant="primary" onClick={() => window.print()}>Imprimer le rapport</Button>
                </Modal.Footer>
            </Modal>

            {/* Report Generation Modal (Mock) */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Générer un rapport PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <FileText size={48} className="text-primary mb-3" />
                    <p>Voulez-vous générer le rapport officiel pour cet incident ?</p>
                    <div className="small text-muted">Le document inclura les détails de l'incident, les personnes impliquées et les signatures requises.</div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowReportModal(false)}>Annuler</Button>
                    <Button variant="primary" onClick={() => { setShowReportModal(false); alert('Rapport généré avec succès !'); }}>Générer le PDF</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default IncidentList;
