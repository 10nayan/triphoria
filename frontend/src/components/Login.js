import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [formTouched, setFormTouched] = useState(false);

  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page they were trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  // Memoize the validation result to prevent infinite re-renders
  const isFormValid = () => {
    return username.trim() !== '' && password.length >= 6;
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    
    setFormTouched(true);
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoginError('');
    
    try {
      const result = await login(username, password);
      
      if (result && result.success) {
        // Redirect to the page they were trying to access or home
        navigate(from, { replace: true });
      } else {
        // Check for specific field errors
        const errorMessage = result?.error || 'Login failed. Please check your credentials.';
        
        if (errorMessage.toLowerCase().includes('invalid credentials')) {
          // Show error for both username and password fields
          setFormErrors({
            username: 'Invalid username or password',
            password: 'Invalid username or password'
          });
        } else {
          // General error
          setLoginError(errorMessage);
        }
      }
    } catch (err) {
      setLoginError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to Triphoria</p>
      </div>
      
      {loginError && (
        <div className="error-message shake">{loginError}</div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            autoComplete="username"
          />
          {formErrors.username && (
            <div className="validation-error">{formErrors.username}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {formErrors.password && (
            <div className="validation-error">{formErrors.password}</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isSubmitting || (formTouched && !isFormValid())}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-footer">
        Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
