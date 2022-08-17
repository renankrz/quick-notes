import * as React from 'react';
import { Box, Container, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';
import Categories from './Categories';
import Header from './Header';
import Notes from './Notes';

function App() {
  const [selected, setSelected] = React.useState([]);
  const expandableNodes = React.useRef([]);
  const selectableNodes = React.useRef([]);

  const query = useQuery(['categories'], readCategoriesRich, {
    onSuccess: (data) => {
      // Keys of nodes that have children
      expandableNodes.current = [...new Set(data.edges.map((e) => e.from))];
      // Keys of all nodes
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
    <Container maxWidth="xl">
      <Header />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ minWidth: '280px', minHeight: '80vh' }}>
          {query.isSuccess && (
            <Categories
              categories={query.data.categories}
              selected={selected}
              handleSelect={handleSelect}
              handleSelectAllClick={handleSelectAllClick}
              expandableNodes={expandableNodes.current}
            />
          )}
        </Box>
        <Box sx={{
          display: 'flex', justifyContent: 'space-around', minWidth: '100px',
        }}
        >
          <Divider orientation="vertical" />
        </Box>
        <Box width="100%">
          <Notes
            categoriesKeys={selected}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
