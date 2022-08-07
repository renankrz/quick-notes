import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import categoriesRead from '../api/categories';

function Categories() {
  const [categories, setCategories] = useState([]);

  const { isLoading } = useQuery(
    ['categories'],
    () => categoriesRead(),
    {
      onSuccess: (data) => {
        setCategories([...data]);
      },
    },
  );

  return isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1>Categories</h1>
      <ul>
        {categories.map((category) => (
          <li key={category._id}>
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;
