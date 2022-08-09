import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { readAllNotes } from '../api/notes';

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
          <li key={note._id}>
            <p>
              Category key:
              {note.categoryKey}
            </p>
            <p>
              Title:
              {note.title}
            </p>
            <p>
              Rank:
              {note.rank}
            </p>
            <p>
              Data:
              {note.data}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesAll;
