/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import './Form.css';

const Form = ({ noteData, text, submit }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: noteData,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onClickSubmit = (data) => {
    try {
      setLoading(true);
      if (noteData.id === '') {
        // creating
        submit(data);
      } else {
        // updating
        submit(noteData.id, data);
      }
      submit(noteData.id, data);
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
          <label htmlFor="group">
            <p className="label">Group</p>
            <input type="text" id="group" name="group" {...register('group')} />
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
            <input type="text" id="title" name="title" {...register('rank')} />
          </label>
        </div>

        <div className="field">
          <label htmlFor="markdown">
            <p className="label">Markdown</p>
            <textarea id="markdown" name="markdown" {...register('markdown')} />
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
};

Form.propTypes = {
  noteData: PropTypes.shape({
    id: PropTypes.string,
    group: PropTypes.string,
    title: PropTypes.string,
    rank: PropTypes.number,
    markdown: PropTypes.string,
  }),
  text: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
};

Form.defaultProps = {
  noteData: {
    id: '',
    group: '',
    title: '',
    rank: 0,
    markdown: '',
  },
};

export default Form;
