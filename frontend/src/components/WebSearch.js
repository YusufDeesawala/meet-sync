import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import webSearchContext from '../context/webSearchContext';
import { FilePlus2 } from 'lucide-react';

function WebSearch() {
  const { webSearches, getWebSearches, editWebSearch, deleteWebSearch } = useContext(webSearchContext);
  const [selectedWebSearch, setSelectedWebSearch] = useState(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ title: '', content: '', reference_link: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [titles, setTitles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        await getWebSearches();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching web searches:", error);
      }
    };
    fetchData();
  }, [getWebSearches, navigate]);

  useEffect(() => {
    const uniqueTitles = Array.from(new Set(webSearches.map(webSearch => webSearch.title)));
    setTitles(uniqueTitles);
  }, [webSearches]);

  const handleEdit = (webSearch) => {
    setSelectedWebSearch(webSearch);
    setEditForm({
      title: webSearch.title,
      content: webSearch.content,
      reference_link: webSearch.reference_link
    });
    setIsEditing(true);
  };

  const handleUpdateWebSearch = async (e) => {
    e.preventDefault();
    await editWebSearch(
      selectedWebSearch._id,
      editForm.title,
      editForm.content,
      editForm.reference_link
    );
    setIsEditing(false);
    setSelectedWebSearch(null);
  };

  const handleDeleteWebSearch = async (webSearchId) => {
    await deleteWebSearch(webSearchId);
    setDeleteConfirm(null);
  };

  const handleEditFormChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  let filtered = webSearches;
  if (filter !== 'all') {
    filtered = filtered.filter(webSearch => webSearch.title === filter);
  }
  if (search) {
    filtered = filtered.filter(webSearch =>
      webSearch.title.toLowerCase().includes(search.toLowerCase()) ||
      webSearch.content.toLowerCase().includes(search.toLowerCase()) ||
      (webSearch.reference_link && webSearch.reference_link.toLowerCase().includes(search.toLowerCase()))
    );
  }

  switch (sortBy) {
    case 'newest':
      filtered = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      break;
    case 'oldest':
      filtered = [...filtered].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
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

  const webSearchVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="notes-container" style={{ height: "calc(100vh - 70px)", overflowY: "auto", padding: "1rem" }}>
      <div className="notes-header">
        <h2>Your Web Searches</h2>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search web searches..."
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
              <option value="all">All Titles</option>
              {titles.map(title => (
                <option key={title} value={title}>{title}</option>
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
              title='List View'
              onClick={() => setViewMode('list')}
            >
              <span role="img" aria-label="List View">📋</span>
            </button>
            <button
              className="view-btn"
              onClick={() => navigate('/addwebsearch')}
              title="Add Web Search"
            >
             <FilePlus2 size={20}/>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your web searches...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">🔍</div>
          <h3>No web searches found</h3>
          <p>{search || filter !== 'all' ? 'Try changing your search or filter' : 'Create your first web search to get started'}</p>
          {!search && filter === 'all' && (
            <motion.button
              className="add-note-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/addwebsearch')}
            >
              Create Web Search
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
          {filtered.map(webSearch => (
            <motion.div
              key={webSearch._id}
              className={viewMode === 'grid' ? 'note-card' : 'note-list-item'}
              variants={webSearchVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedWebSearch(webSearch)}
              layoutId={`websearch-${webSearch._id}`}
            >
              <div className="note-content">
                <h3>{webSearch.title}</h3>
                <p>
                  {webSearch.content.length > 100
                    ? webSearch.content.substring(0, 100) + "..."
                    : webSearch.content}
                </p>
                <div className="note-footer">
                  <span className="note-tag">{webSearch.reference_link ? "📌 Reference" : "No Reference"}</span>
                  <span className="note-date">
                    {new Date(webSearch.timestamp).toLocaleDateString()}
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
                    handleEdit(webSearch);
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
                    setDeleteConfirm(webSearch._id);
                  }}
                >
                  🗑️
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* View WebSearch Modal */}
      <AnimatePresence>
        {selectedWebSearch && !isEditing && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWebSearch(null)}
          >
            <motion.div
              className="modal-window"
              layoutId={`websearch-${selectedWebSearch._id}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedWebSearch.title}</h2>
                <div className="modal-actions">
                  <motion.button
                    className="edit-modal-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditForm({
                        title: selectedWebSearch.title,
                        content: selectedWebSearch.content,
                        reference_link: selectedWebSearch.reference_link
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
                    onClick={() => setSelectedWebSearch(null)}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
              <div className="note-full-content">
                <div className="web-search-content">
                  <h3>Content</h3>
                  <div className="content-text">
                    {selectedWebSearch.content}
                  </div>
                </div>
                {selectedWebSearch.reference_link && (
                  <div className="reference-link-section">
                    <h3>Reference Link</h3>
                    <a
                      href={selectedWebSearch.reference_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reference-link"
                    >
                      {selectedWebSearch.reference_link}
                    </a>
                  </div>
                )}
                <div className="note-meta">
                  <span className="note-date-full">
                    Created: {new Date(selectedWebSearch.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit WebSearch Modal */}
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
              <h2>Edit Web Search</h2>
              <form onSubmit={handleUpdateWebSearch}>
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
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={editForm.content}
                    onChange={handleEditFormChange}
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
                    value={editForm.reference_link}
                    onChange={handleEditFormChange}
                    placeholder="https://example.com"
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
                      setSelectedWebSearch(null);
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
              <h3>Delete Web Search</h3>
              <p>Are you sure you want to delete this web search? This action cannot be undone.</p>
              <div className="modal-actions">
                <motion.button
                  className="delete-confirm-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteWebSearch(deleteConfirm)}
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

export default WebSearch;