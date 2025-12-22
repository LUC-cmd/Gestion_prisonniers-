import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { AlertTriangle, Calendar, MapPin, User, FileText, Save, ArrowLeft } from 'lucide-react';
import IncidentService from '../services/incident.service';
import DetaineeService from '../services/detainee.service';

const IncidentFormPage = () => {
    const navigate = useNavigate();
    const [incident, setIncident] = useState({
        type: '',
        date: new Date().toISOString().slice(0, 16),
        location: '',
        description: '',
        gravity: 'Moyenne',
        detaineeId: ''
    });
    const [detainees, setDetainees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);

    useEffect(() => {
        DetaineeService.getAllDetainees()
            .then(response => setDetainees(response.data))
            .catch(err => console.error('Error fetching detainees:', err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setIncident({ ...incident, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const incidentData = {
            ...incident,
            detainee: incident.detaineeId ? { id: incident.detaineeId } : null
        };

        try {
            await IncidentService.createIncident(incidentData);
            setMessage('Incident signalé avec succès !');
            setSuccessful(true);
            setTimeout(() => navigate('/incidents'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Une erreur est survenue.');
            setSuccessful(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button variant="light" className="rounded-circle p-2" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="fw-bold text-primary mb-1">Signaler un Incident</h2>
                        <p className="text-muted small">Déclaration officielle d'un événement perturbateur ou inhabituel</p>
                    </div>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="glass-card p-4">
                        {message && <Alert variant={successful ? "success" : "danger"} className="border-0 shadow-sm">{message}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                                            <FileText size={16} className="text-primary" /> Type d'incident *
                                        </Form.Label>
                                        <Form.Select name="type" value={incident.type} onChange={handleChange} required className="border-0 bg-light rounded-3 py-2">
                                            <option value="">Sélectionner...</option>
                                            <option>Altercation entre détenus</option>
                                            <option>Évasion tentée</option>
                                            <option>Violence envers le personnel</option>
                                            <option>Dégradation de matériel</option>
                                            <option>Possession d'objets interdits</option>
                                            <option>Refus d'obtempérer</option>
                                            <option>Autre</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                                            <Calendar size={16} className="text-primary" /> Date et heure *
                                        </Form.Label>
                                        <Form.Control type="datetime-local" name="date" value={incident.date} onChange={handleChange} required className="border-0 bg-light rounded-3 py-2" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                                            <MapPin size={16} className="text-primary" /> Lieu de l'incident *
                                        </Form.Label>
                                        <Form.Control type="text" name="location" placeholder="Ex: Cellule B12, Cour Nord, Atelier..." value={incident.location} onChange={handleChange} required className="border-0 bg-light rounded-3 py-2" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                                            <User size={16} className="text-primary" /> Détenu principal impliqué
                                        </Form.Label>
                                        <Form.Select name="detaineeId" value={incident.detaineeId} onChange={handleChange} className="border-0 bg-light rounded-3 py-2">
                                            <option value="">Sélectionner un détenu (optionnel)...</option>
                                            {detainees.map(d => (
                                                <option key={d.id} value={d.id}>{d.lastName.toUpperCase()} {d.firstName} (ID: {d.id})</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                                    <AlertTriangle size={16} className="text-primary" /> Niveau de Gravité
                                </Form.Label>
                                <div className="d-flex gap-3">
                                    {['Faible', 'Moyenne', 'Élevée'].map(level => (
                                        <div key={level} className={`flex-grow-1 p-3 rounded-3 border text-center cursor-pointer transition-all ${incident.gravity === level ? 'bg-primary text-white border-primary shadow-sm' : 'bg-light border-transparent'}`} onClick={() => setIncident({ ...incident, gravity: level })}>
                                            <div className="fw-bold">{level}</div>
                                        </div>
                                    ))}
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                                    <FileText size={16} className="text-primary" /> Description détaillée des faits *
                                </Form.Label>
                                <Form.Control as="textarea" rows={6} name="description" value={incident.description} onChange={handleChange} required placeholder="Décrivez précisément le déroulement de l'incident, les témoins présents et les mesures immédiates prises..." className="border-0 bg-light rounded-3 py-2" />
                            </Form.Group>

                            <div className="d-flex justify-content-end gap-3 mt-5">
                                <Button variant="light" className="px-4 rounded-pill" onClick={() => navigate(-1)}>Annuler</Button>
                                <Button type="submit" className="btn-premium btn-premium-primary px-5" disabled={loading}>
                                    {loading ? 'Envoi en cours...' : <><Save size={18} /> Enregistrer le Rapport</>}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="glass-card p-4 mb-4">
                        <h6 className="fw-bold mb-3">Consignes de Rédaction</h6>
                        <ul className="small text-muted ps-3">
                            <li className="mb-2">Soyez factuel et objectif dans la description.</li>
                            <li className="mb-2">Précisez les noms de tous les agents témoins.</li>
                            <li className="mb-2">Mentionnez si des soins médicaux ont été nécessaires.</li>
                            <li className="mb-2">Indiquez si du matériel a été saisi ou endommagé.</li>
                        </ul>
                    </div>
                    <div className="glass-card p-4 bg-primary bg-opacity-10 border-primary border-opacity-25">
                        <h6 className="fw-bold mb-2 text-primary">Procédure d'Urgence</h6>
                        <p className="small mb-0">Pour tout incident de gravité <strong>Élevée</strong>, un signalement radio immédiat au PC Sécurité est obligatoire avant la rédaction de ce rapport.</p>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default IncidentFormPage;
