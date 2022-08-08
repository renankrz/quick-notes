const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`;

export async function noteCreate(note) {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return response.json();
}

export async function readRandomNote() {
  const response = await fetch(`${API_URL}/api/notes/random`);
  return response.json();
}

export async function readRandomNoteFromCategory(categoryKey) {
  const response = await fetch(`${API_URL}/api/notes/${categoryKey}/random`);
  return response.json();
}

export async function readAllNotes() {
  const response = await fetch(`${API_URL}/api/notes`);
  return response.json();
}

export async function readAllNotesFromCategory(categoryKey) {
  const response = await fetch(`${API_URL}/api/notes/${categoryKey}`);
  return response.json();
}

export async function noteUpdate(key, updates) {
  const response = await fetch(`${API_URL}/api/notes/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}

export async function noteDelete(key) {
  const response = await fetch(`${API_URL}/api/notes/${key}`, {
    method: 'DELETE',
  });
  return response.json();
}
