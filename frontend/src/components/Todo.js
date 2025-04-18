import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import TodoContext from '../context/todoContext';

function Todo() {
  const { todos, getTodos, editTodo, deleteTodo } = useContext(TodoContext);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ title: '', description: '', isCompleted: false });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await getTodos();
      setLoading(false);
    };
    fetchData();
  }, [getTodos, navigate]);

  const handleEdit = (todo) => {
    setSelectedTodo(todo);
    setEditForm({
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted
    });
    setIsEditing(true);
  };

  const handleUpdateTodo = async (e) => {
    e.preventDefault();
    await editTodo(selectedTodo._id, editForm.title, editForm.description, editForm.isCompleted);
    setIsEditing(false);
    setSelectedTodo(null);
  };

  const handleEditFormChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value });
  };

  const markAsCompleted = async (todo) => {
    if (!todo.isCompleted) {
      await editTodo(todo._id, todo.title, todo.description, true);
    }
  };

  let filtered = todos.filter(todo =>
    todo.title.toLowerCase().includes(search.toLowerCase()) ||
    todo.description.toLowerCase().includes(search.toLowerCase())
  );

  switch (sortBy) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'a-z':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'z-a':
      filtered.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      break;
  }

  const pendingTodos = filtered.filter(todo => !todo.isCompleted);
  const completedTodos = filtered.filter(todo => todo.isCompleted);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const todoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="todos-container">
      <div className="todos-header">
        <h2>Your Todos</h2>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search todos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="view-controls">
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
              <span role="img" aria-label="Todo Page">📋</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your todos...</p>
        </div>
      ) : todos.length === 0 ? (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="empty-icon">📋</div>
          <h3>Create your first todo to get started</h3>
          <motion.button
            className="add-note-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/addtodo')}
          >
            Create Todo
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Pending Todos */}
          <h3 className="section-heading mb-4">📋 Pending Todos</h3>
          <motion.div
            className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pendingTodos.length === 0 ? (
              <p className="text-muted">You're all caught up! 🎉</p>
            ) : (
              pendingTodos.map(todo => (
                <motion.div
                  key={todo._id}
                  className={viewMode === 'grid' ? 'note-card' : 'note-list-item'}
                  variants={todoVariants}
                  whileHover={{ scale: 1.02 }}
                  layoutId={`todo-${todo._id}`}
                >
                  <div className="note-content">
                  <h3>{todo.title}</h3>
                <p>{todo.description.slice(0, viewMode === 'grid' ? 80 : 120)}
                  {todo.description.length > (viewMode === 'grid' ? 80 : 120) ? '...' : ''}
                </p>
                    <span className="note-date">{new Date(todo.date).toLocaleDateString()}</span>
                  </div>
                  <div className="note-actions">
                    <button onClick={() => handleEdit(todo)} title="Edit"><FiEdit /></button>
                    <button onClick={() => deleteTodo(todo._id)} title="Delete"><FiTrash2 /></button>
                    <button onClick={() => markAsCompleted(todo)} title="Mark as Done"><FiCheckCircle /></button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Completed Todos */}
          <h3 className="section-heading mt-6 my-4">✅ Completed Todos</h3>
          <motion.div
            className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {completedTodos.length === 0 ? (
              <p className="text-muted">No todos completed yet.</p>
            ) : (
              completedTodos.map(todo => (
                <motion.div
                  key={todo._id}
                  className={viewMode === 'grid' ? 'note-card completed' : 'note-list-item completed'}
                  variants={todoVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="note-content">
                    <h3>{todo.title}</h3>
                    <p>{todo.description}</p>
                    <span className="note-date">{new Date(todo.date).toLocaleDateString()}</span>
                  </div>
                  <div className="note-actions">
                    <button onClick={() => handleEdit(todo)}><FiEdit /></button>
                    <button onClick={() => deleteTodo(todo._id)}><FiTrash2 /></button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}
      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-window edit-modal" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
              <h2>Edit Todo</h2>
              <form onSubmit={handleUpdateTodo}>
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
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="isCompleted">Completed</label>
                  <input
                    type="checkbox"
                    id="isCompleted"
                    name="isCompleted"
                    checked={editForm.isCompleted}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className="modal-actions">
                  <motion.button type="submit" className="save-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Save Changes
                  </motion.button>
                  <motion.button type="button" className="cancel-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                    setIsEditing(false);
                    setSelectedTodo(null);
                  }}>
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Todo;
