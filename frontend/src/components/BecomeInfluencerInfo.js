import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BecomeInfluencerInfo.css';

const BecomeInfluencerInfo = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/generate';

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Become an Influencer</h1>
          <div className="user-controls">
            {currentUser && (
              <>
                <span className="welcome-message">Welcome, {currentUser.username || 'User'}</span>
                <div className="user-menu">
                  <Link to="/" className="nav-link">Home</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="info-container">
        <div className="info-card">
          <div className="info-icon">🚀</div>
          <h2>Unlock Blog Generation</h2>
          <p>
            To generate blogs from YouTube videos, you need to register as an influencer on our platform.
            This helps us maintain quality content and build a community of dedicated content creators.
          </p>
          
          <div className="benefits">
            <h3>Benefits of becoming an influencer:</h3>
            <ul>
              <li>Generate SEO-optimized blogs from YouTube videos</li>
              <li>Build your personal brand with a dedicated profile</li>
              <li>Connect with other content creators</li>
              <li>Share your content with a wider audience</li>
            </ul>
          </div>
          
          <div className="cta-buttons">
            <Link to="/become-influencer" className="primary-button" state={{ returnTo: from }}>
              Register as Influencer
            </Link>
            <Link to="/" className="secondary-button">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeInfluencerInfo;
