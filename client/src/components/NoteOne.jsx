import * as React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { readRandomNote } from '../api/notes';
import Content from './Content';

function NoteOne({ categoriesKeys }) {
  const query = useQuery(
    ['noteOne', categoriesKeys],
    () => readRandomNote(categoriesKeys),
  );

  return query.isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ textAlign: 'center' }}>Random Note</h1>
      <ul>
        {query.data.map((note) => (
          <li key={note.key}>
            <Content content={note.data} />
          </li>
        ))}
      </ul>
    </div>
  );
}

NoteOne.propTypes = {
  categoriesKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default NoteOne;
