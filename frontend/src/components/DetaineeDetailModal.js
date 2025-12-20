import React from 'react';
import { Modal, Button, Row, Col, Tabs, Tab, Badge, Table } from 'react-bootstrap';

const DetaineeDetailModal = ({ show, handleClose, detainee }) => {
    if (!detainee) {
        return null;
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_VALIDATION': return <Badge bg="warning">En attente</Badge>;
            case 'VALIDATED': return <Badge bg="success">Validé</Badge>;
            case 'REJECTED': return <Badge bg="danger">Rejeté</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };
    
    // Safely parse JSON fields
    const parseJsonField = (jsonString) => {
        if (!jsonString) return [];
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Failed to parse JSON string:", jsonString, error);
            return [];
        }
    };
    
    const familyContacts = parseJsonField(detainee.familyContactsJson);

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title><i className="bi bi-person-circle me-2"></i>Dossier détenu: {detainee.lastName.toUpperCase()} {detainee.firstName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={3} className="text-center">
                        <img src={detainee.photoUrl || 'https://via.placeholder.com/150'} alt="Detainee" className="detainee-photo mb-3" style={{width: '150px', height: '150px', objectFit: 'cover', borderRadius: '5px', border: '3px solid #3c4b64'}} />
                        <div className="d-grid gap-2">
                            <Button variant="outline-primary" size="sm">Modifier la photo</Button>
                            <Button variant="outline-secondary" size="sm">Imprimer le dossier</Button>
                        </div>
                        <div className="mt-3 p-3 bg-light rounded text-start">
                            <h6>Informations rapides</h6>
                            <div className="small">
                                <div><strong>ID:</strong> {detainee.id}</div>
                                <div><strong>Statut:</strong> {getStatusBadge(detainee.status)}</div>
                                <div><strong>Âge:</strong> {new Date().getFullYear() - new Date(detainee.birthDate).getFullYear()} ans</div>
                            </div>
                        </div>
                    </Col>
                    <Col md={9}>
                        <Tabs defaultActiveKey="profile" id="detainee-details-tabs" className="mb-3">
                            <Tab eventKey="profile" title="Profil">
                                <Row>
                                    <Col md={6}>
                                        <h6>État civil</h6>
                                        <Table striped bordered size="sm">
                                            <tbody>
                                                <tr><th>Nom complet:</th><td>{detainee.lastName} {detainee.firstName}</td></tr>
                                                <tr><th>Date naissance:</th><td>{new Date(detainee.birthDate).toLocaleDateString()}</td></tr>
                                                <tr><th>Lieu naissance:</th><td>{detainee.birthPlace}</td></tr>
                                                <tr><th>Nationalité:</th><td>{detainee.nationality}</td></tr>
                                                <tr><th>N° CIN/Passeport:</th><td>{detainee.identificationNumber}</td></tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={6}>
                                        <h6>Détention</h6>
                                        <Table striped bordered size="sm">
                                            <tbody>
                                                <tr><th>Type:</th><td><Badge bg="secondary">{detainee.detentionType}</Badge></td></tr>
                                                <tr><th>Date d'arrivée:</th><td>{new Date(detainee.arrivalDate).toLocaleDateString()}</td></tr>
                                                <tr><th>Adresse:</th><td>{detainee.address}</td></tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                                <h6 className="mt-4">Contacts familiaux</h6>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr><th>Nom</th><th>Lien</th><th>Téléphone</th></tr>
                                    </thead>
                                    <tbody>
                                        {familyContacts.length > 0 ? familyContacts.map((contact, index) => (
                                            <tr key={index}>
                                                <td>{contact.name}</td>
                                                <td>{contact.relation}</td>
                                                <td>{contact.phone}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="text-center">Aucun contact familial enregistré.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Tab>
                            
                            <Tab eventKey="judicial" title="Judiciaire">
                                <h6>Infractions et Peines</h6>
                                <Table striped bordered size="sm">
                                    <tbody>
                                        <tr><th>Infractions:</th><td>{detainee.offenses}</td></tr>
                                        <tr><th>Peine:</th><td>{detainee.sentence}</td></tr>
                                        <tr><th>Date de jugement:</th><td>{detainee.sentenceDate ? new Date(detainee.sentenceDate).toLocaleDateString() : 'N/A'}</td></tr>
                                        <tr><th>Fin de peine prévue:</th><td>{detainee.expectedEndDate ? new Date(detainee.expectedEndDate).toLocaleDateString() : 'N/A'}</td></tr>
                                        <tr><th>Tribunal:</th><td>{detainee.court}</td></tr>
                                    </tbody>
                                </Table>
                            </Tab>

                            <Tab eventKey="medical" title="Médical">
                                <h6>Fiche Médicale</h6>
                                <Table striped bordered size="sm">
                                    <tbody>
                                        <tr><th>Groupe sanguin:</th><td><Badge bg="danger">{detainee.bloodType}</Badge></td></tr>
                                        <tr><th>État de santé:</th><td>{detainee.medicalStatus}</td></tr>
                                        <tr><th>Allergies:</th><td>{detainee.allergies}</td></tr>
                                        <tr><th>Traitements en cours:</th><td>{detainee.treatments}</td></tr>
                                        <tr><th>Antécédents médicaux:</th><td>{detainee.medicalHistory}</td></tr>
                                    </tbody>
                                </Table>
                            </Tab>

                            <Tab eventKey="biometric" title="Biométrie">
                                <h6>Données Biométriques</h6>
                                <Table striped bordered size="sm">
                                    <tbody>
                                        <tr><th>Signes distinctifs:</th><td>{detainee.distinctiveMarks}</td></tr>
                                        <tr><th>Particularités physiques:</th><td>{detainee.physicalPeculiarities}</td></tr>
                                        <tr><th>Empreintes digitales:</th><td><a href={detainee.fingerprintsUrl || '#'} target="_blank" rel="noopener noreferrer">{detainee.fingerprintsUrl ? 'Voir Fichier' : 'Non disponible'}</a></td></tr>
                                        <tr><th>Reconnaissance faciale:</th><td><a href={detainee.facialRecognitionUrl || '#'} target="_blank" rel="noopener noreferrer">{detainee.facialRecognitionUrl ? 'Voir Fichier' : 'Non disponible'}</a></td></tr>
                                    </tbody>
                                </Table>
                            </Tab>

                        </Tabs>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Fermer</Button>
                <Button variant="primary">Modifier le dossier</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetaineeDetailModal;
