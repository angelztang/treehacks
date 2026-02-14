import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserInfo, setUserInfo, UserInfo } from './services/authService';
import axios from 'axios';
import Navbar from './components/Navbar';
import MarketplacePage from './pages/MarketplacePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ListingDetail from './pages/ListingDetail';
import './index.css';
import { API_URL, FRONTEND_URL } from './config';

interface AuthResponse {
  netid: string;
}

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle CAS callback
    if (location.pathname === '/auth/callback') {
      const ticket = new URLSearchParams(location.search).get('ticket');
      if (ticket) {
        // Validate ticket with backend, including service URL
        const serviceUrl = `${FRONTEND_URL}/auth/callback`;
        axios.get<AuthResponse>(`${API_URL}/api/auth/validate`, {
          params: {
            ticket,
            service: serviceUrl
          }
        })
          .then(response => {
            const { netid } = response.data;
            const newUserInfo: UserInfo = { netid };
            setUserInfo(newUserInfo);
            setUserInfoState(newUserInfo);
            setAuthenticated(true);
            navigate('/dashboard', { replace: true });
          })
          .catch(error => {
            console.error('Error validating ticket:', error);
            navigate('/login?error=auth_failed', { replace: true });
          });
      }
    } else {
      // Check if user is authenticated
      const isAuth = isAuthenticated();
      const currentUserInfo = getUserInfo();
      setAuthenticated(isAuth);
      setUserInfoState(currentUserInfo);
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar authenticated={authenticated} netid={userInfo?.netid || null} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<MarketplacePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/auth/callback" element={<div>Authenticating...</div>} />
          <Route 
            path="/login" 
            element={authenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/dashboard" 
            element={authenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/listings/:id" element={<ListingDetail />} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 