import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Extract netid from JWT token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const netid = tokenPayload.netid;
        
        // Store both token and netid
        localStorage.setItem('token', token);
        localStorage.setItem('netid', netid);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing token:', error);
        navigate('/login?error=invalid_token');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [navigate, location]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 