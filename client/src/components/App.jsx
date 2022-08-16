import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';
import Categories from './Categories';
import Notes from './Notes';

function App() {
  const [selected, setSelected] = React.useState([]);
  const expandableNodes = React.useRef(null);
  const selectableNodes = React.useRef(null);

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
    <Container>
      <Box mb={4}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Quick Notes
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Grid container spacing={8}>
        <Grid item xs={4}>
          <Box>
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
        </Grid>
        <Grid item xs={8}>
          <Notes
            categoriesKeys={selected}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
