import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Card, CardContent, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { readAllNotes, readRandomNote } from '../api/notes';
import Content from './Content';

function Notes({ categoriesKeys }) {
  const [mode, setMode] = React.useState('random');

  const queryRandom = useQuery(
    ['queryRandom', categoriesKeys],
    () => readRandomNote(categoriesKeys),
  );

  const queryAll = useQuery(
    ['queryAll', categoriesKeys],
    () => readAllNotes(categoriesKeys),
  );

  return (
    <Box sx={{ mx: 16 }}>
      <Box sx={{ mb: 1 }}>
        <Button onClick={() => setMode('all')} sx={{ justifyContent: 'flex-start' }}>
          all
        </Button>
        <Button onClick={() => setMode('random')} sx={{ justifyContent: 'flex-start' }}>
          random
        </Button>
      </Box>
      {
        mode === 'random'
        && queryRandom.isSuccess
        && queryRandom.data.map((note) => (
          <Box sx={{ mb: 4 }}>
            <Card variant="outlined" key={note.key}>
              <CardContent>
                <Typography sx={{ fontSize: '24px', color: 'dimgray' }}>{note.title}</Typography>
                <Content content={note.data} />
              </CardContent>
            </Card>
          </Box>
        ))
      }
      {
        mode === 'all'
        && queryAll.isSuccess
        && queryAll.data.map((note) => (
          <Box sx={{ mb: 4 }}>
            <Card variant="outlined" key={note.key}>
              <CardContent>
                <Typography sx={{ fontSize: '24px', color: 'dimgray' }}>{note.title}</Typography>
                <Content content={note.data} />
              </CardContent>
            </Card>
          </Box>
        ))
      }
    </Box>
  );
}

Notes.propTypes = {
  categoriesKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Notes;
