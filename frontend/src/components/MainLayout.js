import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/premium.css';

const MainLayout = ({ children, user, onLogout }) => {
    return (
        <div className="app-container">
            <Sidebar roles={user?.roles || []} />
            <div className="main-layout">
                <Navbar user={user} onLogout={onLogout} />
                <div className="content-padding">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
