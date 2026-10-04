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

async function parseError(response, fallback) {
  try {
    const body = await response.json();
    return new Error(body.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function countNotes(categoryKey, includeDescendants = false) {
  const response = await fetch(
    `${API_URL}/count?categoryKey=${categoryKey}&includeDescendants=${includeDescendants}`
  );
  if (!response.ok) {
    throw await parseError(response, 'Error when counting notes.');
  }
  return (await response.json()).count;
}

export async function moveNote({ key, categoryKey }) {
  const response = await fetch(`${API_URL}/${key}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoryKey }),
  });
  if (!response.ok) {
    throw await parseError(response, 'Error when moving note.');
  }
  return response.json();
}

export async function moveAllNotes({
  fromCategoryKey,
  toCategoryKey,
  includeDescendants = false,
}) {
  const response = await fetch(`${API_URL}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromCategoryKey,
      toCategoryKey,
      includeDescendants,
      confirm: true,
    }),
  });
  if (!response.ok) {
    throw await parseError(response, 'Error when moving notes.');
  }
  return (await response.json()).moved;
}

export async function deleteAllNotes({
  categoryKey,
  includeDescendants = false,
}) {
  const response = await fetch(
    `${API_URL}?categoryKey=${categoryKey}&includeDescendants=${includeDescendants}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    }
  );
  if (!response.ok) {
    throw await parseError(response, 'Error when deleting notes.');
  }
  return (await response.json()).deleted;
}
