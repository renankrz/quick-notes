import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

function Categories({
  categories, selected, handleSelect, handleSelectAllClick, expandableNodes,
}) {
  const [expanded, setExpanded] = React.useState([]);

  const handleExpand = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleExpandAllClick = () => {
    setExpanded((oldExpanded) => (oldExpanded.length === 0 ? expandableNodes.current : []));
  };

  const renderTree = (node) => (
    <TreeItem
      key={node.key}
      nodeId={node.key}
      label={node.name}
      sx={{
        'user-select': 'none',
      }}
    >
      {
        node.children.length > 0
          ? node.children.map((c) => renderTree(c))
          : null
      }
    </TreeItem>
  );

  return (
    <Box sx={{ height: 370, flexGrow: 1, overflow: 'hidden' }}>
      <Box sx={{ mb: 1 }}>
        <Button onClick={handleExpandAllClick}>
          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button>
        <Button onClick={handleSelectAllClick}>
          {selected.length === 0 ? 'Select all' : 'Unselect all'}
        </Button>
      </Box>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleExpand}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {
          categories.children.map((category) => (
            renderTree(category)
          ))
        }
      </TreeView>
    </Box>
  );
}

Categories.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleSelect: PropTypes.func.isRequired,
  handleSelectAllClick: PropTypes.func.isRequired,
  expandableNodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Categories;
