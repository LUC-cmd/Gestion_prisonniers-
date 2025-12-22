import React, { useState } from 'react';
import { Row, Col, Badge, Button, Table } from 'react-bootstrap';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Shield, Coffee, Activity } from 'lucide-react';

const Planning = () => {
    const [currentDate] = useState(new Date());

    const timeSlots = ['06:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00', '00:00 - 06:00'];

    const mockSchedule = [
        { post: 'Surveillant Chef', shifts: ['Martin Dupont', 'Sophie Leroy', 'Pierre Moreau', 'Jean Petit'], status: 'Complet' },
        { post: 'Secteur A (Nord)', shifts: ['2/3 Agents', '3/3 Agents', '2/3 Agents', '2/3 Agents'], status: 'Partiel' },
        { post: 'Secteur B (Sud)', shifts: ['3/3 Agents', '3/3 Agents', '3/3 Agents', '2/3 Agents'], status: 'Complet' },
        { post: 'Poste de Contrôle', shifts: ['Lucie Bernard', 'Thomas Petit', 'Marc Simon', 'Julie Morel'], status: 'Complet' },
        { post: 'Équipe Médicale', shifts: ['1 Méd. / 2 Inf.', '1 Infirmier', '1 Infirmier', '1 Infirmier'], status: 'Complet' },
        { post: 'Ateliers / Cuisine', shifts: ['Ouvert', 'Ouvert', 'Fermé', 'Fermé'], status: 'N/A' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Complet': return <Badge className="badge-custom badge-success">Complet</Badge>;
            case 'Partiel': return <Badge className="badge-custom badge-warning">Partiel</Badge>;
            case 'Critique': return <Badge className="badge-custom badge-danger">Critique</Badge>;
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
                    <Button className="btn-premium btn-premium-primary">
                        Planifier une activité
                    </Button>
                </div>
            </div>

            <Row className="mb-4">
                <Col lg={8}>
                    <div className="glass-card p-4 mb-4">
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
                                    {mockSchedule.map((item, idx) => (
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
                            <div className="p-3 rounded-3 bg-light border-start border-4 border-warning">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold small">Visites Familiales</span>
                                    <Badge bg="warning" className="rounded-pill">13:30 - 18:00</Badge>
                                </div>
                                <div className="small text-muted"><Clock size={12} /> À venir</div>
                            </div>
                            <div className="p-3 rounded-3 bg-light border-start border-4 border-danger">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold small">Transfert Médical</span>
                                    <Badge bg="danger" className="rounded-pill">15:00</Badge>
                                </div>
                                <div className="small text-muted"><Clock size={12} /> Urgent</div>
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
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon bg-warning text-white"><Coffee size={20} /></div>
                            <div>
                                <div className="small text-muted">Logistique / Cuisine</div>
                                <div className="fw-bold">12 / 15 présents</div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Planning;
