const API_URL = `${import.meta.env.VITE_API_HOST}:${
  import.meta.env.VITE_API_PORT
}/api/categories-tree`;

export const getCategoriesTree = async () => {
  let response = await fetch(`${API_URL}`);
  if (!response.ok) {
    throw new Error('Error when getting categories tree.');
  }
  response = (await response.json())[0].children;
  return response;
};

export const getExpandableCategories = async () => {
  const response = await fetch(`${API_URL}/categories?expandable=true`);
  if (!response.ok) {
    throw new Error('Error when getting expandable categories.');
  }
  return response.json();
};

export const getFlattenedCategoriesPaths = async () => {
  const response = await fetch(`${API_URL}/paths?flattened=true`);
  if (!response.ok) {
    throw new Error('Error when getting flattened categories paths.');
  }
  return response.json();
};

export const getSelectableCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error('Error when getting selectable categories.');
  }
  return response.json();
};
