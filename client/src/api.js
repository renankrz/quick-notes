const API_URL = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

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

async function readRandomNoteFromGroup(group) {
  const response = await fetch(`${API_URL}/api/notes/${group}/random`);
  return response.json();
}

async function readAllNotes() {
  const response = await fetch(`${API_URL}/api/notes`);
  return response.json();
}

async function readAllNotesFromGroup(group) {
  const response = await fetch(`${API_URL}/api/notes/${group}`);
  return response.json();
}

/*
 * Unified read function.
 */
export async function noteRead(group, isRandom) {
  if (group === 'All') {
    if (isRandom) {
      const response = await readRandomNote();
      return response;
    }
    const response = await readAllNotes();
    return response;
  }
  if (isRandom) {
    const response = await readRandomNoteFromGroup(group);
    return response;
  }
  const response = await readAllNotesFromGroup(group);
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

export async function groupRead() {
  const response = await fetch(`${API_URL}/api/notes/groups`);
  return response.json();
}
