import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Card, CardContent, Typography,
} from '@mui/material';
import Content from './Content';

function Notes({ notes }) {
  return (
    <Box>
      {
        notes.map((note) => (
          <Box sx={{ mb: 4 }} key={note.key}>
            <Card variant="elevation">
              <Box sx={{
                background: '#F2F2F2', padding: 2, paddingBottom: 2,
              }}
              >
                <Typography variant="h5" sx={{ color: '#6977C9' }}>
                  {note.title}
                </Typography>
              </Box>
              <CardContent>
                <Content content={note.content} />
              </CardContent>
            </Card>
          </Box>
        ))
      }
    </Box>
  );
}

Notes.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.shape({
    categoryKey: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired).isRequired,
};

export default Notes;
