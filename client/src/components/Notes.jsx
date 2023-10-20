import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import Content from './Content';

function Notes({ notes, categoriesPaths, updateNote, deleteNote }) {
  const [dialogueIsOpen, setDialogueIsOpen] = React.useState(false);

  const handleClickDelete = () => {
    setDialogueIsOpen(true);
  };

  const handleCloseDialogue = () => {
    setDialogueIsOpen(false);
  };

  const handleConfirmDelete = (note) => {
    deleteNote(note.key);
  };

  return (
    <Container sx={{ maxHeight: '75vh', overflow: 'auto' }}>
      {notes.map((note) => (
        <Box sx={{ mb: 4 }} key={note.key}>
          <Card variant="elevation">
            <Box
              sx={{
                background: '#F2F2F2',
                padding: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  {categoriesPaths
                    .filter((c) => c.key === note.categoryKey)
                    .map((categoryPath) => (
                      <Typography
                        key={categoryPath.key}
                        variant="body1"
                        sx={{ color: '#353C65', paddingBottom: 1 }}
                      >
                        {categoryPath.vertices}
                      </Typography>
                    ))}
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: '#353C65', paddingBottom: 1 }}
                  >
                    {note.rank}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ color: '#6977C9' }}>
                {note.title}
              </Typography>
            </Box>
            <CardContent
              sx={{
                paddingTop: 0,
              }}
            >
              <Content content={note.content} />
            </CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '4px',
                paddingBottom: '4px',
              }}
            >
              <Tooltip title="Edit">
                <IconButton onClick={() => updateNote(note)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={handleClickDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Dialog open={dialogueIsOpen} onClose={handleCloseDialogue}>
                <DialogTitle id="alert-dialog-title">
                  {'Really delete?'}
                </DialogTitle>
                <DialogActions sx={{ margin: 'auto' }}>
                  <Button onClick={handleCloseDialogue}>Cancel</Button>
                  <Button onClick={() => handleConfirmDelete(note)} autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Card>
        </Box>
      ))}
    </Container>
  );
}

Notes.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      categoryKey: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      rank: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  categoriesPaths: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      vertices: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  updateNote: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
};

export default Notes;
