import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import webSearchContext from '../context/webSearchContext';

function AddWebSearch() {
  const context = useContext(webSearchContext);
  const { addWebSearch } = context;
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    reference_link: '' 
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await addWebSearch(form.title, form.content, form.reference_link);
      setStatus({ message: 'Web search added successfully!', type: 'success' });
      setForm({ 
        title: '', 
        content: '', 
        reference_link: '' 
      });
      setTimeout(() => navigate('/websearch'), 1500);
    } catch (error) {
      console.error("Error adding web search:", error);
      setStatus({ message: 'Failed to add web search.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="add-note-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="add-note-card"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2>Create New Web Search</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter search title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              placeholder="Enter search content"
              value={form.content}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reference_link">Reference Link</label>
            <input
              id="reference_link"
              name="reference_link"
              type="url"
              placeholder="https://example.com"
              value={form.reference_link}
              onChange={handleChange}
            />
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
          <div className="form-actions">
            <motion.button
              type="submit"
              className="save-note-btn"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Saving...' : 'Save Web Search'}
            </motion.button>
            <motion.button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/websearch')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default AddWebSearch;