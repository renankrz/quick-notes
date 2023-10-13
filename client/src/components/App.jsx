import './style/App.css';

import { Box, Button, Container, Divider } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import {
  getCategoriesTree,
  getExpandableCategories,
  getFlattenedCategoriesPaths,
  getSelectableCategories,
} from '../api/categories-tree';
import { createNote, deleteNote, getAllNotes, updateNote } from '../api/notes';
import CategoriesTree from './CategoriesTree';
import Form from './Form';
import Header from './Header';
import Notes from './Notes';

const App = () => {
  const [interactionMode, setInteractionMode] = React.useState('view');
  const [notesViewMode, setNotesViewMode] = React.useState('random');
  const [expandedCategories, setExpandedCategories] = React.useState([]);
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [rand, setRand] = React.useState(Math.random());
  const noteToUpdate = React.useRef(null);
  const expandableNodes = React.useRef([]);
  const selectableNodes = React.useRef([]);

  const queryClient = useQueryClient();

  const queryCategoriesTree = useQuery(['categories-tree'], getCategoriesTree);

  const queryExpandableCategories = useQuery(
    ['expandable-categories'],
    getExpandableCategories,
    {
      onSuccess: (data) => {
        expandableNodes.current = data.map((c) => c.key);
      },
    }
  );

  const querySelectableCategories = useQuery(
    ['selectable-categories'],
    getSelectableCategories,
    {
      onSuccess: (data) => {
        selectableNodes.current = data.map((c) => c.key);
      },
    }
  );

  const queryFlattenedCategoriesPaths = useQuery(
    ['flattened-categories-paths'],
    getFlattenedCategoriesPaths
  );

  const queryNotes = useQuery(['notes', selectedCategories], () =>
    getAllNotes(selectedCategories)
  );

  const mutationCreateNote = useMutation(createNote, {
    onSuccess: () => {
      setInteractionMode('view');
      queryClient.invalidateQueries('notes');
    },
  });

  const mutationUpdateNote = useMutation(updateNote, {
    onSuccess: () => {
      setInteractionMode('view');
      queryClient.invalidateQueries('notes');
    },
  });

  const mutationDeleteNote = useMutation(deleteNote, {
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
    },
  });

  const handleExpand = (event, nodeIds) => {
    setExpandedCategories(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelectedCategories(nodeIds);
  };

  const handleExpandAllClick = () => {
    setExpandedCategories((old) =>
      old.length === 0 ? expandableNodes.current : []
    );
  };

  const handleSelectAllClick = () => {
    setSelectedCategories((old) =>
      old.length === 0 ? selectableNodes.current : []
    );
  };

  const handleGetAllClick = () => {
    setNotesViewMode('all');
  };

  const handleGetRandomClick = async () => {
    setRand(Math.random());
    setNotesViewMode('random');
  };

  const handleToggleInteractionModeClick = () => {
    setInteractionMode(interactionMode === 'view' ? 'create' : 'view');
  };

  const handleDeleteNoteIconClick = async (key) => {
    mutationDeleteNote.mutate(key);
  };

  const handleUpdateNoteIconClick = async (data) => {
    setInteractionMode('update');
    noteToUpdate.current = data;
  };

  const handleCreateNoteSubmit = async (data) => {
    mutationCreateNote.mutate(data);
  };

  const handleUpdateNoteSubmit = async (key, data) => {
    mutationUpdateNote.mutate({ key, data });
  };

  const chooseRandomNote = () => {
    if (queryNotes.data.length === 0) {
      return [];
    }
    return [queryNotes.data[Math.floor(rand * queryNotes.data.length)]];
  };

  return (
    <Container sx={{ minWidth: '95vw' }}>
      <Header />
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <Box
          sx={{
            width: 300,
          }}
        >
          {queryExpandableCategories.isSuccess &&
            querySelectableCategories.isSuccess &&
            queryCategoriesTree.isSuccess && (
              <CategoriesTree
                categories={queryCategoriesTree.data}
                expanded={expandedCategories}
                handleExpand={handleExpand}
                handleExpandAllClick={handleExpandAllClick}
                selected={selectedCategories}
                handleSelect={handleSelect}
                handleSelectAllClick={handleSelectAllClick}
              />
            )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            minWidth: '100px',
          }}
        >
          <Divider orientation="vertical" />
        </Box>
        <Box sx={{ width: '66.7%', margin: '0 auto' }}>
          <Box sx={{ mb: 1, display: 'flex' }}>
            <Button onClick={handleGetAllClick} sx={{ width: '120px' }}>
              get all
            </Button>
            <Button onClick={handleGetRandomClick} sx={{ width: '120px' }}>
              get random
            </Button>
            <Button
              onClick={handleToggleInteractionModeClick}
              sx={{ width: '120px' }}
            >
              {interactionMode === 'view' ? 'create new' : 'view notes'}
            </Button>
          </Box>
          {interactionMode === 'view' &&
            queryNotes.fetchStatus === 'idle' &&
            queryFlattenedCategoriesPaths.isSuccess && (
              <Notes
                notes={
                  notesViewMode === 'all' ? queryNotes.data : chooseRandomNote()
                }
                categoriesPaths={queryFlattenedCategoriesPaths.data}
                updateNote={handleUpdateNoteIconClick}
                deleteNote={handleDeleteNoteIconClick}
              />
            )}
          {interactionMode === 'create' &&
            queryNotes.fetchStatus === 'idle' && (
              <Form
                categoriesPaths={queryFlattenedCategoriesPaths.data}
                notePrefilledData={{
                  categoryKey:
                    selectedCategories.length === 1
                      ? selectedCategories[0]
                      : '',
                  content: '',
                  key: '',
                  rank:
                    selectedCategories.length === 1 &&
                    queryNotes.data.length > 0
                      ? Math.max(...queryNotes.data.map((note) => note.rank)) +
                        1
                      : 1,
                  title: '',
                }}
                submit={handleCreateNoteSubmit}
                submitButtonText="create"
              />
            )}
          {interactionMode === 'update' && (
            <Form
              categoriesPaths={queryFlattenedCategoriesPaths.data}
              notePrefilledData={noteToUpdate.current}
              submit={handleUpdateNoteSubmit}
              submitButtonText="save"
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default App;
