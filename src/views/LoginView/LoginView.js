/* eslint-disable react/jsx-no-bind */
import { useState, useCallback } from 'react';
import Input from '@enact/sandstone/Input';
import Button from '@enact/sandstone/Button';
import Spinner from '@enact/sandstone/Spinner';
import { authService } from '../../services/authService';
const LoginView = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = useCallback(async () => {
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.login(username, password);
            setLoading(false);
            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Authentication failed. Check your CRM credentials.');
            setLoading(false);
        }
    }, [username, password, onLoginSuccess]);

    // Extracted handlers to fix ESLint warnings
    const handleUserChange = useCallback((e) => setUsername(e.value), []);
    const handlePassChange = useCallback((e) => setPassword(e.value), []);

    return (
        // Full screen dark background
        <div style={{ width: "100vw", height: "100vh", background: "#0a0a0c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            
            {/* Ambient background glow for modern feel */}
            <div style={{ position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)", top: "-100px", left: "-100px", pointerEvents: "none" }} />

            {/* The Glass Login Box */}
            <div className="glass-morphism" style={{ width: '450px', padding: '50px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>Scrappy IPTV</div>
                <div style={{ fontSize: "1rem", color: "#a78bfa", marginBottom: "40px" }}>Sign in with your IPTV Account</div>

                {error && (
                    <div style={{ color: '#ff6b6b', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', width: '100%' }}>
                        {error}
                    </div>
                )}

                <Input
                    title="Username"
                    placeholder=" Username"
                    value={username}
                    onChange={handleUserChange}
                    style={{ width: '100%', marginBottom: '20px' }}
                />

                <Input
                    title="Password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={handlePassChange}
                    style={{ width: '100%', marginBottom: '40px' }}
                />

                <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    style={{ width: '100%', background: '#a78bfa', color: '#000', fontWeight: 'bold' }}
                >
                    {loading ? <Spinner size="small" /> : 'Authenticate'}
                </Button>
            </div>
        </div>
    );
};

export default LoginView;