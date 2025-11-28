// UI state
let currentFilter = "all"; // all | completed | incomplete
let currentSort = "createdAt-asc";

/**
 * Apply filter based on completion status
 * @param {Todo[]} todos
 * @returns {Todo[]}
 */
function applyFilter(todos) {
  if (currentFilter === "completed") {
    return todos.filter((t) => t.completed);
  }
  if (currentFilter === "incomplete") {
    return todos.filter((t) => !t.completed);
  }
  return todos;
}

/**
 * Apply sort based on currentSort
 * @param {Todo[]} todos
 * @returns {Todo[]}
 */
function applySort(todos) {
  const [field, direction] = currentSort.split("-");
  const factor = direction === "desc" ? -1 : 1;

  return [...todos].sort((a, b) => {
    if (field === "title") {
      return a.title.localeCompare(b.title, "ko") * factor;
    }

    if (field === "dueDate") {
      const aHas = !!a.dueDate;
      const bHas = !!b.dueDate;
      if (!aHas && !bHas) return 0;
      if (!aHas) return 1; // dueDate 없는 항목은 뒤로
      if (!bHas) return -1;
      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      return (aTime - bTime) * factor;
    }

    // default: createdAt
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return (aTime - bTime) * factor;
  });
}

/**
 * Render todo list to DOM
 * @param {Todo[]} todos
 */
function renderList(todos) {
  const listEl = document.getElementById("todo-list");
  const emptyStateEl = document.getElementById("empty-state");
  if (!listEl || !emptyStateEl) return;

  const filtered = applyFilter(todos);
  const sorted = applySort(filtered);

  listEl.innerHTML = "";

  if (sorted.length === 0) {
    emptyStateEl.style.display = "block";
    return;
  }

  emptyStateEl.style.display = "none";

  const now = Date.now();

  sorted.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const isOverdue =
      todo.dueDate && !todo.completed
        ? new Date(todo.dueDate).getTime() < now
        : false;

    if (todo.completed) {
      li.classList.add("todo-completed");
    }
    if (isOverdue) {
      li.classList.add("todo-overdue");
    }

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${
        todo.completed ? "checked" : ""
      } />
      <div class="todo-content">
        <div class="todo-title-row">
          <div class="todo-title">${escapeHtml(todo.title)}</div>
        </div>
        ${
          todo.description
            ? `<div class="todo-description">${escapeHtml(
                todo.description
              )}</div>`
            : ""
        }
        <div class="todo-meta">
          <div class="todo-tags">
            ${
              todo.dueDate
                ? `<span class="todo-tag">${
                    isOverdue ? "마감 지남" : "마감 예정"
                  } · ${formatDateTime(todo.dueDate)}</span>`
                : ""
            }
          </div>
          <span class="todo-created">생성: ${formatDateTime(
            todo.createdAt
          )}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-icon edit" title="수정">✏️</button>
        <button class="btn-icon delete" title="삭제">🗑</button>
      </div>
    `;

    listEl.appendChild(li);
  });
}

/**
 * Update filter button UI
 */
function updateFilterButtons() {
  const buttons = document.querySelectorAll(".filters .chip");
  buttons.forEach((btn) => {
    const value = btn.getAttribute("data-filter");
    if (value === currentFilter) {
      btn.classList.add("chip-active");
    } else {
      btn.classList.remove("chip-active");
    }
  });
}

/**
 * Escape HTML text
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format ISO datetime string to readable text
 * @param {string} isoString
 * @returns {string}
 */
function formatDateTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}


