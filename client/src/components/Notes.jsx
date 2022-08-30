import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Card, CardContent, Typography,
} from '@mui/material';
import Content from './Content';

function Notes({ notes }) {
  return (
    <Box sx={{ mx: 16 }}>
      {
        notes.map((note) => (
          <Box sx={{ mb: 4 }} key={note.key}>
            <Card variant="outlined">
              <CardContent>
                <Typography sx={{ fontSize: '24px', color: 'dimgray' }}>{note.title}</Typography>
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
