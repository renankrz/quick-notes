import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { readRandomNote } from '../api/notes';

function NoteOne({ categoriesKeys }) {
  const [note, setNote] = React.useState([]);

  const { isLoading } = useQuery(
    ['noteOne', categoriesKeys],
    () => readRandomNote(categoriesKeys),
    {
      onSuccess: (data) => {
        setNote(data);
      },
    },
  );

  return isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ textAlign: 'center' }}>Random Note</h1>
      {note
        && (
          <div>
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
          </div>
        )}
    </div>
  );
}

export default NoteOne;
