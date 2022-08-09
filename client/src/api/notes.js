const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/notes`;

export async function createNote(note) {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return response.json();
}

function buildQueryString(categoriesKeys) {
  const queryArray = categoriesKeys.map((c) => `cat=${c}`);
  return `?${queryArray.join('&')}`;
}

export async function readAllNotes(categoriesKeys) {
  const queryString = buildQueryString(categoriesKeys);
  const response = await fetch(`${API_URL}${queryString}`);
  return response.json();
}

export async function readRandomNote(categoriesKeys) {
  const queryString = buildQueryString(categoriesKeys);
  const response = await fetch(`${API_URL}/random${queryString}`);
  return response.json();
}

export async function updateNote(key, updates) {
  const response = await fetch(`${API_URL}/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}

export async function deleteNote(key) {
  const response = await fetch(`${API_URL}/${key}`, {
    method: 'DELETE',
  });
  return response.json();
}
