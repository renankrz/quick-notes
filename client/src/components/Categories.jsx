import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';

function Categories() {
  const [expanded, setExpanded] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const expandableNodes = React.useRef(null);
  const selectableNodes = React.useRef(null);

  const query = useQuery(['categories'], readCategoriesRich, {
    onSuccess: (data) => {
      // Nodes that have children
      expandableNodes.current = [...new Set(data.edges.map((e) => e.from))];
      // All nodes
      selectableNodes.current = data.vertices.map((v) => v.key );
    },
  });

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) =>
      oldExpanded.length === 0 ? expandableNodes.current : [],
    );
  };

  const handleSelectClick = () => {
    setSelected((oldSelected) =>
      oldSelected.length === 0 ? selectableNodes.current : [],
    );
  };

  const renderTree = (node) => (
    <TreeItem key={node.key} nodeId={node.key} label={node.name}>
      {node.children.length > 0
        ? node.children.map((c) => renderTree(c))
        : null}
    </TreeItem>
  );

  return query.isLoading ? (
    <h1>Loading</h1>
  ) : (
    <Box sx={{ height: 370, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}>
      <Box sx={{ mb: 1 }}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button>
        <Button onClick={handleSelectClick}>
          {selected.length === 0 ? 'Select all' : 'Unselect all'}
        </Button>
      </Box>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {renderTree(query.data.categories)}
      </TreeView>
    </Box>
  );
}

export default Categories;
