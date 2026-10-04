import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const ROOT_OPTION = { key: '__root__', label: '(root)' };

/**
 * Pick a single target category. Reuses the flattened category paths so the
 * user sees full breadcrumbs ("A > B > C"). When moving a category, pass its
 * own key and descendant keys in `excludeKeys` to prevent cycles.
 */
function CategoryPickerDialog({
  open,
  title,
  categoriesPaths,
  excludeKeys,
  allowRoot,
  onSelect,
  onClose,
}) {
  const [value, setValue] = React.useState(null);

  React.useEffect(() => {
    if (open) {
      setValue(null);
    }
  }, [open]);

  const options = React.useMemo(() => {
    const base = categoriesPaths
      .filter((c) => !excludeKeys.includes(c.key))
      .map((c) => ({ key: c.key, label: c.vertices }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return allowRoot ? [ROOT_OPTION, ...base] : base;
  }, [categoriesPaths, excludeKeys, allowRoot]);

  const handleConfirm = () => {
    if (!value) {
      return;
    }
    onSelect(value.key === ROOT_OPTION.key ? null : value.key);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ mt: 1 }}
          options={options}
          value={value}
          onChange={(_, newValue) => setValue(newValue)}
          isOptionEqualToValue={(opt, val) => opt.key === val.key}
          getOptionLabel={(opt) => opt.label}
          renderInput={(params) => (
            <TextField {...params} label="Target category" autoFocus />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={!value}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryPickerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  categoriesPaths: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      vertices: PropTypes.string.isRequired,
    })
  ).isRequired,
  excludeKeys: PropTypes.arrayOf(PropTypes.string),
  allowRoot: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CategoryPickerDialog.defaultProps = {
  excludeKeys: [],
  allowRoot: false,
};

export default CategoryPickerDialog;
