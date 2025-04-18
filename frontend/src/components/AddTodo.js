import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import todoContext from '../context/todoContext';

function AddTodo() {
  const context = useContext(todoContext);
  const { addTodo } = context;
  const [form, setForm] = useState({
    title: '',
    description: '',
    isCompleted: false
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

      await addTodo(form.title, form.description, form.isCompleted);

      setStatus({ message: 'Todo added successfully!', type: 'success' });
      setForm({ title: '', description: '', isCompleted: false });

      setTimeout(() => navigate('/todo'), 1500);
    } catch (error) {
      console.error("Error adding todo:", error);
      setStatus({ message: 'Failed to add todo.', type: 'error' });
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
        <h2>Create New Todo</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter todo title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Write your task details..."
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="isCompleted">
              <input
                id="isCompleted"
                name="isCompleted"
                type="checkbox"
                checked={form.isCompleted}
                onChange={handleChange}
              />
              Mark as Completed
            </label>
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
              {loading ? 'Saving...' : 'Save Todo'}
            </motion.button>
            <motion.button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/todo')}
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

export default AddTodo;