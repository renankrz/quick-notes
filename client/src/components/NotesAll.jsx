import * as React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { readAllNotes } from '../api/notes';
import Content from './Content';

function NotesAll({ categoriesKeys }) {
  const query = useQuery(
    ['notesAll', categoriesKeys],
    () => readAllNotes(categoriesKeys),
  );

  return query.isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ textAlign: 'center' }}>All Notes</h1>
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

NotesAll.propTypes = {
  categoriesKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default NotesAll;
