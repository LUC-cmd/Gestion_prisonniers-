import React, { useState, useEffect } from 'react';
import { Row, Col, Badge, Button, Table, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Shield, Activity, Truck, Users, Plus } from 'lucide-react';
import DetaineeService from '../services/detainee.service';
import PlanningService from '../services/planning.service';

const Planning = () => {
    const [currentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [planningType, setPlanningType] = useState('Transfert Externe');
    const [detainees, setDetainees] = useState([]);
    const [allPlanning, setAllPlanning] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newActivity, setNewActivity] = useState({
        detaineeId: '',
        type: 'Transfert Externe',
        destination: '',
        time: '',
        date: new Date().toISOString().split('T')[0],
        details: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [detaineesRes, planningRes] = await Promise.all([
                DetaineeService.getAllDetainees(),
                PlanningService.getAllPlanning()
            ]);
            setDetainees(detaineesRes.data);
            setAllPlanning(planningRes.data);
        } catch (err) {
            console.error("Erreur lors du chargement des données", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        try {
            const selectedDetainee = detainees.find(d => d.id === parseInt(newActivity.detaineeId));
            const activityData = {
                ...newActivity,
                detaineeName: selectedDetainee ? `${selectedDetainee.lastName} ${selectedDetainee.firstName}` : 'N/A'
            };
            await PlanningService.addPlanning(activityData);
            await fetchData();
            setShowModal(false);
            setNewActivity({
                detaineeId: '',
                type: 'Transfert Externe',
                destination: '',
                time: '',
                date: new Date().toISOString().split('T')[0],
                details: ''
            });
        } catch (err) {
            alert("Erreur lors de l'ajout de l'activité");
        }
    };

    const timeSlots = ['06:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00', '00:00 - 06:00'];

    const guardSchedule = [
        { post: 'Surveillant Chef', shifts: ['Martin Dupont', 'Sophie Leroy', 'Pierre Moreau', 'Jean Petit'], status: 'Complet' },
        { post: 'Secteur A (Nord)', shifts: ['2/3 Agents', '3/3 Agents', '2/3 Agents', '2/3 Agents'], status: 'Partiel' },
        { post: 'Secteur B (Sud)', shifts: ['3/3 Agents', '3/3 Agents', '3/3 Agents', '2/3 Agents'], status: 'Complet' },
        { post: 'Poste de Contrôle', shifts: ['Lucie Bernard', 'Thomas Petit', 'Marc Simon', 'Julie Morel'], status: 'Complet' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Complet': case 'Confirmé': case 'Terminé': return <Badge className="badge-custom badge-success">{status}</Badge>;
            case 'Partiel': case 'En attente': case 'En cours': return <Badge className="badge-custom badge-warning">{status}</Badge>;
            case 'Critique': return <Badge className="badge-custom badge-danger">{status}</Badge>;
            default: return <Badge className="badge-custom badge-info">{status}</Badge>;
        }
    };

    const transferPlanning = allPlanning.filter(p => p.type.includes('Transfert'));
    const visitPlanning = allPlanning.filter(p => p.type === 'Visite');

    if (loading) return <div className="text-center py-5">Chargement...</div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">Planning de l'Établissement</h2>
                    <p className="text-muted small">Gestion des rotations du personnel et des activités programmées</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="light" className="rounded-pill shadow-sm">
                        <CalendarIcon size={18} className="me-2" /> Aujourd'hui
                    </Button>
                    <Button className="btn-premium btn-premium-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Planifier une activité
                    </Button>
                </div>
            </div>

            <Row className="mb-4">
                <Col lg={8}>
                    <div className="glass-card p-0 overflow-hidden mb-4">
                        <Tabs defaultActiveKey="guard" className="custom-tabs px-4 pt-3 border-0">
                            <Tab eventKey="guard" title={<><Shield size={16} className="me-2" />Surveillants</>}>
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Rotation du Personnel - {currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</h5>
                                        <div className="d-flex gap-2">
                                            <Button variant="light" size="sm" className="rounded-circle"><ChevronLeft size={16} /></Button>
                                            <Button variant="light" size="sm" className="rounded-circle"><ChevronRight size={16} /></Button>
                                        </div>
                                    </div>
                                    <div className="custom-table-container">
                                        <Table responsive className="custom-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Poste / Unité</th>
                                                    {timeSlots.map(slot => <th key={slot} className="text-center">{slot}</th>)}
                                                    <th className="text-center">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {guardSchedule.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-bold">{item.post}</td>
                                                        {item.shifts.map((shift, sIdx) => (
                                                            <td key={sIdx} className="text-center small">{shift}</td>
                                                        ))}
                                                        <td className="text-center">{getStatusBadge(item.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="transfers" title={<><Truck size={16} className="me-2" />Transferts</>}>
                                <div className="p-4">
                                    <h5 className="fw-bold mb-4">Planning des Transferts (Interne/Externe)</h5>
                                    <div className="custom-table-container">
                                        <Table responsive className="custom-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Détenu</th>
                                                    <th>Type</th>
                                                    <th>Destination</th>
                                                    <th>Heure</th>
                                                    <th className="text-center">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transferPlanning.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-bold">{item.detaineeName}</td>
                                                        <td><Badge bg={item.type === 'Transfert Externe' ? 'danger' : 'info'}>{item.type}</Badge></td>
                                                        <td>{item.destination}</td>
                                                        <td>{item.time}</td>
                                                        <td className="text-center">{getStatusBadge(item.status)}</td>
                                                    </tr>
                                                ))}
                                                {transferPlanning.length === 0 && <tr><td colSpan="5" className="text-center py-3 text-muted">Aucun transfert planifié</td></tr>}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="visits" title={<><Users size={16} className="me-2" />Visites</>}>
                                <div className="p-4">
                                    <h5 className="fw-bold mb-4">Planning des Visites & Parloirs</h5>
                                    <div className="custom-table-container">
                                        <Table responsive className="custom-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Détenu</th>
                                                    <th>Visiteur</th>
                                                    <th>Horaire</th>
                                                    <th className="text-center">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visitPlanning.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-bold">{item.detaineeName}</td>
                                                        <td>{item.visitor || 'N/A'}</td>
                                                        <td>{item.time}</td>
                                                        <td className="text-center">{getStatusBadge(item.status)}</td>
                                                    </tr>
                                                ))}
                                                {visitPlanning.length === 0 && <tr><td colSpan="4" className="text-center py-3 text-muted">Aucune visite planifiée</td></tr>}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="glass-card p-4 mb-4">
                        <h5 className="fw-bold mb-3">Activités du Jour</h5>
                        <div className="d-flex flex-column gap-3">
                            <div className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold small">Promenade Secteur A</span>
                                    <Badge bg="primary" className="rounded-pill">09:00 - 11:00</Badge>
                                </div>
                                <div className="small text-muted"><Clock size={12} /> En cours</div>
                            </div>
                            <div className="p-3 rounded-3 bg-light border-start border-4 border-success">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold small">Atelier Menuiserie</span>
                                    <Badge bg="success" className="rounded-pill">14:00 - 17:00</Badge>
                                </div>
                                <div className="small text-muted"><Clock size={12} /> À venir</div>
                            </div>
                        </div>
                        <Button variant="outline-primary" className="w-100 mt-4 rounded-pill">Voir tout le calendrier</Button>
                    </div>

                    <div className="glass-card p-4">
                        <h5 className="fw-bold mb-3">Statistiques de Présence</h5>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="stat-icon bg-info text-white"><Shield size={20} /></div>
                            <div>
                                <div className="small text-muted">Surveillants</div>
                                <div className="fw-bold">42 / 45 présents</div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="stat-icon bg-success text-white"><Activity size={20} /></div>
                            <div>
                                <div className="small text-muted">Service Médical</div>
                                <div className="fw-bold">8 / 8 présents</div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Nouvelle Planification</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddActivity}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Détenu concerné</Form.Label>
                                    <Form.Select
                                        required
                                        value={newActivity.detaineeId}
                                        onChange={(e) => setNewActivity({ ...newActivity, detaineeId: e.target.value })}
                                        className="border-0 bg-light rounded-3"
                                    >
                                        <option value="">Sélectionner un détenu</option>
                                        {detainees.map(d => (
                                            <option key={d.id} value={d.id}>{d.lastName} {d.firstName} (#{d.id})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Type d'activité</Form.Label>
                                    <Form.Select
                                        value={newActivity.type}
                                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                                        className="border-0 bg-light rounded-3"
                                    >
                                        <option value="Transfert Interne">Transfert Interne</option>
                                        <option value="Transfert Externe">Transfert Externe</option>
                                        <option value="Visite">Visite / Parloir</option>
                                        <option value="Médical">Rendez-vous Médical</option>
                                        <option value="Tribunal">Audience Tribunal</option>
                                        <option value="Autre">Autre activité</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={newActivity.date}
                                        onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                                        className="border-0 bg-light rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Heure</Form.Label>
                                    <Form.Control
                                        type="time"
                                        required
                                        value={newActivity.time}
                                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                        className="border-0 bg-light rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Destination / Lieu</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ex: Quartier B, Hôpital, Parloir 1..."
                                value={newActivity.destination}
                                onChange={(e) => setNewActivity({ ...newActivity, destination: e.target.value })}
                                className="border-0 bg-light rounded-3"
                            />
                        </Form.Group>

                        {newActivity.type === 'Visite' && (
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Nom du visiteur</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nom du visiteur..."
                                    value={newActivity.visitor || ''}
                                    onChange={(e) => setNewActivity({ ...newActivity, visitor: e.target.value })}
                                    className="border-0 bg-light rounded-3"
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Détails / Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Notes complémentaires..."
                                value={newActivity.details}
                                onChange={(e) => setNewActivity({ ...newActivity, details: e.target.value })}
                                className="border-0 bg-light rounded-3"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button type="submit" className="btn-premium btn-premium-primary">Enregistrer la planification</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Planning;

