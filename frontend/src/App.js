import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Triphoria - YouTube to Blog Converter</h1>
          <div className="user-controls">
            {currentUser ? (
              <>
                <span className="welcome-message">Welcome, {currentUser.username || 'User'}</span>
                <div className="user-menu">
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
      <main>
        <div className="home-content">
          <h2>Transform YouTube Videos into SEO-Optimized Travel Blogs</h2>
          <p>
            Triphoria helps you convert YouTube travel videos into professionally written, 
            SEO-optimized blog posts in seconds. Perfect for travel bloggers, content creators, 
            and digital marketers.
          </p>
          <div className="cta-container">
            {currentUser ? (
              <Link to="/generate" className="cta-button">Generate a Blog Now</Link>
            ) : (
              <Link to="/login" className="cta-button">Sign In to Get Started</Link>
            )}
          </div>
          <div className="features">
            <div className="feature">
              <h3>AI-Powered Conversion</h3>
              <p>Our advanced AI transforms video transcripts into well-structured blog content.</p>
            </div>
            <div className="feature">
              <h3>SEO Optimization</h3>
              <p>Automatically includes keywords, headings, and formatting for better search rankings.</p>
            </div>
            <div className="feature">
              <h3>Time-Saving</h3>
              <p>Create quality blog content in minutes instead of hours.</p>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Triphoria. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
