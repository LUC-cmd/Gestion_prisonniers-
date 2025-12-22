import React from 'react';
import { Bell, Search, User, LogOut, Settings, Globe } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/detenus?search=${e.target.value}`);
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
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <User size={20} />
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="border-0 shadow-lg mt-3" style={{ borderRadius: '12px' }}>
                        <Dropdown.Item className="py-2 d-flex align-items-center gap-2">
                            <User size={16} /> Mon Profil
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
        </div>
    );
};

export default Navbar;
