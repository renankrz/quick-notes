import './style/CategoriesTree.css';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import PropTypes from 'prop-types';

import CustomTreeItem from './CustomTreeItem';

const CategoriesTree = ({
  categories,
  expanded,
  handleExpand,
  handleExpandAllClick,
  selected,
  handleSelect,
  handleSelectAllClick,
}) => {
  const renderTree = (node) => (
    <CustomTreeItem key={node.key} nodeId={node.key} label={node.name}>
      {node.children.length > 0
        ? node.children.map((c) => renderTree(c))
        : null}
    </CustomTreeItem>
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
        {categories.map((category) => renderTree(category))}
      </TreeView>
    </Box>
  );
};

const treeShape = {
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

treeShape.children = PropTypes.arrayOf(PropTypes.shape(treeShape));

CategoriesTree.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape(treeShape)),
  expanded: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleExpand: PropTypes.func.isRequired,
  handleExpandAllClick: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  handleSelectAllClick: PropTypes.func.isRequired,
};

export default CategoriesTree;
