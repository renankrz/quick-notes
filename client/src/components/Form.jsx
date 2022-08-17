import * as React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

function Form({ noteData, text, submit }) {
  const { register, handleSubmit } = useForm({
    defaultValues: noteData,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onClickSubmit = (content) => {
    try {
      setLoading(true);
      if (noteData.id === '') {
        // Creating
        submit(content);
      } else {
        // Updating
        submit(noteData.id, content);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="form-container dark-bg">
      <form className="form" onSubmit={handleSubmit(onClickSubmit)}>
        {error ? <h3 className="error">{error}</h3> : null}

        <div className="field">
          <label htmlFor="categoryKey">
            <p className="label">Category key</p>
            <input type="text" id="categoryKey" name="categoryKey" {...register('categoryKey')} />
          </label>
        </div>

        <div className="field">
          <label htmlFor="title">
            <p className="label">Title</p>
            <input type="text" id="title" name="title" {...register('title')} />
          </label>
        </div>

        <div className="field">
          <label htmlFor="rank">
            <p className="label">Rank</p>
            <input type="text" id="rank" name="rank" {...register('rank')} />
          </label>
        </div>

        <div className="field">
          <label htmlFor="content">
            <p className="label">Content</p>
            <textarea id="content" name="content" {...register('content')} />
          </label>
        </div>

        <input
          type="submit"
          disabled={loading}
          value={loading ? 'Loading...' : text}
        />
      </form>
    </div>
  );
}

Form.propTypes = {
  noteData: PropTypes.shape({
    id: PropTypes.string,
    categoryKey: PropTypes.string,
    title: PropTypes.string,
    rank: PropTypes.number,
    content: PropTypes.string,
  }),
  text: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
};

Form.defaultProps = {
  noteData: {
    id: '',
    categoryKey: '',
    title: '',
    rank: 0,
    content: '',
  },
};

export default Form;
