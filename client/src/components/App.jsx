import * as React from 'react';
import {
  Box, Button, Container, Divider,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';
import { createNote, readAllNotes, readRandomNote } from '../api/notes';
import Categories from './Categories';
import Form from './Form';
import Header from './Header';
import Notes from './Notes';

import './style/App.css';

function App() {
  const [interactionMode, setInteractionMode] = React.useState('view');
  const [notesViewMode, setNotesViewMode] = React.useState('random');
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const expandableNodes = React.useRef([]);
  const selectableNodes = React.useRef([]);

  const queryCategories = useQuery(['categories'], readCategoriesRich, {
    onSuccess: (data) => {
      // Keys of nodes that have children
      expandableNodes.current = [...new Set(data.edges.map((e) => e.from))];
      // Keys of all nodes
      selectableNodes.current = data.vertices.map((v) => v.key);
    },
  });

  const queryRandom = useQuery(
    ['queryRandom', selectedCategories],
    () => readRandomNote(selectedCategories),
  );

  const queryAll = useQuery(
    ['queryAll', selectedCategories],
    () => readAllNotes(selectedCategories),
  );

  const handleSelectAllClick = () => {
    setSelectedCategories((old) => (old.length === 0 ? selectableNodes.current : []));
  };

  const handleSelect = (event, nodeIds) => {
    setSelectedCategories(nodeIds);
  };

  const handleToggleModeClick = () => {
    setInteractionMode(interactionMode === 'view' ? 'create' : 'view');
  };

  const handleAllClick = () => {
    setNotesViewMode('all');
  };

  const handleRandomClick = () => {
    if (notesViewMode === 'random') {
      queryRandom.refetch();
    } else {
      setNotesViewMode('random');
    }
  };

  const handleCreateNoteClick = async (data) => {
    await createNote(data);
    setInteractionMode('view');
  };

  const handleDeleteClick = async (key) => {
    console.log(key);
  };

  const handleEditClick = async (note) => {
    console.log(note);
  };

  return (
    <Container maxWidth="xl">
      <Header />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ minWidth: '280px', minHeight: '80vh' }}>
          {queryCategories.isSuccess && (
            <Categories
              categories={queryCategories.data.categories}
              selected={selectedCategories}
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
        <Box sx={{ width: '66.7%', margin: '0 auto' }}>
          <Box sx={{ mb: 1, display: 'flex' }}>
            <Button onClick={handleAllClick} sx={{ width: '120px' }}>get all</Button>
            <Button onClick={handleRandomClick} sx={{ width: '120px' }}>get random</Button>
            <Button onClick={handleToggleModeClick} sx={{ width: '120px' }}>
              {interactionMode === 'view' ? 'create new' : 'view notes'}
            </Button>
          </Box>
          {interactionMode === 'view'
            && (
              !(queryAll.isLoading || queryRandom.isLoading) && (
                <Notes
                  notes={notesViewMode === 'all' ? queryAll.data : queryRandom.data}
                  deleteNote={handleDeleteClick}
                  editNote={handleEditClick}
                />
              )
            )}
          {interactionMode === 'create'
            && (
              <Form
                submit={handleCreateNoteClick}
                submitButtonText="create"
              />
            )}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
