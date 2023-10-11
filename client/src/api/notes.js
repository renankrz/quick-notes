const API_URL = `${import.meta.env.VITE_API_HOST}:${
  import.meta.env.VITE_API_PORT
}/api/notes`;

export async function createNote(data) {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error when creating note.');
  }
  return response.json();
}

export async function deleteNote(key) {
  const response = await fetch(`${API_URL}/${key}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error when deleting note.');
  }
  return response.json();
}

export async function getAllNotes(categoriesKeys) {
  const response = await fetch(
    `${API_URL}?categories=${categoriesKeys.join(',')}`
  );
  if (!response.ok) {
    throw new Error('Error when getting all notes.');
  }
  return response.json();
}

export async function updateNote({ key, data }) {
  const response = await fetch(`${API_URL}/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error when updating note.');
  }
  return response.json();
}
