import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Prompt for a category name (used for both "Add" and "Rename").
 */
function CategoryNameDialog({
  open,
  title,
  initialName = '',
  onSubmit,
  onClose,
}) {
  const [name, setName] = React.useState(initialName);
  const [wasOpen, setWasOpen] = React.useState(open);

  // Reset the field each time the dialog opens (adjust state during render,
  // the React-recommended alternative to setState inside an effect).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(initialName);
    }
  }

  const trimmed = name.trim();

  const handleSubmit = () => {
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Category name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!trimmed}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryNameDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  initialName: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CategoryNameDialog;
