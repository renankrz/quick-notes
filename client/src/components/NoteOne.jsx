import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { readRandomNoteFromCategory } from '../api/notes';

function NoteOne() {
  const [note, setNote] = useState([]);

  const categoryKey = '2572444'; // Machine Learning

  const { isLoading } = useQuery(
    ['noteOne', categoryKey],
    () => readRandomNoteFromCategory(categoryKey),
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
      <h1 style={{ 'textAlign': 'center' }}>Random Note From Cat.</h1>
      {note
        && (
          <div>
            <p>Category key: {note.categoryKey}</p>
            <p>Title: {note.title}</p>
            <p>Rank: {note.rank}</p>
            <p>Data: {note.data}</p>
          </div>
        )}
    </div>
  );
}

export default NoteOne;
