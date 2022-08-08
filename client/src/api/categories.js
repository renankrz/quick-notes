const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/categories`;

export default async function categoriesRead() {
  const response = await fetch(`${API_URL}`);
  return response.json();
}
