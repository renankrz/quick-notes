const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`;

export default async function categoriesRead() {
  const response = await fetch(`${API_URL}/api/categories`);
  return response.json();
}
