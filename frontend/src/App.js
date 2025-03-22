import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import config from './config';
import './App.css';

function App() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mostViewedBlogs, setMostViewedBlogs] = useState([]);
  const [topInfluencers, setTopInfluencers] = useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(true);
  const [blogsError, setBlogsError] = useState('');
  const [influencersError, setInfluencersError] = useState('');

  useEffect(() => {
    const fetchMostViewedBlogs = async () => {
      setIsLoadingBlogs(true);
      setBlogsError('');
      
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/blogs/most-viewed?limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch most viewed blogs');
        }
        
        const data = await response.json();
        setMostViewedBlogs(data);
      } catch (err) {
        console.error('Error fetching most viewed blogs:', err);
        setBlogsError('Failed to load most viewed blogs. Please try again later.');
      } finally {
        setIsLoadingBlogs(false);
      }
    };
    
    const fetchTopInfluencers = async () => {
      setIsLoadingInfluencers(true);
      setInfluencersError('');
      
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/influencer/top?limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch top influencers');
        }
        
        const data = await response.json();
        setTopInfluencers(data);
      } catch (err) {
        console.error('Error fetching top influencers:', err);
        setInfluencersError('Failed to load top influencers. Please try again later.');
      } finally {
        setIsLoadingInfluencers(false);
      }
    };
    
    fetchMostViewedBlogs();
    fetchTopInfluencers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Zillion Trips</h1>
          <div className="user-controls">
            {currentUser ? (
              <>
                <span className="welcome-message">Welcome, {currentUser.username || 'User'}</span>
                <div className="user-menu">
                  <Link to="/generate" className="nav-link">Generate Blog</Link>
                  <Link to="/become-influencer" className="nav-link">Become Influencer</Link>
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
      <main>
        <div className="home-content">
          <div className="hero-section">
            <div className="hero-content">
              <h2>Discover Travel Stories from Your Favorite Influencers</h2>
              <p>
                Follow your favorite travel influencers, read their latest blogs, and interact with their content.
                Join our community of travel enthusiasts and explore the world through their experiences.
              </p>
              <div className="cta-container">
                {currentUser ? (
                  <Link to="/generate" className="cta-button">Generate a Blog Now</Link>
                ) : (
                  <Link to="/login" className="cta-button">Sign In to Get Started</Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Most Viewed Blogs Section */}
          <div className="most-viewed-blogs-section">
            <h3>Most Viewed Blogs</h3>
            
            {isLoadingBlogs ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading blogs...</p>
              </div>
            ) : blogsError ? (
              <div className="error-message">
                <p>{blogsError}</p>
              </div>
            ) : mostViewedBlogs.length === 0 ? (
              <div className="no-blogs">
                <p>No blogs available yet.</p>
              </div>
            ) : (
              <div className="blogs-grid">
                {mostViewedBlogs.map(blog => {
                  // Extract the base slug without the unique identifier
                  const baseSlug = blog.slug.replace(/-[a-f0-9]+$/, '');
                  const user = blog.userId;
                  
                  return (
                    <div key={blog._id} className="blog-card">
                      {blog.videoThumbnail && (
                        <div className="blog-thumbnail">
                          <img onClick={() => navigate(`/${user.username}/blog/${baseSlug}`)}
                            src={blog.videoThumbnail} 
                            alt={blog.title} 
                            className="thumbnail-img"
                          />
                        </div>
                      )}
                      <div className="blog-info">
                        <h4 className="blog-title">
                          <Link to={`/${user.username}/blog/${baseSlug}`}>{blog.title}</Link>
                        </h4>
                        <div className="influencer-info">
                          <span className="by-text">By </span>
                          <Link to={`/${user.username}`} className="influencer-name">
                            {user.firstName} {user.lastName}
                          </Link>
                        </div>
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
          
          {/* Top Influencers Section */}
          <div className="top-influencers-section">
            <h3>Top Influencers</h3>
            
            {isLoadingInfluencers ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading influencers...</p>
              </div>
            ) : influencersError ? (
              <div className="error-message">
                <p>{influencersError}</p>
              </div>
            ) : topInfluencers.length === 0 ? (
              <div className="no-influencers">
                <p>No influencers available yet.</p>
              </div>
            ) : (
              <div className="influencers-grid">
                {topInfluencers.map(influencer => {
                  const { user, influencer: profile, stats } = influencer;
                  
                  return (
                    <div key={user._id} className="influencer-card">
                      <div className="influencer-header">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={`${user.firstName} ${user.lastName}`} 
                            className="influencer-avatar"
                          />
                        ) : (
                          <div className="influencer-avatar-placeholder">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        )}
                        <div className="influencer-name-container">
                          <h4 className="influencer-name">
                            <Link to={`/${user.username}`}>
                              {user.firstName} {user.lastName}
                            </Link>
                          </h4>
                          <span className="influencer-username">@{user.username}</span>
                        </div>
                      </div>
                      
                      {profile.bio && (
                        <p className="influencer-bio">{profile.bio}</p>
                      )}
                      
                      <div className="influencer-stats">
                        <div className="stat">
                          <span className="stat-value">{stats.totalViews}</span>
                          <span className="stat-label">Total Views</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{stats.blogCount}</span>
                          <span className="stat-label">Blogs</span>
                        </div>
                      </div>
                      
                      <div className="influencer-links">
                        {profile.websiteLink && (
                          <a 
                            href={profile.websiteLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="website-link"
                          >
                            Website
                          </a>
                        )}
                        
                        {profile.socialLinks && profile.socialLinks.length > 0 && (
                          <div className="social-links">
                            {profile.socialLinks.map((link, index) => {
                              let socialName = '';
                              try {
                                const url = new URL(link);
                                socialName = url.hostname.replace('www.', '').split('.')[0];
                                // Capitalize first letter
                                socialName = socialName.charAt(0).toUpperCase() + socialName.slice(1);
                              } catch (e) {
                                socialName = `Social ${index + 1}`;
                              }
                              
                              return (
                                <a 
                                  key={index}
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="social-link"
                                >
                                  {socialName}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <Link to={`/${user.username}`} className="view-profile-link">
                        View Full Profile
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Zillion Trips. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
