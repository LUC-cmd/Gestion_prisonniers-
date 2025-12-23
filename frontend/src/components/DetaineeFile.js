import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Tabs, Tab, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { User, Shield, Heart, Fingerprint, Printer, Edit, ArrowLeft, AlertTriangle, Camera, Trash2, Plus, Truck } from 'lucide-react';
import AuthService from '../services/auth.service';
import DetaineeService from '../services/detainee.service';
import IncidentService from '../services/incident.service';

const DetaineeFile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detainee, setDetainee] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = useState('');
    const [photoType, setPhotoType] = useState('Face');
    const [transfers, setTransfers] = useState([]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [newTransfer, setNewTransfer] = useState({ type: 'Interne', destination: '', reason: '' });

    const currentUser = AuthService.getCurrentUser();
    const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');
    const canManage = isAdmin || currentUser?.roles?.includes('ROLE_PERSONNEL');

    useEffect(() => {
        if (id) {
            fetchDetainee(id);
        }
    }, [id]);

    const fetchDetainee = async (detaineeId) => {
        try {
            const [detaineeRes, incidentsRes, transfersRes] = await Promise.all([
                DetaineeService.getDetaineeById(detaineeId),
                IncidentService.getIncidentsByDetaineeId(detaineeId),
                DetaineeService.getTransfersByDetaineeId(detaineeId)
            ]);
            setDetainee(detaineeRes.data);
            setIncidents(incidentsRes.data);
            setTransfers(transfersRes.data);

            // Parse photos
            try {
                const photoData = JSON.parse(detaineeRes.data.photosJson || '[]');
                setPhotos(photoData);
            } catch (e) {
                setPhotos([]);
            }
        } catch (err) {
            setError('Impossible de charger le dossier du détenu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhoto = async () => {
        if (!newPhotoUrl) return;
        const newPhoto = {
            id: Date.now(),
            url: newPhotoUrl,
            type: photoType,
            date: new Date().toISOString()
        };
        const updatedPhotos = [...photos, newPhoto];
        try {
            await DetaineeService.updateDetainee(id, { photosJson: JSON.stringify(updatedPhotos) });
            setPhotos(updatedPhotos);
            setShowPhotoModal(false);
            setNewPhotoUrl('');
        } catch (err) {
            alert("Erreur lors de l'ajout de la photo");
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm("Supprimer cette photo ?")) return;
        const updatedPhotos = photos.filter(p => p.id !== photoId);
        try {
            await DetaineeService.updateDetainee(id, { photosJson: JSON.stringify(updatedPhotos) });
            setPhotos(updatedPhotos);
        } catch (err) {
            alert("Erreur lors de la suppression");
        }
    };

    const handleAddTransfer = async () => {
        try {
            const transferData = {
                ...newTransfer,
                detaineeId: parseInt(id),
                detaineeName: `${detainee.lastName} ${detainee.firstName}`
            };
            await DetaineeService.addTransfer(transferData);
            const transfersRes = await DetaineeService.getTransfersByDetaineeId(id);
            setTransfers(transfersRes.data);
            setShowTransferModal(false);
            setNewTransfer({ type: 'Interne', destination: '', reason: '' });
        } catch (err) {
            alert("Erreur lors de l'ajout du transfert");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_VALIDATION': return <Badge className="badge-custom badge-warning">En attente</Badge>;
            case 'VALIDATED': return <Badge className="badge-custom badge-success">Validé</Badge>;
            case 'REJECTED': return <Badge className="badge-custom badge-danger">Rejeté</Badge>;
            default: return <Badge className="badge-custom badge-info">{status}</Badge>;
        }
    };

    const getSecurityBadge = (level) => {
        switch (level) {
            case 'Élevé': return <Badge className="badge-custom badge-danger">Niveau Élevé</Badge>;
            case 'Moyen': return <Badge className="badge-custom badge-warning">Niveau Moyen</Badge>;
            case 'Faible': return <Badge className="badge-custom badge-success">Niveau Faible</Badge>;
            default: return <Badge className="badge-custom badge-info">{level || 'Non défini'}</Badge>;
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Chargement du dossier...</p></div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!detainee) return <div className="alert alert-warning m-4">Détenu non trouvé.</div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button variant="light" className="rounded-circle p-2" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="fw-bold text-primary mb-1">Dossier Individuel</h2>
                        <p className="text-muted small">Consultation détaillée du dossier pénitentiaire</p>
                    </div>
                </div>
                <div className="d-flex gap-2 no-print">
                    <Button variant="light" className="rounded-pill shadow-sm" onClick={() => window.print()}>
                        <Printer size={18} className="me-2" /> Imprimer
                    </Button>
                    <Button className="btn-premium btn-premium-primary" onClick={() => navigate(`/detenus/modifier/${detainee.id}`)}>
                        <Edit size={18} /> Modifier le dossier
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={3}>
                    <div className="glass-card p-4 text-center mb-4">
                        <div className="position-relative d-inline-block mb-3">
                            <img
                                src={detainee.photoUrl || 'https://via.placeholder.com/200'}
                                alt="Detainee"
                                className="rounded-3 shadow-sm"
                                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', border: '4px solid white' }}
                            />
                            <div className="position-absolute bottom-0 end-0 p-2">
                                {getSecurityBadge(detainee.securityLevel)}
                            </div>
                        </div>
                        <h4 className="fw-bold mb-1">{detainee.lastName.toUpperCase()}</h4>
                        <h5 className="text-muted mb-3">{detainee.firstName}</h5>
                        <div className="d-flex flex-column gap-2 text-start mt-4">
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="small text-muted">N° Écrou</span>
                                <span className="fw-bold">#{detainee.id}</span>
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="small text-muted">Statut</span>
                                {getStatusBadge(detainee.status)}
                            </div>
                            <div className="d-flex justify-content-between border-bottom pb-2">
                                <span className="small text-muted">Âge</span>
                                <span className="fw-bold">{new Date().getFullYear() - new Date(detainee.birthDate).getFullYear()} ans</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <AlertTriangle size={16} className="text-danger" /> Alertes Vigilance
                        </h6>
                        <div className="small text-danger bg-danger bg-opacity-10 p-2 rounded border-start border-3 border-danger mb-2">
                            Risque de violence modéré
                        </div>
                        <div className="small text-warning bg-warning bg-opacity-10 p-2 rounded border-start border-3 border-warning">
                            Allergie pénicilline
                        </div>
                    </div>
                </Col>

                <Col lg={9}>
                    <div className="glass-card p-0 overflow-hidden mb-4">
                        <Tabs defaultActiveKey="identity" className="custom-tabs px-4 pt-3 border-0">
                            <Tab eventKey="identity" title={<><User size={16} className="me-2" />Identité & État Civil</>}>
                                <div className="p-4">
                                    <Row className="mb-4">
                                        <Col md={6}>
                                            <h6 className="text-primary fw-bold mb-3">Informations Personnelles</h6>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr><td className="text-muted" style={{ width: '150px' }}>Nom complet</td><td className="fw-bold">{detainee.lastName} {detainee.firstName}</td></tr>
                                                    <tr><td className="text-muted">Date de naissance</td><td>{new Date(detainee.birthDate).toLocaleDateString('fr-FR')}</td></tr>
                                                    <tr><td className="text-muted">Lieu de naissance</td><td>{detainee.birthPlace}</td></tr>
                                                    <tr><td className="text-muted">Nationalité</td><td>{detainee.nationality}</td></tr>
                                                    <tr><td className="text-muted">N° Identification</td><td>{detainee.identificationNumber}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col md={6}>
                                            <h6 className="text-primary fw-bold mb-3">Coordonnées & Origine</h6>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr><td className="text-muted" style={{ width: '150px' }}>Dernière adresse</td><td>{detainee.address}</td></tr>
                                                    <tr><td className="text-muted">Situation familiale</td><td>Célibataire</td></tr>
                                                    <tr><td className="text-muted">Profession</td><td>Ouvrier</td></tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <h6 className="text-primary fw-bold mb-3">Contacts d'Urgence</h6>
                                    <Table className="custom-table">
                                        <thead>
                                            <tr><th>Nom</th><th>Relation</th><th>Téléphone</th></tr>
                                        </thead>
                                        <tbody>
                                            {detainee.familyContactsJson ? JSON.parse(detainee.familyContactsJson).map((contact, i) => (
                                                <tr key={i}><td>{contact.name}</td><td>{contact.relation}</td><td>{contact.phone}</td></tr>
                                            )) : <tr><td colSpan="3" className="text-center text-muted">Aucun contact enregistré</td></tr>}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab>

                            <Tab eventKey="judicial" title={<><Shield size={16} className="me-2" />Situation Judiciaire</>}>
                                <div className="p-4">
                                    <Row className="mb-4">
                                        <Col md={6}>
                                            <h6 className="text-primary fw-bold mb-3">Détails de l'Écrou</h6>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr><td className="text-muted" style={{ width: '150px' }}>Type de détention</td><td><Badge bg="secondary">{detainee.detentionType}</Badge></td></tr>
                                                    <tr><td className="text-muted">Date d'arrivée</td><td>{new Date(detainee.arrivalDate).toLocaleDateString('fr-FR')}</td></tr>
                                                    <tr><td className="text-muted">Tribunal</td><td>{detainee.court}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col md={6}>
                                            <h6 className="text-primary fw-bold mb-3">Peine & Libération</h6>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr><td className="text-muted" style={{ width: '150px' }}>Date de jugement</td><td>{detainee.sentenceDate ? new Date(detainee.sentenceDate).toLocaleDateString('fr-FR') : 'N/A'}</td></tr>
                                                    <tr><td className="text-muted">Fin de peine prévue</td><td className="text-danger fw-bold">{detainee.expectedEndDate ? new Date(detainee.expectedEndDate).toLocaleDateString('fr-FR') : 'N/A'}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                    <div className="bg-light p-3 rounded-3 mb-4">
                                        <h6 className="fw-bold mb-2">Infractions retenues</h6>
                                        <p className="mb-0">{detainee.offenses}</p>
                                    </div>
                                    <div className="bg-light p-3 rounded-3">
                                        <h6 className="fw-bold mb-2">Détail de la condamnation</h6>
                                        <p className="mb-0">{detainee.sentence}</p>
                                    </div>
                                </div>
                            </Tab>

                            <Tab eventKey="medical" title={<><Heart size={16} className="me-2" />Suivi Médical</>}>
                                <div className="p-4">
                                    <Row className="mb-4">
                                        <Col md={4}>
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <div className="small text-muted mb-1">Groupe Sanguin</div>
                                                <div className="h3 fw-bold text-danger mb-0">{detainee.bloodType}</div>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <div className="small text-muted mb-1">État de Santé</div>
                                                <div className="h3 fw-bold text-primary mb-0">{detainee.medicalStatus}</div>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <div className="small text-muted mb-1">Dernière Visite</div>
                                                <div className="h3 fw-bold text-secondary mb-0">12/12/2023</div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <h6 className="text-primary fw-bold mb-3">Dossier Médical</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr><td className="text-muted" style={{ width: '200px' }}>Allergies</td><td className="text-danger fw-bold">{detainee.allergies || 'Aucune signalée'}</td></tr>
                                            <tr><td className="text-muted">Traitements en cours</td><td>{detainee.treatments || 'Aucun'}</td></tr>
                                            <tr><td className="text-muted">Antécédents</td><td>{detainee.medicalHistory || 'Néant'}</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab>

                            <Tab eventKey="biometric" title={<><Fingerprint size={16} className="me-2" />Biométrie</>}>
                                <div className="p-4">
                                    <h6 className="text-primary fw-bold mb-3">Signes Distinctifs</h6>
                                    <p className="mb-4">{detainee.distinctiveMarks || 'Aucun signe distinctif particulier signalé.'}</p>

                                    <h6 className="text-primary fw-bold mb-3">Fichiers Biométriques</h6>
                                    <Row>
                                        <Col md={6}>
                                            <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <Fingerprint size={32} className="text-muted" />
                                                    <div>
                                                        <div className="fw-bold">Empreintes Digitales</div>
                                                        <div className="small text-muted">Format NIST .eft</div>
                                                    </div>
                                                </div>
                                                <Button variant="light" size="sm">Consulter</Button>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-3">
                                                    <User size={32} className="text-muted" />
                                                    <div>
                                                        <div className="fw-bold">Scan Facial 3D</div>
                                                        <div className="small text-muted">Format .obj / .jpg</div>
                                                    </div>
                                                </div>
                                                <Button variant="light" size="sm">Consulter</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Tab>

                            <Tab eventKey="incidents" title={<><AlertTriangle size={16} className="me-2" />Incidents</>}>
                                <div className="p-4">
                                    <h6 className="text-primary fw-bold mb-3">Historique des Incidents</h6>
                                    {incidents.length > 0 ? (
                                        <Table responsive className="custom-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Type</th>
                                                    <th>Gravité</th>
                                                    <th>Lieu</th>
                                                    <th>Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {incidents.map((inc, i) => (
                                                    <tr key={i}>
                                                        <td>{new Date(inc.date).toLocaleDateString('fr-FR')}</td>
                                                        <td className="fw-bold">{inc.type}</td>
                                                        <td>
                                                            <Badge className={`badge-custom ${inc.gravity === 'Élevée' ? 'badge-danger' : inc.gravity === 'Moyenne' ? 'badge-warning' : 'badge-success'}`}>
                                                                {inc.gravity}
                                                            </Badge>
                                                        </td>
                                                        <td>{inc.location}</td>
                                                        <td><div className="text-truncate" style={{ maxWidth: '200px' }}>{inc.description}</div></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4 text-muted">Aucun incident signalé pour ce détenu.</div>
                                    )}
                                    <div className="mt-3">
                                        <Button variant="outline-danger" size="sm" onClick={() => navigate('/incidents/nouveau')}>
                                            <AlertTriangle size={14} className="me-1" /> Signaler un incident
                                        </Button>
                                    </div>
                                </div>
                            </Tab>

                            <Tab eventKey="photos" title={<><Camera size={16} className="me-2" />Session Photo</>}>
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h6 className="text-primary fw-bold mb-0">Galerie de Photos du Détenu</h6>
                                        {canManage && (
                                            <Button variant="primary" size="sm" className="rounded-pill" onClick={() => setShowPhotoModal(true)}>
                                                <Plus size={14} className="me-1" /> Ajouter une photo
                                            </Button>
                                        )}
                                    </div>
                                    <Row>
                                        <Col md={4} className="mb-4">
                                            <div className="glass-card p-2 overflow-hidden position-relative">
                                                <img
                                                    src={detainee.photoUrl || 'https://via.placeholder.com/300'}
                                                    alt="Vue de face"
                                                    className="rounded-3 w-100 shadow-sm"
                                                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                                                />
                                                <div className="p-2 text-center small fw-bold">Photo de Profil (Principale)</div>
                                            </div>
                                        </Col>

                                        {photos.map(photo => (
                                            <Col md={4} key={photo.id} className="mb-4">
                                                <div className="glass-card p-2 overflow-hidden position-relative">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.type}
                                                        className="rounded-3 w-100 shadow-sm"
                                                        style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                                                    />
                                                    <div className="p-2 text-center small fw-bold">
                                                        {photo.type} - {new Date(photo.date).toLocaleDateString()}
                                                    </div>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-3 rounded-circle p-1 opacity-75 hover-opacity-100"
                                                            onClick={() => handleDeletePhoto(photo.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </Tab>

                            <Tab eventKey="transfers" title={<><Truck size={16} className="me-2" />Transferts</>}>
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h6 className="text-primary fw-bold mb-0">Historique des Transferts</h6>
                                        {canManage && (
                                            <Button variant="primary" size="sm" className="rounded-pill" onClick={() => setShowTransferModal(true)}>
                                                <Plus size={14} className="me-1" /> Nouveau Transfert
                                            </Button>
                                        )}
                                    </div>
                                    <Table responsive className="custom-table">
                                        <thead>
                                            <tr><th>Date</th><th>Type</th><th>Destination</th><th>Motif</th></tr>
                                        </thead>
                                        <tbody>
                                            {transfers.length > 0 ? transfers.map(t => (
                                                <tr key={t.id}>
                                                    <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                                                    <td><Badge bg={t.type === 'Externe' ? 'danger' : 'info'}>{t.type}</Badge></td>
                                                    <td>{t.destination}</td>
                                                    <td>{t.reason}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center text-muted">Aucun transfert enregistré</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>

                    <div className="glass-card p-4">
                        <h6 className="fw-bold mb-3">Historique des Mouvements</h6>
                        <Table responsive className="custom-table">
                            <thead>
                                <tr><th>Date</th><th>Type</th><th>Provenance/Destination</th><th>Motif</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>12/05/2023</td><td>Entrée</td><td>TGI Paris</td><td>Écrou initial</td></tr>
                                <tr><td>15/06/2023</td><td>Transfert interne</td><td>Quartier A → Quartier B</td><td>Réorganisation</td></tr>
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>

            <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Ajouter une photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">URL de la photo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="https://..."
                                value={newPhotoUrl}
                                onChange={(e) => setNewPhotoUrl(e.target.value)}
                                className="border-0 bg-light rounded-3"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Type de vue</Form.Label>
                            <Form.Select
                                value={photoType}
                                onChange={(e) => setPhotoType(e.target.value)}
                                className="border-0 bg-light rounded-3"
                            >
                                <option value="Face">Face</option>
                                <option value="Profil Gauche">Profil Gauche</option>
                                <option value="Profil Droit">Profil Droit</option>
                                <option value="Signe Distinctif">Signe Distinctif</option>
                                <option value="Autre">Autre</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowPhotoModal(false)}>Annuler</Button>
                    <Button variant="primary" onClick={handleAddPhoto}>Ajouter à la session</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Planifier un Transfert</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Type de transfert</Form.Label>
                            <Form.Select
                                value={newTransfer.type}
                                onChange={(e) => setNewTransfer({ ...newTransfer, type: e.target.value })}
                                className="border-0 bg-light rounded-3"
                            >
                                <option value="Interne">Interne (Changement de cellule/quartier)</option>
                                <option value="Externe">Externe (Hôpital, Tribunal, Autre prison)</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Destination</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ex: Quartier B, Hôpital Central..."
                                value={newTransfer.destination}
                                onChange={(e) => setNewTransfer({ ...newTransfer, destination: e.target.value })}
                                className="border-0 bg-light rounded-3"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Motif</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Raison du transfert..."
                                value={newTransfer.reason}
                                onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                                className="border-0 bg-light rounded-3"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowTransferModal(false)}>Annuler</Button>
                    <Button variant="primary" onClick={handleAddTransfer}>Enregistrer le transfert</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DetaineeFile;
