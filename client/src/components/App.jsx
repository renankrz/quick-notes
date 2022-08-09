import React from 'react';
import Categories from './Categories';
import NotesAll from './NotesAll';
import NoteOne from './NoteOne';

const containerStyle = {
  'width': '70%',
  'margin': 'auto',
  'display': 'flex',
  'justifyContent': 'space-between',
};

function App() {
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
