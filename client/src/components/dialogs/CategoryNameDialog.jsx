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
function CategoryNameDialog({ open, title, initialName, onSubmit, onClose }) {
  const [name, setName] = React.useState(initialName);

  React.useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

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

CategoryNameDialog.defaultProps = {
  initialName: '',
};

export default CategoryNameDialog;
