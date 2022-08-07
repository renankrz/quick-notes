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

async function readRandomNote() {
  const response = await fetch(`${API_URL}/api/notes/random`);
  return response.json();
}

async function readRandomNoteFromCategory(category) {
  const response = await fetch(`${API_URL}/api/notes/${category}/random`);
  return response.json();
}

async function readAllNotes() {
  const response = await fetch(`${API_URL}/api/notes`);
  return response.json();
}

async function readAllNotesFromCategory(category) {
  const response = await fetch(`${API_URL}/api/notes/${category}`);
  return response.json();
}

/*
 * Unified read function.
 */
export async function notesRead(category, isRandom) {
  if (category === 'All') {
    if (isRandom) {
      const response = await readRandomNote();
      return response;
    }
    const response = await readAllNotes();
    return response;
  }
  if (isRandom) {
    const response = await readRandomNoteFromCategory(category);
    return response;
  }
  const response = await readAllNotesFromCategory(category);
  return response;
}

export async function noteUpdate(id, updates) {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}

export async function noteDelete(id) {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
