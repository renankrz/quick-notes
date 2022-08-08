import React from 'react';
import Categories from './Categories';
import NotesAll from './NotesAll';
import NoteOne from './NoteOne';

function App() {
  const containerStyle = {
    'width': '70%',
    'margin': 'auto',
    'display': 'flex',
    'justifyContent': 'space-between',
  };

  return (
    <div style={containerStyle}>
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
