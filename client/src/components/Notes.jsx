import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import Content from './Content';

function Notes({ notes, categoriesPaths, updateNote, deleteNote }) {
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
                <IconButton onClick={() => deleteNote(note.key)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
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
