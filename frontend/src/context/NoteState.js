import NoteContext from './noteContext';
import { useState } from "react";
import { apiRequest } from "../utils/api";

const NoteState = (props) => {
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem("token");

  // Get all Notes
  const getNotes = async () => {
    const data = await apiRequest("/api/notes/fetchnotes", "GET", null, token);
    setNotes(data);
  };

  // Add a note
  const addNote = async (title, description, tag) => {
    const newNote = await apiRequest("/api/notes/addnote", "POST", {
      title,
      description,
      tag,
    }, token);
    setNotes((prev) => [...prev, newNote]);
  };

  // Delete a note
  const deleteNote = async (id) => {
    await apiRequest(`/api/notes/deletenote/${id}`, "DELETE", null, token);
    setNotes((prev) => prev.filter((note) => note._id !== id));
  };

  // Edit a note
  const editNote = async (id, title, description, tag) => {
    await apiRequest(`/api/notes/updatenote/${id}`, "PUT", {
      title,
      description,
      tag,
    }, token);

    // Update local state
    setNotes((prev) =>
      prev.map((note) =>
        note._id === id ? { ...note, title, description, tag } : note
      )
    );
  };

  return (
    <NoteContext.Provider value={{ notes, setNotes, deleteNote, editNote, addNote, getNotes }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
