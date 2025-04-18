import TodoContext from './todoContext';
import { useState } from 'react';
import { apiRequest } from '../utils/api';

const TodoState = (props) => {
  const [todos, setTodos] = useState([]);
  const token = localStorage.getItem('token');

  // Get all todos
  const getTodos = async () => {
    const data = await apiRequest('/api/todo/fetchtodo', 'GET', null, token);
    setTodos(data);
  };

  // Add a todo
  const addTodo = async (title, description, isCompleted = false) => {
    const newTodo = await apiRequest(
      '/api/todo/addtodo',
      'POST',
      { title, description, isCompleted },
      token
    );
    setTodos((prev) => [...prev, newTodo]);
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    await apiRequest(`/api/todo/deletetodo/${id}`, 'DELETE', null, token);
    setTodos((prev) => prev.filter((todo) => todo._id !== id));
  };

  // Edit a todo
  const editTodo = async (id, title, description, isCompleted) => {
    await apiRequest(
      `/api/todo/updatetodo/${id}`,
      'PUT',
      { title, description, isCompleted },
      token
    );
    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === id ? { ...todo, title, description, isCompleted } : todo
      )
    );
  };

  return (
    <TodoContext.Provider
      value={{ todos, setTodos, addTodo, deleteTodo, editTodo, getTodos }}
    >
      {props.children}
    </TodoContext.Provider>
  );
};

export default TodoState;
