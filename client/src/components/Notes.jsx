import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
    <Box>
      <Box sx={{ mb: 1 }}>
        <Button onClick={() => setMode('all')}>
          all
        </Button>
        <Button onClick={() => setMode('random')}>
          random
        </Button>
      </Box>
      {
        mode === 'random'
        && queryRandom.isSuccess
        && queryRandom.data.map((note) => (
          <Content content={note.data} key={note.key} />
        ))
      }
      {
        mode === 'all'
        && queryAll.isSuccess
        && queryAll.data.map((note) => (
          <Content content={note.data} key={note.key} />
        ))
      }
    </Box>
  );
}

Notes.propTypes = {
  categoriesKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Notes;
