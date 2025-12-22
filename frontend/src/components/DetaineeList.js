import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Search, Filter, UserPlus, FileText, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import DetaineeService from '../services/detainee.service';

const DetaineeList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [detainees, setDetainees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Tous');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
        fetchDetainees();
    }, [location.search]);

    const fetchDetainees = async () => {
        try {
            const response = await DetaineeService.getAllDetainees();
            setDetainees(response.data);
        } catch (error) {
            console.error("Error fetching detainees:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VALIDATED': return <Badge className="badge-custom badge-success">Validé</Badge>;
            case 'PENDING_VALIDATION': return <Badge className="badge-custom badge-warning">En attente</Badge>;
            case 'REJECTED': return <Badge className="badge-custom badge-danger">Rejeté</Badge>;
            default: return <Badge className="badge-custom badge-info">{status}</Badge>;
        }
    };

    const filteredDetainees = detainees.filter(detainee => {
        const fullName = `${detainee.lastName} ${detainee.firstName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            detainee.id.toString().includes(searchTerm);
        const matchesStatus = filterStatus === 'Tous' || detainee.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">Dossiers des Détenus</h2>
                    <p className="text-muted small">Gestion et consultation de la population carcérale</p>
                </div>
                <Button className="btn-premium btn-premium-primary" onClick={() => navigate('/detenus/nouveau')}>
                    <UserPlus size={18} /> Nouveau Détenu
                </Button>
            </div>

            <Row className="mb-4">
                <Col md={8}>
                    <InputGroup className="glass-card border-0 shadow-sm overflow-hidden">
                        <InputGroup.Text className="bg-white border-0 ps-3">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Rechercher par nom ou N° d'écrou..."
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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="Tous">Tous les statuts</option>
                            <option value="VALIDATED">Validés</option>
                            <option value="PENDING_VALIDATION">En attente</option>
                            <option value="REJECTED">Rejetés</option>
                        </Form.Select>
                    </InputGroup>
                </Col>
            </Row>

            <div className="custom-table-container animate-fade-in">
                <Table hover responsive className="custom-table mb-0">
                    <thead>
                        <tr>
                            <th>N° Écrou</th>
                            <th>Identité</th>
                            <th>Date d'arrivée</th>
                            <th>Type de détention</th>
                            <th>Statut</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" size="sm" className="me-2" /> Chargement...</td></tr>
                        ) : filteredDetainees.length > 0 ? (
                            filteredDetainees.map((detainee) => (
                                <tr key={detainee.id}>
                                    <td className="fw-bold">#{detainee.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                <Shield size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="fw-bold">{detainee.lastName.toUpperCase()} {detainee.firstName}</div>
                                                <div className="small text-muted">{detainee.nationality || 'Nationalité non renseignée'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{new Date(detainee.arrivalDate).toLocaleDateString('fr-FR')}</td>
                                    <td>{detainee.detentionType}</td>
                                    <td>{getStatusBadge(detainee.status)}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="light" size="sm" className="rounded-pill" onClick={() => navigate(`/detenus/${detainee.id}`)}>
                                                <FileText size={16} className="text-primary me-1" /> Dossier
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">Aucun détenu trouvé.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default DetaineeList;
