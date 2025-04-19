import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {} from '../utils/api'

function Login({ setIsAuthenticated }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_API_URL;
  console.log(BASE_URL)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      if (res.status === 200) {
        localStorage.setItem('token', data.authToken);
        setIsAuthenticated(true);
        navigate('/notes');
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
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
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password" 
              value={form.password}
              onChange={handleChange} 
              required 
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <motion.button 
            type="submit" 
            className="auth-button"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
        <div className="auth-redirect">
          Don't have an account? <motion.a whileHover={{ color: '#0056b3' }} onClick={() => navigate('/register')}>Register</motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Login;