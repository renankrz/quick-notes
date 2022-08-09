import * as React from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';

const renderTree = (node) => (
  <TreeItem key={node._key} nodeId={node._key} label={node.name}>
    {node.children.length > 0
      ? node.children.map((c) => renderTree(c))
      : null}
  </TreeItem>
);

function Categories() {
  const query = useQuery(['categories'], readCategoriesRich);

  return query.isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ 'textAlign': 'center' }}>Categories</h1>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ height: 310, flexGrow: 1 }}
      >
        {renderTree(query.data)}
      </TreeView>
    </div>
  );
}

export default Categories;
