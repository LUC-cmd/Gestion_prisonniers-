import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import IncidentService from '../services/incident.service';
import DetaineeService from '../services/detainee.service';

const IncidentModal = ({ show, handleClose, onIncidentReported }) => {
    const [incident, setIncident] = useState({
        type: '',
        date: new Date().toISOString().slice(0, 16), // Default to now
        location: '',
        description: '',
        gravity: 'Moyenne',
        detaineeId: ''
    });
    const [detainees, setDetainees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (show) {
            // Fetch detainees when modal is opened
            DetaineeService.getAllDetainees()
                .then(response => {
                    setDetainees(response.data);
                })
                .catch(err => {
                    setError('Impossible de charger la liste des détenus.');
                });
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setIncident({ ...incident, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const incidentData = {
            ...incident,
            detainee: { id: incident.detaineeId } // Nest detainee object as expected by backend
        };

        try {
            await IncidentService.createIncident(incidentData);
            setSuccess('Incident signalé avec succès !');
            if(onIncidentReported) onIncidentReported();
            setTimeout(() => {
                handleClose();
                setSuccess('');
            }, 2000);
        } catch (err) {
            const resMessage = err.response?.data?.message || err.message || 'Une erreur est survenue.';
            setError(resMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title><i className="bi bi-exclamation-triangle me-2"></i>Signaler un incident</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <Row>
                        <Col md={6} className="mb-3">
                            <Form.Label>Type d'incident *</Form.Label>
                            <Form.Select name="type" value={incident.type} onChange={handleChange} required>
                                <option value="">Sélectionner...</option>
                                <option>Altercation entre détenus</option>
                                <option>Évasion tentée</option>
                                <option>Violence envers le personnel</option>
                                <option>Dégradation de matériel</option>
                                <option>Autre</option>
                            </Form.Select>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label>Date et heure *</Form.Label>
                            <Form.Control type="datetime-local" name="date" value={incident.date} onChange={handleChange} required />
                        </Col>
                    </Row>
                    <div className="mb-3">
                        <Form.Label>Lieu *</Form.Label>
                        <Form.Control type="text" name="location" placeholder="Quartier, cellule, atelier..." value={incident.location} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <Form.Label>Détenu(s) impliqué(s)</Form.Label>
                        <Form.Select name="detaineeId" value={incident.detaineeId} onChange={handleChange}>
                            <option value="">Sélectionner un détenu...</option>
                            {detainees.map(d => (
                                <option key={d.id} value={d.id}>{d.lastName.toUpperCase()} {d.firstName} (ID: {d.id})</option>
                            ))}
                        </Form.Select>
                    </div>
                    <div className="mb-3">
                        <Form.Label>Description détaillée *</Form.Label>
                        <Form.Control as="textarea" rows={4} name="description" value={incident.description} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <Form.Label>Gravité</Form.Label>
                        <div>
                            {['Faible', 'Moyenne', 'Élevée'].map(level => (
                                <Form.Check
                                    inline
                                    type="radio"
                                    label={level}
                                    name="gravity"
                                    id={`gravity-${level}`}
                                    value={level}
                                    checked={incident.gravity === level}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" size="sm" /> : "Signaler l'incident"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default IncidentModal;
