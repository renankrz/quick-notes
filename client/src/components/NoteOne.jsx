import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notesRead } from '../api/notes';

function NoteOne() {
  const [note, setNote] = useState([]);

  const category = 'cat1';
  const isRandom = true;

  const { isLoading } = useQuery(
    ['noteOne', category, isRandom],
    () => notesRead(category, isRandom),
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
      <h1>Random Note</h1>
      {note
        && (
          <p>
            {note.category}
            {' '}
            {note.title}
            {' '}
            {note.rank}
            {' '}
            {note.markdown}
          </p>
        )}
    </div>
  );
}

export default NoteOne;
