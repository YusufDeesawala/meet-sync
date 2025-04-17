import React, { useState, useContext } from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Check from '@mui/icons-material/Check';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import noteContext from '../context/notes/noteContext';

const AddNote = () => {
  const context = useContext(noteContext);
  const { addNote } = context;
  const [note, setNote] = useState({ title: "", description: "", tag: "default" })

  // States
  const [anchorEl, setAnchorEl] = useState(null);
  const [fontWeight, setFontWeight] = useState('normal');
  const [italic, setItalic] = useState(false);
  const [fontMenuEl, setFontMenuEl] = useState(null);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const handleSend = (e) => {
    e.preventDefault();
    addNote(note.title, note.description, note.tag);
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value })
  };

  const fontOptions = [
    'Arial',
    'Roboto',
    'Times New Roman',
    'Courier New',
    'Monospace',
    'Comic Sans MS',
    'Chalkduster',
    'Georgia',
  ];

  return (
    <Box sx={{ p: 3, mt: 2, background: '#f9f9f9', borderRadius: '10px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <h2>Add a Note</h2>
      </Box>

      {/* Title Field */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel sx={{ mb: 1, fontWeight: 'bold' }}>Title</FormLabel>
        <Textarea
          placeholder="Enter title..."
          minRows={1}
          name="title"
          onChange={onChange}
          value={note.title}
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#fff',
            borderRadius: '8px',
            fontFamily: 'Arial',
          }}
        />
      </FormControl>

      {/* Description Field */}
      <FormControl>
        <FormLabel sx={{ mb: 1 }}>Description</FormLabel>
        <Textarea
          placeholder="Type something here…"
          name="description"
          value={note.description}
          onChange={onChange}
          minRows={3}
          endDecorator={
            <Box
              sx={{
                display: 'flex',
                gap: 'var(--Textarea-paddingBlock)',
                pt: 'var(--Textarea-paddingBlock)',
                borderTop: '1px solid',
                borderColor: 'divider',
                flex: 'auto',
              }}
            >
              {/* Bold Button */}
              <IconButton
                variant={fontWeight === 'bold' ? 'soft' : 'plain'}
                color="neutral"
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                <FormatBold />
                <KeyboardArrowDown fontSize="md" />
              </IconButton>

              {/* Font Weight Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                size="sm"
                placement="bottom-start"
                sx={{ '--ListItemDecorator-size': '24px' }}
              >
                {['200', 'normal', 'bold'].map((weight) => (
                  <MenuItem
                    key={weight}
                    selected={fontWeight === weight}
                    onClick={() => {
                      setFontWeight(weight);
                      setAnchorEl(null);
                    }}
                    sx={{ fontWeight: weight }}
                  >
                    <ListItemDecorator>
                      {fontWeight === weight && <Check fontSize="sm" />}
                    </ListItemDecorator>
                    {weight === '200' ? 'Lighter' : weight}
                  </MenuItem>
                ))}
              </Menu>

              {/* Italic Button */}
              <IconButton
                variant={italic ? 'soft' : 'plain'}
                color={italic ? 'primary' : 'neutral'}
                aria-pressed={italic}
                onClick={() => setItalic((prev) => !prev)}
              >
                <FormatItalic />
              </IconButton>

              {/* Font Selection */}
              <IconButton
                variant="plain"
                color="neutral"
                onClick={(event) => setFontMenuEl(event.currentTarget)}
              >
                <FontDownloadIcon />
                <KeyboardArrowDown fontSize="md" />
              </IconButton>

              <Menu
                anchorEl={fontMenuEl}
                open={Boolean(fontMenuEl)}
                onClose={() => setFontMenuEl(null)}
                size="sm"
                placement="bottom-start"
              >
                {fontOptions.map((font) => (
                  <MenuItem
                    key={font}
                    selected={selectedFont === font}
                    onClick={() => {
                      setSelectedFont(font);
                      setFontMenuEl(null);
                    }}
                    sx={{ fontFamily: font }}
                  >
                    <ListItemDecorator>
                      {selectedFont === font && <Check fontSize="sm" />}
                    </ListItemDecorator>
                    {font}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          }
          sx={[
            {
              minWidth: 300,
              fontWeight,
              fontFamily: selectedFont,
            },
            italic ? { fontStyle: 'italic' } : { fontStyle: 'initial' },
          ]}
        />
      </FormControl>
      <FormControl sx={{ mb: 2 }}>
        <FormLabel sx={{ mb: 1, fontWeight: 'bold' }}>Tag</FormLabel>
        <Textarea
          placeholder="Enter a Tag..."
          minRows={1}
          name="tag"
          onChange={onChange}
          value={note.tag}
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#fff',
            borderRadius: '8px',
            fontFamily: 'Arial',
          }}
        />
      </FormControl>
      {/* Send Button */}
      <Button sx={{ ml: 'auto' }} onClick={handleSend}>
        Send
      </Button>
    </Box>
  );
};

export default AddNote;
