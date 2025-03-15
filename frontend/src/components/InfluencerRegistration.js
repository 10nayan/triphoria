import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import './InfluencerRegistration.css';

const InfluencerRegistration = () => {
  const [formData, setFormData] = useState({
    bio: '',
    websiteLink: '',
    socialLinks: ['']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already an influencer
    const checkInfluencerStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${config.apiBaseUrl}/api/influencer/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // User is already an influencer
          const influencerData = await response.json();
          setFormData({
            bio: influencerData.bio || '',
            websiteLink: influencerData.websiteLink || '',
            socialLinks: influencerData.socialLinks.length > 0 ? influencerData.socialLinks : ['']
          });
          setIsInfluencer(true);
        }
      } catch (err) {
        console.error('Error checking influencer status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkInfluencerStatus();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSocialLinkChange = (index, value) => {
    const updatedLinks = [...formData.socialLinks];
    updatedLinks[index] = value;
    setFormData({
      ...formData,
      socialLinks: updatedLinks
    });
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, '']
    });
  };

  const removeSocialLink = (index) => {
    const updatedLinks = [...formData.socialLinks];
    updatedLinks.splice(index, 1);
    setFormData({
      ...formData,
      socialLinks: updatedLinks.length > 0 ? updatedLinks : ['']
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Filter out empty social links
      const filteredSocialLinks = formData.socialLinks.filter(link => link.trim() !== '');

      const endpoint = isInfluencer 
        ? `${config.apiBaseUrl}/api/influencer/update`
        : `${config.apiBaseUrl}/api/influencer/register`;
      
      const method = isInfluencer ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          socialLinks: filteredSocialLinks
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register as an influencer');
      }

      setSuccess(true);
      setIsInfluencer(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Error registering as influencer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>{isInfluencer ? 'Update Influencer Profile' : 'Become an Influencer'}</h1>
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

      <div className="influencer-form-container">
        {success && (
          <div className="success-message">
            {isInfluencer ? 'Profile updated successfully!' : 'You are now registered as an influencer!'}
          </div>
        )}
        
        {error && (
          <div className="error-message shake">{error}</div>
        )}
        
        <form className="influencer-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="bio">Bio (Tell us about yourself)</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Share your story, expertise, and what makes you unique as an influencer..."
              rows="5"
              maxLength="500"
            ></textarea>
            <div className="character-count">{formData.bio.length}/500</div>
          </div>
          
          <div className="form-group">
            <label htmlFor="websiteLink">Website Link (Optional)</label>
            <input
              type="url"
              id="websiteLink"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div className="form-group">
            <label>Social Media Links</label>
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="social-link-input">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                  placeholder="https://instagram.com/yourusername"
                />
                <button 
                  type="button" 
                  className="remove-link-button"
                  onClick={() => removeSocialLink(index)}
                  disabled={formData.socialLinks.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="add-link-button"
              onClick={addSocialLink}
            >
              + Add Another Social Link
            </button>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isInfluencer ? 'Updating...' : 'Registering...') 
              : (isInfluencer ? 'Update Profile' : 'Register as Influencer')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InfluencerRegistration;
