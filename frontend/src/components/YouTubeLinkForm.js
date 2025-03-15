import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import './YouTubeLinkForm.css';

function YouTubeLinkForm() {
  const [link, setLink] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [blogSaved, setBlogSaved] = useState(false);
  const [blogSlug, setBlogSlug] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setBlogContent('');
    setVideoId('');
    setBlogSaved(false);
    setBlogSlug('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to generate blog content');
      }
      
      const response = await fetch(`${config.apiBaseUrl}/api/youtube-transcript/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ link }),
      });
      
      if (response.status === 401) {
        // Unauthorized - token expired or invalid
        logout();
        navigate('/login');
        throw new Error('Your session has expired. Please log in again.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to generate blog content');
      }
      
      const data = await response.json();
      setBlogContent(data.blog);
      setVideoId(data.videoId);
      
      // Extract title from the blog content
      const titleMatch = data.blog.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (titleMatch && titleMatch[1]) {
        setBlogTitle(titleMatch[1].replace(/<[^>]*>/g, '').trim());
      } else {
        setBlogTitle(`Blog about YouTube video ${videoId}`);
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setError(error.message || 'Failed to generate blog content. Please check your link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBlog = async () => {
    if (!blogContent || !videoId || !blogTitle) {
      setError('No blog content to save');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to save a blog');
      }

      const videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const response = await fetch(`${config.apiBaseUrl}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: blogTitle,
          content: blogContent,
          videoId,
          videoThumbnail
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save blog');
      }

      const data = await response.json();
      setBlogSaved(true);
      setBlogSlug(data.slug);
    } catch (error) {
      console.error('Error saving blog:', error);
      setError(error.message || 'Failed to save blog. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to render HTML content safely
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Generate Blog</h1>
          <div className="user-controls">
            {currentUser && (
              <>
                <span className="welcome-message">Welcome, {currentUser.username || 'User'}</span>
                <div className="user-menu">
                  <Link to="/" className="nav-link">Home</Link>
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      <div className="youtube-link-form-container">
        <div className="form-section">
          <h2>Generate Blog from YouTube Video</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Enter YouTube link (e.g., https://www.youtube.com/watch?v=...)"
                required
                className="youtube-input"
                disabled={isLoading}
              />
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Blog'}
              </button>
            </div>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating blog content from YouTube video...</p>
            <p className="loading-note">This may take a minute or two depending on the video length.</p>
          </div>
        )}

        {blogContent && videoId && !isLoading && (
          <div className="blog-content-container">
            <div className="blog-actions">
              <h3>Generated Blog Content</h3>
              {!blogSaved ? (
                <button 
                  onClick={saveBlog} 
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Blog'}
                </button>
              ) : (
                <div className="blog-saved-message">
                  <span>Blog saved successfully!</span>
                  <Link to={`/blog/${blogSlug}`} className="view-blog-link">
                    View Published Blog
                  </Link>
                </div>
              )}
            </div>
            
            <div className="video-thumbnail-container">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                alt="YouTube Video Thumbnail" 
                className="video-thumbnail"
                onError={(e) => {
                  // Fallback to medium quality thumbnail if maxresdefault is not available
                  e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                }}
              />
              <div className="video-source">
                <a 
                  href={`https://www.youtube.com/watch?v=${videoId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="video-link"
                >
                  Watch Original Video
                </a>
              </div>
            </div>
            
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={createMarkup(blogContent)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default YouTubeLinkForm;
