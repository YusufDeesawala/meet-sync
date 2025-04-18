import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Register({ setIsAuthenticated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:5000';


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();
      
      if (res.status === 200) {
        setMsg('Registration successful!');
        localStorage.setItem('token', data.authToken);
        setIsAuthenticated(true);
        navigate('/notes');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="auth-card"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              name="name" 
              type="text"
              placeholder="Enter your name" 
              value={form.name}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email" 
              type="email"
              placeholder="Enter your email" 
              value={form.email}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Create a password" 
              value={form.password}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword"
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm your password" 
              value={form.confirmPassword}
              onChange={handleChange} 
              required 
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {msg && <div className="success-message">{msg}</div>}
          
          <motion.button 
            type="submit" 
            className="auth-button"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Registering...' : 'Register'}
          </motion.button>
        </form>
        <div className="auth-redirect">
          Already have an account? <motion.a whileHover={{ color: '#0056b3' }} onClick={() => navigate('/login')}>Login</motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Register;