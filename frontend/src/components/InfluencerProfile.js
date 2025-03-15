import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import './InfluencerProfile.css';

const InfluencerProfile = () => {
  const { username } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfluencerData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/blogs/influencer/${username}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch influencer data');
        }
        
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching influencer data:', err);
        setError('Failed to load influencer profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInfluencerData();
  }, [username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="not-found-container">
        <h2>Influencer Not Found</h2>
        <p>The influencer profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    );
  }

  const { user, influencer, blogs } = profileData;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Triphoria</h1>
          <div className="user-controls">
            {currentUser ? (
              <>
                <span className="welcome-message">Welcome, {currentUser.username || 'User'}</span>
                <div className="user-menu">
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/generate" className="nav-link">Generate Blog</Link>
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="influencer-profile-container">
        <div className="influencer-header">
          <div className="influencer-info">
            {user.profilePicture && (
              <img 
                src={user.profilePicture} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="profile-picture"
              />
            )}
            <div className="influencer-details">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="username">@{user.username}</p>
              {influencer.bio && <p className="bio">{influencer.bio}</p>}
              
              <div className="social-links">
                {influencer.websiteLink && (
                  <a 
                    href={influencer.websiteLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    Website
                  </a>
                )}
                
                {influencer.socialLinks && influencer.socialLinks.length > 0 && (
                  <div className="social-media-links">
                    {influencer.socialLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        {/* Extract domain name for display */}
                        {new URL(link).hostname.replace('www.', '')}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="blogs-section">
          <h3>Blogs by {user.firstName} {user.lastName}</h3>
          
          {blogs.length === 0 ? (
            <div className="no-blogs">
              <p>No blogs published yet.</p>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map(blog => {
                // Extract the base slug without the unique identifier
                const baseSlug = blog.slug.replace(/-[a-f0-9]+$/, '');
                
                return (
                  <div key={blog._id} className="blog-card">
                    {blog.videoThumbnail && (
                      <div className="blog-thumbnail">
                        <img 
                          src={blog.videoThumbnail} 
                          alt={blog.title} 
                          className="thumbnail-img"
                        />
                      </div>
                    )}
                    <div className="blog-info">
                      <h4 className="blog-title">
                        <Link to={`/${username}/blog/${baseSlug}`}>{blog.title}</Link>
                      </h4>
                      <div className="blog-meta">
                        <span className="publish-date">{formatDate(blog.createdAt)}</span>
                        <div className="blog-stats">
                          <span className="views-count">{blog.views} views</span>
                          <span className="likes-count">{blog.likes.length} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;
