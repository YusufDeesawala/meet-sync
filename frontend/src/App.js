import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AddNote from './components/AddNote';
import Notes from './components/Notes';
import Header from './components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import NoteState from './context/NoteState';
import TodoState from './context/TodoState';
import './App.css';
import Todo from './components/Todo';
import AddTodo from './components/AddTodo';
import Home from './components/Home';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <NoteState>
      <TodoState>
        <Router>
          <div className="App">
            <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="app-container"
              >
                <Routes>
                  <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/register"
                    element={
                      !isAuthenticated ? (
                        <Register setIsAuthenticated={setIsAuthenticated} />
                      ) : (
                        <Navigate to="/home" />
                      )
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      !isAuthenticated ? (
                        <Login setIsAuthenticated={setIsAuthenticated} />
                      ) : (
                        <Navigate to="/home" />
                      )
                    }
                  />
                  <Route
                    path="/addnote"
                    element={isAuthenticated ? <AddNote /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/notes"
                    element={isAuthenticated ? <Notes /> : <Navigate to="/login" />}
                  />
                   <Route
                    path="/home"
                    element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
                  />
                  <Route path='/addtodo' element={isAuthenticated? <AddTodo/>:<Navigate to={"/login"}/>}/>
                  <Route path='/todo' element={isAuthenticated ? <Todo/>: <Navigate to="/login"/>}/>
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </Router>
      </TodoState>
    </NoteState>
  );
}

export default App;
