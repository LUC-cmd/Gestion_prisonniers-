import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { User, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import AuthService from '../services/auth.service';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const response = await AuthService.login(username, password);
            onLogin(response.data);
            navigate('/'); // Redirect to home/dashboard redirector
        } catch (error) {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            setMessage(resMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            <div className="login-card glass-card p-5" style={{ maxWidth: '450px', width: '90%', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                        <ShieldCheck size={40} className="text-primary" />
                    </div>
                    <h2 className="fw-bold text-white mb-1">SGP - Prison</h2>
                    <p className="text-muted small">Système de Gestion Pénitentiaire</p>
                </div>

                <Form onSubmit={handleLogin}>
                    {message && (
                        <Alert variant="danger" className="border-0 shadow-sm py-2 small mb-4">
                            {message}
                        </Alert>
                    )}

                    <Form.Group className="mb-4">
                        <Form.Label className="text-white-50 small fw-bold">Identifiant</Form.Label>
                        <InputGroup className="bg-white bg-opacity-5 rounded-3 overflow-hidden border-0">
                            <InputGroup.Text className="bg-transparent border-0 text-white-50 ps-3">
                                <User size={18} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Nom d'utilisateur"
                                className="bg-transparent border-0 text-white py-2 ps-2"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{ boxShadow: 'none' }}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-5">
                        <Form.Label className="text-white-50 small fw-bold">Mot de passe</Form.Label>
                        <InputGroup className="bg-white bg-opacity-5 rounded-3 overflow-hidden border-0">
                            <InputGroup.Text className="bg-transparent border-0 text-white-50 ps-3">
                                <Lock size={18} />
                            </InputGroup.Text>
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                className="bg-transparent border-0 text-white py-2 ps-2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ boxShadow: 'none' }}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Button
                        type="submit"
                        className="btn-premium btn-premium-primary w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <>
                                Se connecter <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </Form>

                <div className="mt-5 text-center">
                    <p className="text-white-50 small mb-0">Accès restreint au personnel autorisé uniquement.</p>
                    <p className="text-white-50 small">Contactez l'administrateur pour vos identifiants.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;