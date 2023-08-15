const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/categories`;

export async function readCategories() {
  const response = await fetch(`${API_URL}`);
  return response.json();
}

export async function readCategoriesRich() {
  const response = await fetch(`${API_URL}/rich`);
  return response.json();
}

export async function readRoot() {
  const response = await fetch(`${API_URL}/root`);
  return response.json();
}
