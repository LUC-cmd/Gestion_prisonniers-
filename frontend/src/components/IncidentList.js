import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Filter, AlertTriangle, Clock, MapPin, Eye, FileText } from 'lucide-react';
import IncidentService from '../services/incident.service';

const IncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGravity, setFilterGravity] = useState('Tous');

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
        const matchesSearch = incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.type.toLowerCase().includes(searchTerm.toLowerCase());
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
                <Button className="btn-premium btn-premium-primary">
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
                                            {new Date(incident.date).toLocaleString('fr-FR')}
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
                                                {incident.detainee.lastName.toUpperCase()} {incident.detainee.firstName}
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
                                            <Button variant="light" size="sm" className="rounded-circle p-2">
                                                <Eye size={16} className="text-primary" />
                                            </Button>
                                            <Button variant="light" size="sm" className="rounded-circle p-2">
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
        </div>
    );
};

export default IncidentList;
