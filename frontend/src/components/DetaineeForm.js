import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Row, Col, Tab, Tabs, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, FileUp, Save, User, Shield, Heart, Fingerprint, Plus, XCircle } from 'lucide-react';
import DetaineeService from '../services/detainee.service';
import FileService from '../services/file.service';

const DetaineeForm = ({ isEdit }) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const photoInputRef = useRef(null);

    const [detainee, setDetainee] = useState({
        lastName: '', firstName: '', birthDate: '', birthPlace: '', detentionType: '',
        arrivalDate: '', photoUrl: '', nationality: '', identificationNumber: '',
        address: '', familyContactsJson: '[]', offenses: '', sentence: '',
        sentenceDate: '', expectedEndDate: '', court: '', bloodType: '',
        medicalStatus: '', allergies: '', treatments: '', medicalHistory: '',
        distinctiveMarks: '', physicalPeculiarities: '', fingerprintsUrl: '',
        facialRecognitionUrl: '', securityLevel: '',
        sentenceDurationMonths: '',
    });

    const [familyContacts, setFamilyContacts] = useState([]);

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            DetaineeService.getDetaineeById(id)
                .then(response => {
                    setDetainee(response.data);
                    if (response.data.photoUrl) setPhotoPreview(response.data.photoUrl);

                    // Parse family contacts
                    try {
                        const contacts = JSON.parse(response.data.familyContactsJson || '[]');
                        setFamilyContacts(contacts);
                    } catch (e) {
                        setFamilyContacts([]);
                    }

                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching detainee:", err);
                    setMessage("Erreur lors du chargement du dossier.");
                    setLoading(false);
                });
        }
    }, [isEdit, id]);

    const handleAddContact = () => {
        setFamilyContacts([...familyContacts, { name: '', relation: '', phone: '' }]);
    };

    const handleRemoveContact = (index) => {
        const newContacts = [...familyContacts];
        newContacts.splice(index, 1);
        setFamilyContacts(newContacts);
    };

    const handleContactChange = (index, field, value) => {
        const newContacts = [...familyContacts];
        newContacts[index][field] = value;
        setFamilyContacts(newContacts);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedDetainee = { ...detainee, [name]: value };

        // Auto-calculate expectedEndDate if arrivalDate and duration are present
        if ((name === 'arrivalDate' || name === 'sentenceDurationMonths') && updatedDetainee.arrivalDate && updatedDetainee.sentenceDurationMonths) {
            const arrival = new Date(updatedDetainee.arrivalDate);
            const duration = parseInt(updatedDetainee.sentenceDurationMonths);
            if (!isNaN(duration)) {
                const endDate = new Date(arrival);
                endDate.setMonth(arrival.getMonth() + duration);
                updatedDetainee.expectedEndDate = endDate.toISOString().split('T')[0];
            }
        }

        setDetainee(updatedDetainee);
    };

    const handlePhotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setUploading(true);
        try {
            let uploadedPhotoUrl = detainee.photoUrl;
            if (photoFile) {
                const photoResponse = await FileService.uploadFile(photoFile, (event) => {
                    setUploadProgress(Math.round((100 * event.loaded) / event.total));
                });
                uploadedPhotoUrl = photoResponse.data.message;
            }

            const detaineeDataToSubmit = {
                ...detainee,
                photoUrl: uploadedPhotoUrl,
                familyContactsJson: JSON.stringify(familyContacts)
            };

            if (isEdit) {
                await DetaineeService.updateDetainee(id, detaineeDataToSubmit);
                setMessage('Dossier mis à jour avec succès !');
            } else {
                await DetaineeService.createDetainee(detaineeDataToSubmit);
                setMessage('Détenu enregistré avec succès !');
            }

            setSuccessful(true);
            setTimeout(() => navigate(isEdit ? `/detenus/${id}` : '/detenus'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
            setSuccessful(false);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1">{isEdit ? 'Modifier le Dossier' : 'Nouveau Dossier Détenu'}</h2>
                    <p className="text-muted small">{isEdit ? `Modification du dossier #${id}` : "Enregistrement d'une nouvelle entrée dans l'établissement"}</p>
                </div>
            </div>

            <Form onSubmit={handleSubmit}>
                {message && <Alert variant={successful ? "success" : "danger"} className="border-0 shadow-sm">{message}</Alert>}
                {uploading && <ProgressBar animated now={uploadProgress} className="mb-4 rounded-pill" style={{ height: '10px' }} />}

                <Row>
                    <Col lg={4}>
                        <div className="glass-card p-4 text-center mb-4">
                            <h6 className="fw-bold mb-3">Photographie d'Identité</h6>
                            <div
                                className="upload-area mb-3"
                                onClick={() => photoInputRef.current.click()}
                                style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Aperçu" className="rounded-3 shadow-sm" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Camera size={48} className="text-muted mb-2" />
                                        <div className="small text-muted">Cliquer pour capturer ou importer</div>
                                    </>
                                )}
                                <input type="file" ref={photoInputRef} className="d-none" onChange={handlePhotoFileChange} accept="image/*" />
                            </div>
                            <Button variant="light" size="sm" className="w-100 rounded-pill" onClick={() => photoInputRef.current.click()}>
                                <FileUp size={14} className="me-2" /> Changer la photo
                            </Button>
                        </div>

                        <div className="glass-card p-4">
                            <h6 className="fw-bold mb-3">Informations de Base</h6>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Type de Détention</Form.Label>
                                <Form.Select name="detentionType" value={detainee.detentionType} onChange={handleChange} required className="border-0 bg-light rounded-3">
                                    <option value="">Sélectionner...</option>
                                    <option value="Préventive">Préventive</option>
                                    <option value="Condamnation">Condamnation</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Niveau de Sécurité</Form.Label>
                                <Form.Select name="securityLevel" value={detainee.securityLevel} onChange={handleChange} className="border-0 bg-light rounded-3">
                                    <option value="">Sélectionner...</option>
                                    <option value="Faible">Faible (Vert)</option>
                                    <option value="Moyen">Moyen (Jaune)</option>
                                    <option value="Élevé">Élevé (Rouge)</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </Col>

                    <Col lg={8}>
                        <div className="glass-card p-0 overflow-hidden mb-4">
                            <Tabs defaultActiveKey="identity" className="custom-tabs px-4 pt-3 border-0">
                                <Tab eventKey="identity" title={<><User size={16} className="me-2" />Identité</>}>
                                    <div className="p-4">
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Nom</Form.Label><Form.Control name="lastName" value={detainee.lastName} onChange={handleChange} required className="border-0 bg-light rounded-3" /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Prénom</Form.Label><Form.Control name="firstName" value={detainee.firstName} onChange={handleChange} required className="border-0 bg-light rounded-3" /></Form.Group></Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Date de Naissance</Form.Label><Form.Control type="date" name="birthDate" value={detainee.birthDate} onChange={handleChange} required className="border-0 bg-light rounded-3" /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Lieu de Naissance</Form.Label><Form.Control name="birthPlace" value={detainee.birthPlace} onChange={handleChange} className="border-0 bg-light rounded-3" /></Form.Group></Col>
                                        </Row>
                                        <Form.Group className="mb-3"><Form.Label className="small fw-bold">Adresse de Résidence</Form.Label><Form.Control as="textarea" rows={2} name="address" value={detainee.address} onChange={handleChange} className="border-0 bg-light rounded-3" /></Form.Group>

                                        <div className="mt-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold mb-0">Contacts d'Urgence / Famille</h6>
                                                <Button variant="outline-primary" size="sm" onClick={handleAddContact}>
                                                    <Plus size={14} className="me-1" /> Ajouter un contact
                                                </Button>
                                            </div>

                                            {familyContacts.length === 0 ? (
                                                <div className="text-center p-3 bg-light rounded-3 text-muted small">
                                                    Aucun contact ajouté.
                                                </div>
                                            ) : (
                                                familyContacts.map((contact, index) => (
                                                    <div key={index} className="p-3 bg-light rounded-3 mb-3 position-relative">
                                                        <Button
                                                            variant="link"
                                                            className="position-absolute top-0 end-0 text-danger p-2"
                                                            onClick={() => handleRemoveContact(index)}
                                                        >
                                                            <XCircle size={16} />
                                                        </Button>
                                                        <Row>
                                                            <Col md={4}>
                                                                <Form.Group className="mb-2">
                                                                    <Form.Label className="small fw-bold">Nom complet</Form.Label>
                                                                    <Form.Control
                                                                        size="sm"
                                                                        value={contact.name}
                                                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                                        className="border-0"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={4}>
                                                                <Form.Group className="mb-2">
                                                                    <Form.Label className="small fw-bold">Lien de parenté</Form.Label>
                                                                    <Form.Control
                                                                        size="sm"
                                                                        value={contact.relation}
                                                                        onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                                                                        className="border-0"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={4}>
                                                                <Form.Group className="mb-2">
                                                                    <Form.Label className="small fw-bold">Téléphone</Form.Label>
                                                                    <Form.Control
                                                                        size="sm"
                                                                        value={contact.phone}
                                                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                                        className="border-0"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </Tab>
                                <Tab eventKey="judicial" title={<><Shield size={16} className="me-2" />Judiciaire</>}>
                                    <div className="p-4">
                                        <Form.Group className="mb-3"><Form.Label className="small fw-bold">Infractions</Form.Label><Form.Control as="textarea" rows={3} name="offenses" value={detainee.offenses} onChange={handleChange} className="border-0 bg-light rounded-3" /></Form.Group>
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Date d'Arrivée</Form.Label><Form.Control type="date" name="arrivalDate" value={detainee.arrivalDate} onChange={handleChange} required className="border-0 bg-light rounded-3" /></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Tribunal</Form.Label><Form.Control name="court" value={detainee.court} onChange={handleChange} className="border-0 bg-light rounded-3" /></Form.Group></Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">Durée de la peine (mois)</Form.Label>
                                                    <Form.Control type="number" name="sentenceDurationMonths" value={detainee.sentenceDurationMonths} onChange={handleChange} placeholder="Ex: 24" className="border-0 bg-light rounded-3" />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">Date de Libération Prévue</Form.Label>
                                                    <Form.Control type="date" name="expectedEndDate" value={detainee.expectedEndDate} onChange={handleChange} className="border-0 bg-light rounded-3" />
                                                    <Form.Text className="text-muted small">Calculée automatiquement si la durée est saisie.</Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </Tab>
                                <Tab eventKey="medical" title={<><Heart size={16} className="me-2" />Médical</>}>
                                    <div className="p-4">
                                        <Row>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Groupe Sanguin</Form.Label><Form.Select name="bloodType" value={detainee.bloodType} onChange={handleChange} className="border-0 bg-light rounded-3"><option value="">Sélectionner...</option><option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option></Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">État de Santé Initial</Form.Label><Form.Select name="medicalStatus" value={detainee.medicalStatus} onChange={handleChange} className="border-0 bg-light rounded-3"><option value="Bon">Bon</option><option value="Moyen">Moyen</option><option value="Mauvais">Mauvais</option></Form.Select></Form.Group></Col>
                                        </Row>
                                        <Form.Group className="mb-3"><Form.Label className="small fw-bold">Allergies & Contre-indications</Form.Label><Form.Control as="textarea" rows={2} name="allergies" value={detainee.allergies} onChange={handleChange} className="border-0 bg-light rounded-3" /></Form.Group>
                                    </div>
                                </Tab>
                                <Tab eventKey="biometric" title={<><Fingerprint size={16} className="me-2" />Biométrie</>}>
                                    <div className="p-4">
                                        <Form.Group className="mb-3"><Form.Label className="small fw-bold">Signes Distinctifs</Form.Label><Form.Control as="textarea" rows={3} name="distinctiveMarks" value={detainee.distinctiveMarks} onChange={handleChange} placeholder="Tatouages, cicatrices..." className="border-0 bg-light rounded-3" /></Form.Group>
                                        <div className="d-flex gap-3">
                                            <Button variant="outline-primary" className="flex-grow-1 py-3 border-dashed"><Fingerprint size={24} className="d-block mx-auto mb-2" /> Scanner Empreintes</Button>
                                            <Button variant="outline-primary" className="flex-grow-1 py-3 border-dashed"><Camera size={24} className="d-block mx-auto mb-2" /> Scan Facial</Button>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                        <div className="d-flex justify-content-end gap-3">
                            <Button variant="light" className="px-4 rounded-pill" onClick={() => navigate(-1)}>Annuler</Button>
                            <Button type="submit" className="btn-premium btn-premium-primary px-5" disabled={uploading || loading}>
                                <Save size={18} /> {isEdit ? 'Mettre à jour' : 'Enregistrer le Dossier'}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default DetaineeForm;

