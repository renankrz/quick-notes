import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import Categories from './Categories';
import NotesAll from './NotesAll';
import NoteOne from './NoteOne';
import { readCategoriesRich } from '../api/categories';

const containerStyle = {
  width: '90%',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
};

const partStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid grey',
};

function App() {
  const [selected, setSelected] = React.useState([]);
  const expandableNodes = React.useRef(null);
  const selectableNodes = React.useRef(null);

  const query = useQuery(['categories'], readCategoriesRich, {
    onSuccess: (data) => {
      // Nodes that have children
      expandableNodes.current = [...new Set(data.edges.map((e) => e.from))];
      // All nodes
      selectableNodes.current = data.vertices.map((v) => v.key);
    },
  });

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

  const handleSelectAllClick = () => {
    setSelected((oldSelected) => (oldSelected.length === 0 ? selectableNodes.current : []));
  };

  return (
    <div style={containerStyle}>
      <div style={partStyle}>
        {query.isLoading ? (
          <h1>Loading</h1>
        ) : (
          <Categories
            categories={query.data.categories}
            selected={selected}
            handleSelect={handleSelect}
            handleSelectAllClick={handleSelectAllClick}
            expandableNodes={expandableNodes}
          />
        )}
      </div>
      <div style={partStyle}>
        <NotesAll
          categoriesKeys={selected}
        />
      </div>
      <div style={partStyle}>
        <NoteOne
          categoriesKeys={selected}
        />
      </div>
    </div>
  );
}

export default App;
