import React, { useContext, useEffect, useRef, useState } from 'react';
import noteContext from '../context/notes/noteContext';
import NoteItem from './NoteItem';
import AddNote from './AddNote';
import { Modal, Typography, Box, ModalDialog } from '@mui/joy';
import Button from '@mui/joy/Button';
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';

const Notes = () => {
  const context = useContext(noteContext);
  const { notes, getNotes } = context;

  const [open, setOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: '', title: '', description: '' });

  useEffect(() => {
    getNotes();
  }, []);

  const updateNote = (note) => {
    setCurrentNote({ id: note._id, title: note.title, description: note.description });
    setOpen(true);
  };

  const handleChange = (e) => {
    setCurrentNote({ ...currentNote, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Call your editNote function from context here with currentNote data
    console.log('Updated Note:', currentNote);
    setOpen(false);
  };

  return (
    <>
      <AddNote />

      {/* Edit Note Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog
          aria-labelledby="edit-note-title"
          sx={(theme) => ({
            [theme.breakpoints.only('xs')]: {
              top: 'unset',
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: 0,
              transform: 'none',
              maxWidth: 'unset',
            },
          })}
        >
          <Typography level="h3" id="edit-note-title">
            Edit Note
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <Input
              placeholder="Title"
              name="title"
              value={currentNote.title}
              onChange={handleChange}
              sx={{ fontWeight: 'bold' }}
            />
            <Textarea
              placeholder="Description"
              name="description"
              minRows={3}
              value={currentNote.description}
              onChange={handleChange}
            />
          </Box>

          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row-reverse' },
            }}
          >
            <Button variant="solid" color="primary" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" color="neutral" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Note Cards */}
      <div className="row my-4 mb-3">
        <h2>Your Notes</h2>
        {notes.map((note) => (
          <NoteItem key={note._id} updateNote={updateNote} note={note} />
        ))}
      </div>
    </>
  );
};

export default Notes;
