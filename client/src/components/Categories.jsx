import * as React from 'react';
import PropTypes from 'prop-types';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TreeView } from '@mui/lab';
import { Box, Button } from '@mui/material';
import StyledTreeItem from './StyledTreeItem';

function Categories({
  categories, expanded, handleExpand, handleExpandAllClick, selected, handleSelect, handleSelectAllClick, 
}) {
  const renderTree = (node) => (
    <StyledTreeItem
      key={node.key}
      nodeId={node.key}
      labelText={node.name}
    >
      {
        node.children.length > 0
          ? node.children.map((c) => renderTree(c))
          : null
      }
    </StyledTreeItem>
  );

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box sx={{ mb: 1, display: 'flex' }}>
        <Button onClick={handleExpandAllClick} sx={{ width: '50%' }}>
          {expanded.length === 0 ? 'expand all' : 'collapse all'}
        </Button>
        <Button onClick={handleSelectAllClick} sx={{ width: '50%' }}>
          {selected.length === 0 ? 'select all' : 'unselect all'}
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
  categories: PropTypes.object.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleExpand: PropTypes.func.isRequired,
  handleExpandAllClick: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  handleSelectAllClick: PropTypes.func.isRequired,
};

export default Categories;
