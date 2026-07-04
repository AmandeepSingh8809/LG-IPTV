/* eslint-disable react/jsx-no-bind */
import { useState, useCallback } from 'react';
import LoginView from '../views/LoginView/LoginView';
import MainPlayerView from '../views/MainPlayerView/MainPlayerView';
import { authService } from '../services/authService';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!authService.getToken();
    });
    
    // Extracted to useCallback to fix ESLint warnings
    const handleLoginSuccess = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const handleLogout = useCallback(() => {
        authService.logout();
        setIsAuthenticated(false);
    }, []);

    return isAuthenticated ? (
        <MainPlayerView onLogout={handleLogout} />
    ) : (
        <LoginView onLoginSuccess={handleLoginSuccess} />
    );
};

export default App;