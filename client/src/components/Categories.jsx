import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { readCategoriesRich } from '../api/categories';

const renderTree = (node) => (
  <ul key={node._id}>
    <li key={node._id}>
      {node.name}
      {node.children.length > 0
        ? node.children.map((c) => renderTree(c))
        : null}
    </li>
  </ul>
);

function Categories() {
  const query = useQuery(['categories'], readCategoriesRich);

  return query.isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ 'textAlign': 'center' }}>Categories</h1>
      {renderTree(query.data)}
    </div>
  );
}

export default Categories;
