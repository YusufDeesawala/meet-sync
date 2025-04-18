import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function Header({ isAuthenticated, onLogout }) {
  const location = useLocation();
  
  return (
    <header className="app-header">
      <div className="header-content">
        <motion.h1 
          className="app-title"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="logo">📝</span> NotePad
        </motion.h1>
        
        {isAuthenticated ? (
          <nav className="nav-menu">
            <Link to="/notes" className={location.pathname === "/notes" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                My Notes
              </motion.div>
            </Link>
            <Link to="/addnote" className={location.pathname === "/addnote" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Add Note
              </motion.div>
            </Link>
            <Link to="/todo" className={location.pathname === "/todo" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                My Todos
              </motion.div>
            </Link>
            <Link to="/addtodo" className={location.pathname === "/addtodo" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Add Todo
              </motion.div>
            </Link>
            {/* New Web Search navigation links */}
            <Link to="/websearch" className={location.pathname === "/websearch" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Web Search
              </motion.div>
            </Link>
            <Link to="/addwebsearch" className={location.pathname === "/addwebsearch" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Add Search
              </motion.div>
            </Link>
            <motion.button 
              className="logout-btn"
              onClick={onLogout}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </nav>
        ) : (
          <nav className="nav-menu">
            <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Login
              </motion.div>
            </Link>
            <Link to="/register" className={location.pathname === "/register" ? "active" : ""}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Register
              </motion.div>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;