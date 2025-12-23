import React, { useState } from 'react';
import { Row, Col, Badge, Button, Table, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Shield, Activity, Truck, Users, Plus } from 'lucide-react';

const Planning = () => {
    const [currentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [planningType, setPlanningType] = useState('guard');

    const timeSlots = ['06:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00', '00:00 - 06:00'];

    const guardSchedule = [
        { post: 'Surveillant Chef', shifts: ['Martin Dupont', 'Sophie Leroy', 'Pierre Moreau', 'Jean Petit'], status: 'Complet' },
        { post: 'Secteur A (Nord)', shifts: ['2/3 Agents', '3/3 Agents', '2/3 Agents', '2/3 Agents'], status: 'Partiel' },
        { post: 'Secteur B (Sud)', shifts: ['3/3 Agents', '3/3 Agents', '3/3 Agents', '2/3 Agents'], status: 'Complet' },
        { post: 'Poste de Contrôle', shifts: ['Lucie Bernard', 'Thomas Petit', 'Marc Simon', 'Julie Morel'], status: 'Complet' },
    ];

    const transferSchedule = [
        { id: 1, detainee: 'DUPONT Jean', type: 'Externe', destination: 'Hôpital Central', time: '09:00', status: 'Confirmé' },
        { id: 2, detainee: 'LEROI Marc', type: 'Interne', destination: 'Quartier C', time: '14:30', status: 'En attente' },
        { id: 3, detainee: 'BERNARD Paul', type: 'Externe', destination: 'Tribunal Gland', time: '08:15', status: 'Terminé' },
    ];

    const visitSchedule = [
        { id: 1, detainee: 'DUPONT Jean', visitor: 'Mme Dupont (Épouse)', room: 'Parloir 1', time: '10:00 - 11:00', status: 'En cours' },
        { id: 2, detainee: 'SIMON Marc', visitor: 'M. Simon (Père)', room: 'Parloir 3', time: '14:00 - 15:00', status: 'À venir' },
        { id: 3, detainee: 'MOREL Julie', visitor: 'Avocat', room: 'Box 2', time: '11:30 - 12:30', status: 'Confirmé' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Complet': case 'Confirmé': case 'Terminé': return <Badge className="badge-custom badge-success">{status}</Badge>;
            case 'Partiel': case 'En attente': case 'En cours': return <Badge className="badge-custom badge-warning">{status}</Badge>;
            case 'Critique': return <Badge className="badge-custom badge-danger">{status}</Badge>;
            default: return <Badge className="badge-custom badge-info">{status}</Badge>;
        }
    };

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
                        <Tabs defaultActiveKey="guard" className="custom-tabs px-4 pt-3 border-0" onSelect={(k) => setPlanningType(k)}>
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
                                                {transferSchedule.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-bold">{item.detainee}</td>
                                                        <td><Badge bg={item.type === 'Externe' ? 'danger' : 'info'}>{item.type}</Badge></td>
                                                        <td>{item.destination}</td>
                                                        <td>{item.time}</td>
                                                        <td className="text-center">{getStatusBadge(item.status)}</td>
                                                    </tr>
                                                ))}
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
                                                    <th>Lieu</th>
                                                    <th>Horaire</th>
                                                    <th className="text-center">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visitSchedule.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-bold">{item.detainee}</td>
                                                        <td>{item.visitor}</td>
                                                        <td>{item.room}</td>
                                                        <td>{item.time}</td>
                                                        <td className="text-center">{getStatusBadge(item.status)}</td>
                                                    </tr>
                                                ))}
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

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Nouvelle Planification</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Type d'activité</Form.Label>
                            <Form.Select value={planningType} onChange={(e) => setPlanningType(e.target.value)} className="border-0 bg-light rounded-3">
                                <option value="guard">Rotation Surveillant</option>
                                <option value="transfers">Transfert Détenu</option>
                                <option value="visits">Visite / Parloir</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Détails</Form.Label>
                            <Form.Control type="text" placeholder="Ex: Transfert vers TGI, Parloir Famille..." className="border-0 bg-light rounded-3" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Date & Heure</Form.Label>
                            <Form.Control type="datetime-local" className="border-0 bg-light rounded-3" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowModal(false)}>Annuler</Button>
                    <Button className="btn-premium btn-premium-primary" onClick={() => setShowModal(false)}>Enregistrer</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Planning;
