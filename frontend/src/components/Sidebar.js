import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Calendar,
    ClipboardCheck,
    UserSquare2,
    Building2,
    BarChart3,
    Database,
    PlusCircle,
    AlertTriangle,
    Stethoscope
} from 'lucide-react';

const Sidebar = ({ roles }) => {
    const location = useLocation();
    const hasRole = (role) => roles && roles.includes(role);

    const menuItems = [
        { path: '/admin-dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', roles: ['ROLE_ADMIN'] },
        { path: '/doctor-dashboard', icon: <Stethoscope size={20} />, label: 'Espace Médical', roles: ['ROLE_MEDECIN'] },
        { path: '/personnel-dashboard', icon: <Users size={20} />, label: 'Espace Personnel', roles: ['ROLE_PERSONNEL'] },
        { path: '/detenus', icon: <UserSquare2 size={20} />, label: 'Dossiers Détenus', roles: ['ROLE_ADMIN', 'ROLE_PERSONNEL'] },
        { path: '/incidents', icon: <ShieldAlert size={20} />, label: 'Incidents', roles: ['ROLE_ADMIN', 'ROLE_PERSONNEL'] },
        { path: '/planning', icon: <Calendar size={20} />, label: 'Planning', roles: ['ROLE_ADMIN', 'ROLE_PERSONNEL', 'ROLE_MEDECIN'] },
    ];

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo">
                    <ShieldAlert size={28} className="text-danger" />
                    <span>SGP - Prison</span>
                </Link>
            </div>

            <div className="sidebar-nav">
                <div className="px-4 mb-4">
                    <h6 className="text-uppercase small text-muted mb-3" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>Actions Rapides</h6>
                    <button className="btn btn-sm btn-outline-light w-100 mb-2 d-flex align-items-center gap-2 py-2">
                        <PlusCircle size={16} /> Nouveau Détenu
                    </button>
                    <button className="btn btn-sm btn-outline-light w-100 d-flex align-items-center gap-2 py-2">
                        <AlertTriangle size={16} /> Signaler Incident
                    </button>
                </div>

                <h6 className="px-4 text-uppercase small text-muted mb-2" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>Menu Principal</h6>
                {menuItems.filter(item => item.roles.some(role => hasRole(role))).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item-custom ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}

                <div className="mt-auto p-4 text-center" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                    <div className="text-muted small">SGP v2.1</div>
                    <div className="text-muted" style={{ fontSize: '0.6rem' }}>Système de Gestion Pénitentiaire</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
