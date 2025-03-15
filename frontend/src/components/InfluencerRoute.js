import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const InfluencerRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkInfluencerStatus = async () => {
      if (!currentUser) {
        setCheckingStatus(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCheckingStatus(false);
          return;
        }

        const response = await fetch(`${config.apiBaseUrl}/api/influencer/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsInfluencer(true);
        }
      } catch (err) {
        console.error('Error checking influencer status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkInfluencerStatus();
  }, [currentUser]);

  if (loading || checkingStatus) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isInfluencer) {
    // Redirect to a page that explains they need to be an influencer
    return <Navigate to="/become-influencer-info" state={{ from: location }} replace />;
  }

  return children;
};

export default InfluencerRoute;
