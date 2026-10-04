import './style/App.css';

import { Alert, Box, Button, Container, Divider, Snackbar } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import {
  createCategory,
  deleteCategory,
  getCategoriesTree,
  getExpandableCategories,
  getFlattenedCategoriesPaths,
  getSelectableCategories,
  moveCategory,
  renameCategory,
} from '../api/categories-tree';
import {
  createNote,
  deleteAllNotes,
  deleteNote,
  getAllNotes,
  moveAllNotes,
  moveNote,
  updateNote,
} from '../api/notes';
import CategoriesTree from './CategoriesTree';
import CategoryNameDialog from './dialogs/CategoryNameDialog';
import CategoryPickerDialog from './dialogs/CategoryPickerDialog';
import ConfirmDialog from './dialogs/ConfirmDialog';
import Form from './Form';
import Header from './Header';
import Notes from './Notes';

// Collect a node's own key plus all descendant keys, for cycle-safe moves.
const collectKeys = (node) => {
  const keys = [node.key];
  (node.children || []).forEach((child) => {
    keys.push(...collectKeys(child));
  });
  return keys;
};

const App = () => {
  const [interactionMode, setInteractionMode] = React.useState('view');
  const [notesViewMode, setNotesViewMode] = React.useState('random');
  const [expandedCategories, setExpandedCategories] = React.useState([]);
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [rand, setRand] = React.useState(() => Math.random());
  const [dialog, setDialog] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState(null);
  const [noteToUpdate, setNoteToUpdate] = React.useState(null);
  const expandableNodes = React.useRef([]);
  const selectableNodes = React.useRef([]);

  const queryClient = useQueryClient();

  const notify = (message, severity = 'error') =>
    setSnackbar({ message, severity });

  const invalidateCategories = () => {
    ['categories-tree', 'expandable-categories', 'selectable-categories', 'flattened-categories-paths'].forEach(
      (key) => queryClient.invalidateQueries({ queryKey: [key] })
    );
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const closeDialog = () => setDialog(null);

  const queryCategoriesTree = useQuery({
    queryKey: ['categories-tree'],
    queryFn: getCategoriesTree,
  });

  const queryExpandableCategories = useQuery({
    queryKey: ['expandable-categories'],
    queryFn: getExpandableCategories,
  });

  const querySelectableCategories = useQuery({
    queryKey: ['selectable-categories'],
    queryFn: getSelectableCategories,
  });

  // React Query v5 removed `onSuccess` from useQuery; derive the ref lists from
  // the query data instead.
  React.useEffect(() => {
    if (queryExpandableCategories.data) {
      expandableNodes.current = queryExpandableCategories.data.map((c) => c.key);
    }
  }, [queryExpandableCategories.data]);

  React.useEffect(() => {
    if (querySelectableCategories.data) {
      selectableNodes.current = querySelectableCategories.data.map((c) => c.key);
    }
  }, [querySelectableCategories.data]);

  const queryFlattenedCategoriesPaths = useQuery({
    queryKey: ['flattened-categories-paths'],
    queryFn: getFlattenedCategoriesPaths,
  });

  const queryNotes = useQuery({
    queryKey: ['notes', selectedCategories],
    queryFn: () => getAllNotes(selectedCategories),
  });

  const mutationCreateNote = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      setInteractionMode('view');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const mutationUpdateNote = useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      setInteractionMode('view');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const mutationDeleteNote = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const makeCategoryMutationOptions = (mutationFn, successMsg) => ({
    mutationFn,
    onSuccess: () => {
      invalidateCategories();
      if (successMsg) {
        notify(successMsg, 'success');
      }
    },
    onError: (err) => notify(err.message),
  });

  const mutationCreateCategory = useMutation(
    makeCategoryMutationOptions(createCategory, 'Category created')
  );
  const mutationRenameCategory = useMutation(
    makeCategoryMutationOptions(renameCategory, 'Category renamed')
  );
  const mutationMoveCategory = useMutation(
    makeCategoryMutationOptions(moveCategory, 'Category moved')
  );
  const mutationDeleteCategory = useMutation(
    makeCategoryMutationOptions(deleteCategory, 'Category deleted')
  );

  const mutationMoveNote = useMutation({
    mutationFn: moveNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      notify('Note moved', 'success');
    },
    onError: (err) => notify(err.message),
  });

  const mutationMoveAllNotes = useMutation({
    mutationFn: moveAllNotes,
    onSuccess: (moved) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      notify(`Moved ${moved} note(s)`, 'success');
    },
    onError: (err) => notify(err.message),
  });

  const mutationDeleteAllNotes = useMutation({
    mutationFn: deleteAllNotes,
    onSuccess: (deleted) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      notify(`Deleted ${deleted} note(s)`, 'success');
    },
    onError: (err) => notify(err.message),
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
    setNoteToUpdate(data);
  };

  const handleCreateNoteSubmit = async (data) => {
    mutationCreateNote.mutate(data);
  };

  const handleUpdateNoteSubmit = async (key, data) => {
    mutationUpdateNote.mutate({ key, data });
  };

  // --- Category tree actions (open the relevant dialog) ---
  const handleAddRoot = () =>
    setDialog({ type: 'add-root' });
  const handleAddChild = (node) =>
    setDialog({ type: 'add-child', node });
  const handleRenameCategory = (node) =>
    setDialog({ type: 'rename', node });
  const handleMoveCategory = (node) =>
    setDialog({ type: 'move-category', node });
  const handleDeleteCategory = (node) =>
    mutationDeleteCategory.mutate(node.key);
  const handleMoveAllNotes = (node) =>
    setDialog({ type: 'move-all-notes', node });
  const handleDeleteAllNotes = (node) =>
    setDialog({ type: 'delete-all-notes', node });
  const handleMoveNote = (note) =>
    setDialog({ type: 'move-note', note });

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
                onAddRoot={handleAddRoot}
                onAddChild={handleAddChild}
                onRename={handleRenameCategory}
                onMoveCategory={handleMoveCategory}
                onDeleteCategory={handleDeleteCategory}
                onMoveAllNotes={handleMoveAllNotes}
                onDeleteAllNotes={handleDeleteAllNotes}
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
                moveNote={handleMoveNote}
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
              notePrefilledData={noteToUpdate}
              submit={handleUpdateNoteSubmit}
              submitButtonText="save"
            />
          )}
        </Box>
      </Box>

      {/* ---- Category / notes management dialogs ---- */}
      <CategoryNameDialog
        open={dialog?.type === 'add-root'}
        title="Add category"
        onSubmit={(name) =>
          mutationCreateCategory.mutate({ name, parentKey: null })
        }
        onClose={closeDialog}
      />
      <CategoryNameDialog
        open={dialog?.type === 'add-child'}
        title={`Add subcategory under "${dialog?.node?.name ?? ''}"`}
        onSubmit={(name) =>
          mutationCreateCategory.mutate({ name, parentKey: dialog.node.key })
        }
        onClose={closeDialog}
      />
      <CategoryNameDialog
        open={dialog?.type === 'rename'}
        title="Rename category"
        initialName={dialog?.node?.name ?? ''}
        onSubmit={(name) =>
          mutationRenameCategory.mutate({ key: dialog.node.key, name })
        }
        onClose={closeDialog}
      />
      <CategoryPickerDialog
        open={dialog?.type === 'move-category'}
        title={`Move "${dialog?.node?.name ?? ''}" to…`}
        categoriesPaths={queryFlattenedCategoriesPaths.data ?? []}
        excludeKeys={dialog?.node ? collectKeys(dialog.node) : []}
        allowRoot
        onSelect={(newParentKey) =>
          mutationMoveCategory.mutate({ key: dialog.node.key, newParentKey })
        }
        onClose={closeDialog}
      />
      <CategoryPickerDialog
        open={dialog?.type === 'move-all-notes'}
        title={`Move all notes from "${dialog?.node?.name ?? ''}" to…`}
        categoriesPaths={queryFlattenedCategoriesPaths.data ?? []}
        excludeKeys={dialog?.node ? [dialog.node.key] : []}
        onSelect={(toCategoryKey) =>
          mutationMoveAllNotes.mutate({
            fromCategoryKey: dialog.node.key,
            toCategoryKey,
          })
        }
        onClose={closeDialog}
      />
      <CategoryPickerDialog
        open={dialog?.type === 'move-note'}
        title="Move note to…"
        categoriesPaths={queryFlattenedCategoriesPaths.data ?? []}
        excludeKeys={dialog?.note ? [dialog.note.categoryKey] : []}
        onSelect={(categoryKey) =>
          mutationMoveNote.mutate({ key: dialog.note.key, categoryKey })
        }
        onClose={closeDialog}
      />
      <ConfirmDialog
        open={dialog?.type === 'delete-all-notes'}
        title="Delete all notes?"
        message={`This permanently deletes every note directly in "${
          dialog?.node?.name ?? ''
        }". This cannot be undone.`}
        confirmLabel="Delete all"
        onConfirm={() =>
          mutationDeleteAllNotes.mutate({ categoryKey: dialog.node.key })
        }
        onClose={closeDialog}
      />

      <Snackbar
        open={snackbar !== null}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar !== null ? (
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(null)}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Container>
  );
};

export default App;
