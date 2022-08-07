import React from 'react';
import Categories from './Categories';
import NotesAll from './NotesAll';
import NoteOne from './NoteOne';

function App() {
  return (
    <div>
      <div>
        <Categories />
      </div>
      <div>
        <NotesAll />
      </div>
      <div>
        <NoteOne />
      </div>
    </div>
  );
}

export default App;
