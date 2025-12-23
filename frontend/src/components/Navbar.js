import React from 'react';
import { Bell, Search, User, LogOut, Settings, Globe, Camera } from 'lucide-react';
import { Dropdown, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Navbar = ({ user: initialUser, onLogout }) => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(initialUser);
    const [showProfileModal, setShowProfileModal] = React.useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = React.useState(user?.photoUrl || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/detenus?search=${e.target.value}`);
        }
    };

    const handleUpdatePhoto = () => {
        const updatedUser = AuthService.updateCurrentUser({ photoUrl: newPhotoUrl });
        if (updatedUser) {
            setUser(updatedUser);
            setShowProfileModal(false);
        }
    };

    return (
        <div className="top-navbar">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
                <div className="search-wrapper position-relative" style={{ width: '300px' }}>
                    <Search className="position-absolute" size={18} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#95a5a6' }} />
                    <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Rechercher un détenu..."
                        style={{ paddingLeft: '40px', borderRadius: '10px' }}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="d-flex align-items-center gap-4">
                <div className="d-flex align-items-center gap-2 text-muted cursor-pointer">
                    <Globe size={18} />
                    <span className="small fw-bold">FR</span>
                </div>

                <div className="position-relative cursor-pointer">
                    <Bell size={20} className="text-muted" />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        3
                    </span>
                </div>

                <div className="vr mx-2" style={{ height: '30px', opacity: 0.1 }}></div>

                <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="d-flex align-items-center gap-3 cursor-pointer">
                        <div className="text-end d-none d-sm-block">
                            <div className="fw-bold small">{user?.username}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{user?.roles?.[0]?.replace('ROLE_', '')}</div>
                        </div>
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '40px', height: '40px' }}>
                            {user?.photoUrl ? (
                                <img src={user.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="border-0 shadow-lg mt-3" style={{ borderRadius: '12px' }}>
                        <Dropdown.Item className="py-2 d-flex align-items-center gap-2" onClick={() => setShowProfileModal(true)}>
                            <Camera size={16} /> Changer Photo
                        </Dropdown.Item>
                        <Dropdown.Item className="py-2 d-flex align-items-center gap-2">
                            <Settings size={16} /> Paramètres
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={onLogout} className="py-2 d-flex align-items-center gap-2 text-danger">
                            <LogOut size={16} /> Déconnexion
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            {/* Profile Update Modal */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Mettre à jour le profil</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center overflow-hidden mb-3" style={{ width: '100px', height: '100px', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                            {newPhotoUrl ? (
                                <img src={newPhotoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={40} className="text-muted" />
                            )}
                        </div>
                        <h6 className="fw-bold">{user?.username}</h6>
                        <p className="text-muted small">{user?.email}</p>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">URL de la photo de profil</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="https://..."
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            className="border-0 bg-light rounded-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowProfileModal(false)}>Annuler</Button>
                    <Button className="btn-premium btn-premium-primary" onClick={handleUpdatePhoto}>Enregistrer</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Navbar;
