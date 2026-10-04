import './style/CategoriesTree.css';

import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, ListItemText, Menu, MenuItem } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import PropTypes from 'prop-types';
import React from 'react';

import CustomTreeItem from './CustomTreeItem';

const CategoriesTree = ({
  categories,
  expanded,
  handleExpand,
  handleExpandAllClick,
  selected,
  handleSelect,
  handleSelectAllClick,
  onAddRoot,
  onAddChild,
  onRename,
  onMoveCategory,
  onDeleteCategory,
  onMoveAllNotes,
  onDeleteAllNotes,
}) => {
  const [menu, setMenu] = React.useState(null);

  const openMenu = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6, node });
  };

  const closeMenu = () => setMenu(null);

  const runAction = (action) => {
    const { node } = menu;
    closeMenu();
    action(node);
  };

  const renderTree = (node) => (
    <CustomTreeItem
      key={node.key}
      nodeId={node.key}
      label={
        <Box onContextMenu={(event) => openMenu(event, node)} sx={{ py: 0.25 }}>
          {node.name}
        </Box>
      }
    >
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
      <Button
        startIcon={<AddIcon />}
        onClick={onAddRoot}
        sx={{ mb: 1, width: '100%' }}
      >
        add category
      </Button>
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
      <Menu
        open={menu !== null}
        onClose={closeMenu}
        disableScrollLock
        anchorReference="anchorPosition"
        anchorPosition={
          menu !== null ? { top: menu.mouseY, left: menu.mouseX } : undefined
        }
      >
        <MenuItem onClick={() => runAction(onAddChild)}>
          <ListItemText>Add subcategory</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction(onRename)}>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction(onMoveCategory)}>
          <ListItemText>Move to…</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction(onDeleteCategory)}>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction(onMoveAllNotes)}>
          <ListItemText>Move all notes to…</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction(onDeleteAllNotes)}>
          <ListItemText>Delete all notes</ListItemText>
        </MenuItem>
      </Menu>
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
  onAddRoot: PropTypes.func.isRequired,
  onAddChild: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onMoveCategory: PropTypes.func.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
  onMoveAllNotes: PropTypes.func.isRequired,
  onDeleteAllNotes: PropTypes.func.isRequired,
};

CategoriesTree.defaultProps = {
  categories: [],
};

export default CategoriesTree;
