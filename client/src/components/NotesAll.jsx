import * as React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { readAllNotes } from '../api/notes';
import Content from './Content';

function NotesAll({ categoriesKeys }) {
  const [notes, setNotes] = React.useState([]);

  const { isLoading } = useQuery(
    ['notesAll', categoriesKeys],
    () => readAllNotes(categoriesKeys),
    {
      onSuccess: (data) => {
        setNotes([...data]);
      },
    },
  );

  return isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ textAlign: 'center' }}>All Notes</h1>
      <ul>
        {notes.map((note) => (
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
