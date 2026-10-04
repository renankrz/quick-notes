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

const parseError = async (response, fallback) => {
  try {
    const body = await response.json();
    return new Error(body.error || fallback);
  } catch {
    return new Error(fallback);
  }
};

export const createCategory = async ({ name, parentKey = null }) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentKey }),
  });
  if (!response.ok) {
    throw await parseError(response, 'Error when creating category.');
  }
  return response.json();
};

export const renameCategory = async ({ key, name }) => {
  const response = await fetch(`${API_URL}/categories/${key}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw await parseError(response, 'Error when renaming category.');
  }
  return response.json();
};

export const moveCategory = async ({ key, newParentKey = null }) => {
  const response = await fetch(`${API_URL}/categories/${key}/parent`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newParentKey }),
  });
  if (!response.ok) {
    throw await parseError(response, 'Error when moving category.');
  }
  return response.json();
};

export const deleteCategory = async (key) => {
  const response = await fetch(`${API_URL}/categories/${key}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw await parseError(response, 'Error when deleting category.');
  }
  return response.json();
};
