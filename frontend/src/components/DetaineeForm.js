import React, { useState, useRef } from 'react'; // Import useRef
import { Form, Button, Row, Col, Tab, Tabs, Alert, ProgressBar } from 'react-bootstrap'; // Import ProgressBar
import { useNavigate } from 'react-router-dom';
import DetaineeService from '../services/detainee.service';
import FileService from '../services/file.service'; // Import FileService
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique keys

const DetaineeForm = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [documentFiles, setDocumentFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const photoInputRef = useRef(null);
    const documentInputRef = useRef(null);
    
    const [detainee, setDetainee] = useState({
        lastName: '', firstName: '', birthDate: '', birthPlace: '', detentionType: '',
        arrivalDate: '', photoUrl: '', nationality: '', identificationNumber: '',
        address: '', familyContactsJson: '[]', offenses: '', sentence: '',
        sentenceDate: '', expectedEndDate: '', court: '', bloodType: '',
        medicalStatus: '', allergies: '', treatments: '', medicalHistory: '',
        distinctiveMarks: '', physicalPeculiarities: '', fingerprintsUrl: '',
        facialRecognitionUrl: '', securityLevel: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetainee({ ...detainee, [name]: value });
    };

    // --- Photo Upload Handlers ---
    const handlePhotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setPhotoFile(null);
            setPhotoPreview(null);
        }
    };

    const handlePhotoDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoRemove = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
    };

    // --- Document Upload Handlers ---
    const handleDocumentFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setDocumentFiles(prev => [...prev, ...files.map(file => ({ file, url: null, name: file.name, id: uuidv4() }))]);
        }
    };

    const handleDocumentDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setDocumentFiles(prev => [...prev, ...files.map(file => ({ file, url: null, name: file.name, id: uuidv4() }))]);
        }
    };

    const handleDocumentRemove = (idToRemove) => {
        setDocumentFiles(prev => prev.filter(doc => doc.id !== idToRemove));
    };

    // --- Generic Drag/Drop Handlers ---
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setSuccessful(false);
        setUploading(true);
        setUploadProgress(0);

        try {
            let uploadedPhotoUrl = detainee.photoUrl;
            if (photoFile) {
                const photoResponse = await FileService.uploadFile(photoFile, (event) => {
                    setUploadProgress(Math.round((100 * event.loaded) / event.total));
                });
                uploadedPhotoUrl = photoResponse.data.message; // Backend returns URL in message
            }

            let uploadedDocumentUrls = [];
            for (const doc of documentFiles.filter(d => d.file)) { // Only upload new file objects
                const docResponse = await FileService.uploadFile(doc.file, (event) => {
                    // This progress bar would show total progress for all files, more complex for individual
                });
                uploadedDocumentUrls.push(docResponse.data.message);
            }
            // For now, let's just store all document URLs as a JSON string
            const finalDocumentUrlsJson = JSON.stringify(uploadedDocumentUrls);


            const detaineeDataToSubmit = {
                ...detainee,
                photoUrl: uploadedPhotoUrl,
                documentsJson: finalDocumentUrlsJson, // New field for document URLs in Detainee entity
            };

            const response = await DetaineeService.createDetainee(detaineeDataToSubmit);
            setMessage('Détenu enregistré avec succès ! ID: ' + response.data.id);
            setSuccessful(true);
            setUploading(false);
            setUploadProgress(0);

            // Clear form fields
            setDetainee({ 
                lastName: '', firstName: '', birthDate: '', birthPlace: '', detentionType: '',
                arrivalDate: '', photoUrl: '', nationality: '', identificationNumber: '',
                address: '', familyContactsJson: '[]', offenses: '', sentence: '',
                sentenceDate: '', expectedEndDate: '', court: '', bloodType: '',
                medicalStatus: '', allergies: '', treatments: '', medicalHistory: '',
                distinctiveMarks: '', physicalPeculiarities: '', fingerprintsUrl: '',
                facialRecognitionUrl: '',
            });
            handlePhotoRemove();
            setDocumentFiles([]);

        } catch (error) {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            setMessage(resMessage);
            setSuccessful(false);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="container mt-3">
            <h2>Nouveau Détenu</h2>
            <Form onSubmit={handleSubmit}>
                {message && (
                    <Alert variant={successful ? "success" : "danger"}>
                        {message}
                    </Alert>
                )}
                {uploading && <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} className="mb-3" />}

                <Row className="mb-3">
                    <Col md={4} className="text-center">
                        <div 
                            className="upload-area border p-3 rounded"
                            onDragOver={handleDragOver}
                            onDrop={handlePhotoDrop}
                            onClick={() => photoInputRef.current.click()}
                            style={{ cursor: 'pointer' }}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Aperçu Photo" className="detainee-photo mb-2" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }} />
                            ) : (
                                <i className="bi bi-camera fs-1 text-muted"></i>
                            )}
                            <p className="mt-2">Glisser-déposer une photo ou <span className="text-primary">cliquer pour importer</span></p>
                            <small className="text-muted">Formats: JPG, PNG (max. 2MB)</small>
                            <input 
                                type="file" 
                                id="photoInput" 
                                accept="image/*" 
                                className="d-none" 
                                ref={photoInputRef}
                                onChange={handlePhotoFileChange}
                            />
                            {photoFile && (
                                <Button variant="outline-danger" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); handlePhotoRemove(); }}>Supprimer</Button>
                            )}
                        </div>
                    </Col>
                    <Col md={8}>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="lastName" className="mb-3">
                                <Form.Label>Nom *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={detainee.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="firstName" className="mb-3">
                                <Form.Label>Prénom *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={detainee.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="birthDate" className="mb-3">
                                <Form.Label>Date de naissance *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="birthDate"
                                    value={detainee.birthDate}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="birthPlace" className="mb-3">
                                <Form.Label>Lieu de naissance</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="birthPlace"
                                    value={detainee.birthPlace}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="detentionType" className="mb-3">
                                <Form.Label>Type de détention *</Form.Label>
                                <Form.Select
                                    name="detentionType"
                                    value={detainee.detentionType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Préventive">Préventive</option>
                                    <option value="Condamnation">Condamnation</option>
                                    <option value="Extradition">Extradition</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="arrivalDate" className="mb-3">
                                <Form.Label>Date d'arrivée *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="arrivalDate"
                                    value={detainee.arrivalDate}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Row>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="identity" id="detainee-form-tabs" className="mb-3">
                    <Tab eventKey="identity" title="Identité">
                        <Row>
                            <Form.Group as={Col} md={6} controlId="nationality" className="mb-3">
                                <Form.Label>Nationalité</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nationality"
                                    value={detainee.nationality}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="identificationNumber" className="mb-3">
                                <Form.Label>N° CIN/Passeport</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="identificationNumber"
                                    value={detainee.identificationNumber}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Row>
                        <Form.Group controlId="address" className="mb-3">
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="address"
                                value={detainee.address}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="familyContacts" className="mb-3">
                            <Form.Label>Contacts familiaux (JSON)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="familyContactsJson"
                                value={detainee.familyContactsJson}
                                onChange={handleChange}
                                placeholder='Ex: [{"name": "Maman", "relation": "Mère", "phone": "06..."}]'
                            />
                        </Form.Group>
                    </Tab>
                    <Tab eventKey="judicial" title="Judiciaire">
                        <Form.Group controlId="offenses" className="mb-3">
                            <Form.Label>Infractions</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="offenses"
                                value={detainee.offenses}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="sentence" className="mb-3">
                                <Form.Label>Peine</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sentence"
                                    value={detainee.sentence}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="sentenceDate" className="mb-3">
                                <Form.Label>Date de jugement</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="sentenceDate"
                                    value={detainee.sentenceDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="expectedEndDate" className="mb-3">
                                <Form.Label>Fin de peine prévue</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="expectedEndDate"
                                    value={detainee.expectedEndDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="court" className="mb-3">
                                <Form.Label>Tribunal</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="court"
                                    value={detainee.court}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="securityLevel" className="mb-3">
                                <Form.Label>Niveau de sécurité</Form.Label>
                                <Form.Select
                                    name="securityLevel"
                                    value={detainee.securityLevel}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Faible">Faible</option>
                                    <option value="Moyen">Moyen</option>
                                    <option value="Élevé">Élevé</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                    </Tab>
                    <Tab eventKey="medical" title="Médical">
                        <Row>
                            <Form.Group as={Col} md={6} controlId="bloodType" className="mb-3">
                                <Form.Label>Groupe sanguin</Form.Label>
                                <Form.Select
                                    name="bloodType"
                                    value={detainee.bloodType}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="medicalStatus" className="mb-3">
                                <Form.Label>État de santé</Form.Label>
                                <Form.Select
                                    name="medicalStatus"
                                    value={detainee.medicalStatus}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Bon">Bon</option>
                                    <option value="Moyen">Moyen</option>
                                    <option value="Mauvais">Mauvais</option>
                                    <option value="Critique">Critique</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Form.Group controlId="allergies" className="mb-3">
                            <Form.Label>Allergies</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="allergies"
                                value={detainee.allergies}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="treatments" className="mb-3">
                            <Form.Label>Traitements en cours</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="treatments"
                                value={detainee.treatments}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="medicalHistory" className="mb-3">
                            <Form.Label>Antécédents médicaux</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="medicalHistory"
                                value={detainee.medicalHistory}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Tab>
                    <Tab eventKey="documents" title="Documents">
                        <div 
                            className="upload-area border p-3 rounded mb-3"
                            onDragOver={handleDragOver}
                            onDrop={handleDocumentDrop}
                            onClick={() => documentInputRef.current.click()}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="bi bi-file-earmark-arrow-up fs-1 text-muted"></i>
                            <p className="mt-2">Glisser-déposer des documents ou <span className="text-primary">cliquer pour importer</span></p>
                            <small className="text-muted">Formats: PDF, JPG, PNG (max. 5MB par fichier)</small>
                            <input 
                                type="file" 
                                id="documentInput" 
                                multiple 
                                className="d-none" 
                                ref={documentInputRef}
                                onChange={handleDocumentFileChange}
                            />
                        </div>
                        {documentFiles.length > 0 && (
                            <ul className="list-group mb-3">
                                {documentFiles.map(doc => (
                                    <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {doc.name}
                                        <Button variant="danger" size="sm" onClick={() => handleDocumentRemove(doc.id)}>
                                            Supprimer
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Tab>
                    <Tab eventKey="biometric" title="Biométrie">
                        <Form.Group controlId="distinctiveMarks" className="mb-3">
                            <Form.Label>Signes distinctifs</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="distinctiveMarks"
                                value={detainee.distinctiveMarks}
                                onChange={handleChange}
                                placeholder="Cicatrices, tatouages, etc."
                            />
                        </Form.Group>
                        <Form.Group controlId="physicalPeculiarities" className="mb-3">
                            <Form.Label>Particularités physiques</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="physicalPeculiarities"
                                value={detainee.physicalPeculiarities}
                                onChange={handleChange}
                                placeholder="Handicaps, particularités, etc."
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label>Empreintes digitales</Form.Label>
                                <div className="text-center">
                                    <Button variant="outline-primary" size="sm">Capturer</Button>
                                </div>
                                <small className="text-muted d-block mt-2">Status: Non enregistrées</small>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Reconnaissance faciale</Form.Label>
                                <div className="text-center">
                                    <Button variant="outline-primary" size="sm">Capturer</Button>
                                </div>
                                <small className="text-muted d-block mt-2">Status: Non capturée</small>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>

                <Button variant="primary" type="submit" className="mt-3" disabled={uploading}>
                    Enregistrer Détenu
                </Button>
            </Form>
        </div>
    );
};

export default DetaineeForm;
