import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import noteContext from '../context/noteContext';

function AddNote() {
  const context= useContext(noteContext);
  const {addNote}=context;
  const [form, setForm] = useState({ title: '', description: '', tag: 'General' });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await addNote(form.title, form.description, form.tag); // call context function

      setStatus({ message: 'Note added successfully!', type: 'success' });
      setForm({ title: '', description: '', tag: 'General' });

      setTimeout(() => navigate('/notes'), 1500);
    } catch (error) {
      console.error("Error adding note:", error);
      setStatus({ message: 'Failed to add note.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const commonTags = ['General', 'Work', 'Personal', 'Ideas', 'To-Do', 'Important'];

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
        <h2>Create New Note</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter note title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Content</label>
            <textarea
              id="description"
              name="description"
              placeholder="Write your note here..."
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tag">Tag</label>
            <div className="tag-selection">
              <input
                id="tag"
                name="tag"
                type="text"
                placeholder="Add a tag (e.g. Work, Personal)"
                value={form.tag}
                onChange={handleChange}
                list="common-tags"
              />
              <datalist id="common-tags">
                {commonTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>
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
              {loading ? 'Saving...' : 'Save Note'}
            </motion.button>
            <motion.button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/notes')}
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

export default AddNote;
