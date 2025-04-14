import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ title: '', description: '', tag: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or specific tag
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'a-z', 'z-a'
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const res = await fetch('http://localhost:5000/api/notes/fetchnotes', {
        headers: { 'auth-token': token }
      });

      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      setNotes(data);
      
      // Extract unique tags for filter dropdown
      const uniqueTags = Array.from(new Set(data.map(note => note.tag)));
      setTags(uniqueTags);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [navigate]);

  const handleEdit = note => {
    setSelectedNote(note);
    setEditForm({
      title: note.title,
      description: note.description,
      tag: note.tag
    });
    setIsEditing(true);
  };

  const handleUpdateNote = async e => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/notes/updatenote/${selectedNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify(editForm)
      });

      if (res.status === 200) {
        const updatedNotes = notes.map(note => 
          note._id === selectedNote._id ? {...note, ...editForm} : note
        );
        setNotes(updatedNotes);
        setIsEditing(false);
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/notes/deletenote/${noteId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': token
        }
      });

      if (res.status === 200) {
        setNotes(notes.filter(note => note._id !== noteId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleEditFormChange = e => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Sort and filter notes
  let filtered = notes;
  
  // Apply tag filter
  if (filter !== 'all') {
    filtered = filtered.filter(note => note.tag === filter);
  }
  
  // Apply search
  if (search) {
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'newest':
      filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'oldest':
      filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'a-z':
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'z-a':
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      break;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const noteVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>Your Notes</h2>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          
          <div className="view-controls">
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
            
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span role="img" aria-label="Grid View">📱</span>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span role="img" aria-label="List View">📋</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your notes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">📝</div>
          <h3>No notes found</h3>
          <p>{search || filter !== 'all' ? 'Try changing your search or filter' : 'Create your first note to get started'}</p>
          {!search && filter === 'all' && (
            <motion.button 
              className="add-note-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/addnote')}
            >
              Create Note
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map(note => (
            <motion.div 
              key={note._id} 
              className={viewMode === 'grid' ? 'note-card' : 'note-list-item'}
              variants={noteVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedNote(note)}
              layoutId={`note-${note._id}`}
            >
              <div className="note-content">
                <h3>{note.title}</h3>
                <p>{note.description.slice(0, viewMode === 'grid' ? 80 : 120)}
                  {note.description.length > (viewMode === 'grid' ? 80 : 120) ? '...' : ''}
                </p>
                <div className="note-footer">
                  <span className="note-tag">{note.tag}</span>
                  <span className="note-date">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="note-actions" onClick={e => e.stopPropagation()}>
                <motion.button 
                  className="edit-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(note);
                  }}
                >
                  ✏️
                </motion.button>
                <motion.button 
                  className="delete-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(note._id);
                  }}
                >
                  🗑️
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* View Note Modal */}
      <AnimatePresence>
        {selectedNote && !isEditing && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div 
              className="modal-window"
              layoutId={`note-${selectedNote._id}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedNote.title}</h2>
                <div className="modal-actions">
                  <motion.button 
                    className="edit-modal-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditForm({
                        title: selectedNote.title,
                        description: selectedNote.description,
                        tag: selectedNote.tag
                      });
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </motion.button>
                  <motion.button 
                    className="close-modal-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedNote(null)}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
              
              <div className="note-full-content">
                <p className="note-description">{selectedNote.description}</p>
                <div className="note-meta">
                  <span className="note-tag-full">Tag: {selectedNote.tag}</span>
                  <span className="note-date-full">
                    Created: {new Date(selectedNote.date).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Note Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-window edit-modal"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Edit Note</h2>
              <form onSubmit={handleUpdateNote}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Content</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tag">Tag</label>
                  <input
                    id="tag"
                    name="tag"
                    value={editForm.tag}
                    onChange={handleEditFormChange}
                  />
                </div>
                
                <div className="modal-actions">
                  <motion.button 
                    type="submit"
                    className="save-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button 
                    type="button"
                    className="cancel-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedNote(null);
                    }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-window delete-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3>Delete Note</h3>
              <p>Are you sure you want to delete this note? This action cannot be undone.</p>
              
              <div className="modal-actions">
                <motion.button 
                  className="delete-confirm-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteNote(deleteConfirm)}
                >
                  Delete
                </motion.button>
                <motion.button 
                  className="cancel-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notes;