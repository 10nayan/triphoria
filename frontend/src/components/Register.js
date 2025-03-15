import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [formTouched, setFormTouched] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Memoize the validation result to prevent infinite re-renders
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return (
      formData.username.trim().length >= 3 &&
      emailRegex.test(formData.email) &&
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword
    );
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    setRegisterError('');
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = formData;
    
    try {
      const result = await register(userData);
      
      if (result && result.success) {
        setRegistrationSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Check for specific field errors
        const errorMessage = result?.error || 'Registration failed. Please try again.';
        
        // Check if the error is related to a specific field
        if (errorMessage.toLowerCase().includes('username already exists')) {
          setFormErrors(prev => ({
            ...prev,
            username: 'Username already exists'
          }));
        } else if (errorMessage.toLowerCase().includes('email already exists')) {
          setFormErrors(prev => ({
            ...prev,
            email: 'Email already exists'
          }));
        } else {
          // General error
          setRegisterError(errorMessage);
        }
      }
    } catch (err) {
      setRegisterError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-header">
          <h1>Registration Successful!</h1>
          <p>Redirecting you to login...</p>
        </div>
        <div className="auth-footer">
          <Link to="/login" className="auth-link">Click here if you're not redirected</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Create an Account</h1>
        <p>Join Triphoria to connect with your favourite inflencer</p>
      </div>
      
      {registerError && (
        <div className="error-message shake">{registerError}</div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Choose a username"
            autoComplete="username"
          />
          {formErrors.username && (
            <div className="validation-error">{formErrors.username}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            autoComplete="email"
          />
          {formErrors.email && (
            <div className="validation-error">{formErrors.email}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            autoComplete="given-name"
          />
          {formErrors.firstName && (
            <div className="validation-error">{formErrors.firstName}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
          {formErrors.lastName && (
            <div className="validation-error">{formErrors.lastName}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a password"
            autoComplete="new-password"
          />
          {formErrors.password && (
            <div className="validation-error">{formErrors.password}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <div className="validation-error">{formErrors.confirmPassword}</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isSubmitting || (formTouched && !isFormValid())}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="auth-footer">
        Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;
