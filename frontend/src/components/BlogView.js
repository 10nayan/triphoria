import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import './BlogView.css';

const BlogView = () => {
  const { slug, username } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        let response;
        
        // If username is provided, use the new endpoint
        if (username) {
          response = await fetch(`${config.apiBaseUrl}/api/blogs/user/${username}/${slug}`);
        } else {
          // Fallback to the old endpoint for backward compatibility
          response = await fetch(`${config.apiBaseUrl}/api/blogs/${slug}`);
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        setBlog(data);
        
        // Fetch comments
        const commentsResponse = await fetch(`${config.apiBaseUrl}/api/blogs/${data._id}/comments`);
        
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
  }, [slug, username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: username ? `/${username}/blog/${slug}` : `/blog/${slug}` } });
      return;
    }
    
    setIsLiking(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.apiBaseUrl}/api/blogs/${blog._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to like blog');
      }
      
      const data = await response.json();
      
      // Update blog with new likes
      setBlog(prevBlog => ({
        ...prevBlog,
        likes: data.likes
      }));
    } catch (err) {
      console.error('Error liking blog:', err);
      setError('Failed to like blog. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login', { state: { from: username ? `/${username}/blog/${slug}` : `/blog/${slug}` } });
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.apiBaseUrl}/api/blogs/${blog._id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      const data = await response.json();
      
      // Add new comment to the list
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!currentUser) {
      navigate('/login', { state: { from: username ? `/${username}/blog/${slug}` : `/blog/${slug}` } });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.apiBaseUrl}/api/blogs/comment/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to like comment');
      }
      
      const data = await response.json();
      
      // Update comment with new likes
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: data.likes } 
            : comment
        )
      );
    } catch (err) {
      console.error('Error liking comment:', err);
      setError('Failed to like comment. Please try again.');
    }
  };

  // Function to render HTML content safely
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
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
        <p>Loading blog...</p>
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

  if (!blog) {
    return (
      <div className="not-found-container">
        <h2>Blog Not Found</h2>
        <p>The blog you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    );
  }

  const isLikedByUser = currentUser && blog.likes.includes(currentUser._id);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Triphoria Blog</h1>
          <div className="user-controls">
            {currentUser ? (
              <>
                <span className="welcome-message">Welcome, {currentUser.username || 'User'}</span>
                <div className="user-menu">
                  <Link to="/" className="nav-link">Home</Link>
                  {blog && blog.userId && blog.userId.username && (
                    <Link to={`/${blog.userId.username}`} className="nav-link">View Influencer</Link>
                  )}
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

      <div className="blog-view-container">
        <div className="blog-header">
          <div className="blog-meta">
            <div className="author-info">
              <span className="author-name">By {blog.userId.firstName} {blog.userId.lastName}</span>
              <span className="publish-date">{formatDate(blog.createdAt)}</span>
            </div>
            <div className="blog-stats">
              <span className="views-count">{blog.views} views</span>
              <div className="likes-container">
                <button 
                  className={`like-button ${isLikedByUser ? 'liked' : ''}`} 
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  <span className="like-icon">❤</span>
                  <span className="likes-count">{blog.likes.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {blog.videoId && (
          <div className="video-thumbnail-container">
            <img 
              src={blog.videoThumbnail || `https://img.youtube.com/vi/${blog.videoId}/maxresdefault.jpg`} 
              alt="YouTube Video Thumbnail" 
              className="video-thumbnail"
              onError={(e) => {
                // Fallback to medium quality thumbnail if maxresdefault is not available
                e.target.src = `https://img.youtube.com/vi/${blog.videoId}/mqdefault.jpg`;
              }}
            />
            <div className="video-source">
              <a 
                href={`https://www.youtube.com/watch?v=${blog.videoId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="video-link"
              >
                Watch Original Video
              </a>
            </div>
          </div>
        )}

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={createMarkup(blog.content)}
        />

        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>
          
          {currentUser ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button 
                type="submit" 
                className="submit-comment-button"
                disabled={isSubmittingComment || !newComment.trim()}
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="login-to-comment">
              <Link to="/login" state={{ from: username ? `/${username}/blog/${slug}` : `/blog/${slug}` }}>Login to comment</Link>
            </div>
          )}
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map(comment => {
                const isCommentLikedByUser = currentUser && comment.likes.includes(currentUser._id);
                
                return (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <div className="comment-author">
                        <span className="author-name">{comment.userId.firstName} {comment.userId.lastName}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <button 
                        className={`comment-like-button ${isCommentLikedByUser ? 'liked' : ''}`}
                        onClick={() => handleCommentLike(comment._id)}
                      >
                        <span className="like-icon">❤</span>
                        <span className="likes-count">{comment.likes.length}</span>
                      </button>
                    </div>
                    <div className="comment-content">
                      {comment.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogView;
