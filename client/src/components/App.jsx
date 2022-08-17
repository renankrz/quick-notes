import * as React from 'react';
import {
  Box, Button, Container, Divider,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';
import { createNote } from '../api/notes';
import Categories from './Categories';
import Form from './Form';
import Header from './Header';
import Notes from './Notes';

function App() {
  const [mode, setMode] = React.useState('view');
  const [selected, setSelected] = React.useState([]);
  const expandableNodes = React.useRef([]);
  const selectableNodes = React.useRef([]);

  const query = useQuery(['categories'], readCategoriesRich, {
    onSuccess: (data) => {
      // Keys of nodes that have children
      expandableNodes.current = [...new Set(data.edges.map((e) => e.from))];
      // Keys of all nodes
      selectableNodes.current = data.vertices.map((v) => v.key);
    },
  });

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

  const handleSelectAllClick = () => {
    setSelected((oldSelected) => (oldSelected.length === 0 ? selectableNodes.current : []));
  };

  const handleToggleMode = () => {
    setMode(mode === 'view' ? 'create' : 'view');
  };

  const handleCreateNoteClick = async (data) => {
    await createNote(data);
    setMode('view');
  };

  return (
    <Container maxWidth="xl">
      <Header />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ minWidth: '280px', minHeight: '80vh' }}>
          {query.isSuccess && (
            <Categories
              categories={query.data.categories}
              selected={selected}
              handleSelect={handleSelect}
              handleSelectAllClick={handleSelectAllClick}
              expandableNodes={expandableNodes.current}
            />
          )}
        </Box>
        <Box sx={{
          display: 'flex', justifyContent: 'space-around', minWidth: '100px',
        }}
        >
          <Divider orientation="vertical" />
        </Box>
        <Box width="100%">
          <Button onClick={handleToggleMode}>Toggle mode</Button>
          {mode === 'view'
            && (
              <Notes
                categoriesKeys={selected}
              />
            )}
          {mode === 'create'
            && (
              <Form
                text="CREATE"
                submit={handleCreateNoteClick}
              />
            )}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
