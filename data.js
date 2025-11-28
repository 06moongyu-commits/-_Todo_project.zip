// LocalStorage key
const STORAGE_KEY = "todoList";

/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string | null} [dueDate] ISO datetime string or null
 * @property {string} createdAt ISO datetime string
 * @property {boolean} completed
 */

/**
 * Load todos from LocalStorage
 * @returns {Todo[]}
 */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to load todos:", e);
    return [];
  }
}

/**
 * Save todos to LocalStorage
 * @param {Todo[]} todos
 */
function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error("Failed to save todos:", e);
  }
}

/**
 * Generate a simple unique id
 * @returns {string}
 */
function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

/**
 * Add a new todo
 * @param {Object} payload
 * @param {string} payload.title
 * @param {string} [payload.description]
 * @param {string | null} [payload.dueDate]
 * @returns {Todo[]} updated todos
 */
function addTodo(payload) {
  const todos = loadTodos();
  const now = new Date().toISOString();
  const todo = {
    id: generateId(),
    title: payload.title.trim(),
    description: (payload.description || "").trim(),
    dueDate: payload.dueDate || null,
    createdAt: now,
    completed: false,
  };
  const updated = [todo, ...todos];
  saveTodos(updated);
  return updated;
}

/**
 * Update todo by id
 * @param {string} id
 * @param {Partial<Todo>} updates
 * @returns {Todo[]} updated todos
 */
function updateTodo(id, updates) {
  const todos = loadTodos();
  const updated = todos.map((t) =>
    t.id === id ? { ...t, ...updates } : t
  );
  saveTodos(updated);
  return updated;
}

/**
 * Delete todo by id
 * @param {string} id
 * @returns {Todo[]} updated todos
 */
function deleteTodo(id) {
  const todos = loadTodos();
  const updated = todos.filter((t) => t.id !== id);
  saveTodos(updated);
  return updated;
}


