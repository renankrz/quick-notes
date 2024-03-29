import { Box, Button, MenuItem, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';

function Form({
  categoriesPaths,
  notePrefilledData,
  submit,
  submitButtonText,
}) {
  const { control, handleSubmit } = useForm({
    defaultValues: notePrefilledData,
  });

  const handleSubmitClick = (data) => {
    try {
      if (notePrefilledData.key === '') {
        // Creating
        submit(data);
      } else {
        // Updating
        submit(notePrefilledData.key, data);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Box>
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="0 20px">
        <Controller
          name="categoryKey"
          control={control}
          render={({ field }) => (
            <TextField
              defaultValue=""
              label="Select a category"
              margin="dense"
              select
              size="small"
              {...field}
            >
              {categoriesPaths
                .map((c) => ({
                  key: c.key,
                  vertices: c.vertices,
                }))
                .sort((a, b) => {
                  const nameA = a.vertices
                    .toUpperCase()
                    .normalize('NFD')
                    .replace(/\p{Diacritic}/gu, '');
                  const nameB = b.vertices
                    .toUpperCase()
                    .normalize('NFD')
                    .replace(/\p{Diacritic}/gu, '');
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                })
                .map((c) => (
                  <MenuItem key={c.key} value={c.key}>
                    {c.vertices}
                  </MenuItem>
                ))}
            </TextField>
          )}
        />
        <Controller
          name="rank"
          control={control}
          render={({ field }) => (
            <TextField label="Rank" size="small" margin="dense" {...field} />
          )}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField label="Title" margin="normal" size="small" {...field} />
          )}
        />
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              label="Content"
              margin="normal"
              multiline
              rows={8}
              placeholder="LaTeX, Markdown, code..."
              {...field}
            />
          )}
        />
        <Button
          fullWidth
          onClick={handleSubmit(handleSubmitClick)}
          size="large"
          variant="outlined"
          sx={{ marginTop: 2 }}
        >
          {submitButtonText}
        </Button>
      </Box>
    </Box>
  );
}

Form.propTypes = {
  categoriesPaths: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      vertices: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  notePrefilledData: PropTypes.shape({
    categoryKey: PropTypes.string,
    content: PropTypes.string,
    key: PropTypes.string,
    rank: PropTypes.number,
    title: PropTypes.string,
  }),
  submit: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired,
};

Form.defaultProps = {
  notePrefilledData: {
    categoryKey: '',
    content: '',
    key: '',
    rank: 0,
    title: '',
  },
};

export default Form;
