import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './components/Login';
import Register from './components/Register';
import YouTubeLinkForm from './components/YouTubeLinkForm';
import InfluencerRegistration from './components/InfluencerRegistration';
import BecomeInfluencerInfo from './components/BecomeInfluencerInfo';
import BlogView from './components/BlogView';
import InfluencerProfile from './components/InfluencerProfile';
import ProtectedRoute from './components/ProtectedRoute';
import InfluencerRoute from './components/InfluencerRoute';
import { AuthProvider } from './context/AuthContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/generate" 
            element={
              <InfluencerRoute>
                <YouTubeLinkForm />
              </InfluencerRoute>
            } 
          />
          <Route 
            path="/become-influencer" 
            element={
              <ProtectedRoute>
                <InfluencerRegistration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/become-influencer-info" 
            element={
              <ProtectedRoute>
                <BecomeInfluencerInfo />
              </ProtectedRoute>
            } 
          />
          <Route path="/blog/:slug" element={<BlogView />} />
          <Route path="/:username" element={<InfluencerProfile />} />
          <Route path="/:username/blog/:slug" element={<BlogView />} />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
