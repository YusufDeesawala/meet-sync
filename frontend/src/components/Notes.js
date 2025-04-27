import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import noteContext from '../context/noteContext';
import { NotebookPenIcon} from 'lucide-react';

function Notes() {
  const { notes, getNotes, editNote, deleteNote } = useContext(noteContext);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ title: '', description: '', tag: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        await getNotes();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchData();
  }, [getNotes, navigate]);

  useEffect(() => {
    const uniqueTags = Array.from(new Set(notes.map(note => note.tag)));
    setTags(uniqueTags);
  }, [notes]);

  const handleEdit = (note) => {
    setSelectedNote(note);
    setEditForm({
      title: note.title,
      description: note.description,
      tag: note.tag
    });
    setIsEditing(true);
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    await editNote(selectedNote._id, editForm.title, editForm.description, editForm.tag);
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(noteId);
    setDeleteConfirm(null);
  };

  const handleEditFormChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  let filtered = notes;

  if (filter !== 'all') {
    filtered = filtered.filter(note => note.tag === filter);
  }

  if (search) {
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase())
    );
  }

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
      transition: { staggerChildren: 0.1 }
    }
  };

  const noteVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  return (
    <>
    
    <div className="notes-container"  style={{ height: "calc(100vh - 70px)", overflowY: "auto", padding: "1rem" }}>
      
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
              title='Grid View'
            >
              <span role="img" aria-label="Grid View">📱</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title='List View'
            >
              <span role="img" aria-label="Todo Page">📋</span>
            </button>
            <button
              className="view-btn"
              onClick={() => navigate('/addnote')}
              title="Add Note"
            >
             <NotebookPenIcon size={20}/>
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
    <div/>
    </>
  );
}

export default Notes;