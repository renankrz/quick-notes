import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notesRead } from '../api/notes';

function NotesAll() {
  const [notes, setNotes] = useState([]);

  const category = 'All';
  const isRandom = false;

  const { isLoading } = useQuery(
    ['notesAll', category, isRandom],
    () => notesRead(category, isRandom),
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
      <h1>All Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            {note.category}
            {' '}
            {note.title}
            {' '}
            {note.rank}
            {' '}
            {note.markdown}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesAll;
