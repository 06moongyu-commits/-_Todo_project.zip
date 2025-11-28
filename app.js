// Global todos in memory
let todos = [];

// For notification (optional extension)
let notifiedIds = new Set();

function init() {
  todos = loadTodos();
  const form = document.getElementById("todo-form");
  const filterButtons = document.querySelectorAll(".filters .chip");
  const sortSelect = document.getElementById("sort-select");
  const listEl = document.getElementById("todo-list");

  // 초기 렌더
  renderList(todos);
  updateFilterButtons();

  // 폼 제출: 새 할 일 추가
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleInput = document.getElementById("title");
      const descInput = document.getElementById("description");
      const dueInput = document.getElementById("dueDate");
      if (!titleInput) return;

      const title = titleInput.value.trim();
      if (!title) {
        alert("제목을 입력하세요.");
        titleInput.focus();
        return;
      }

      const description = descInput ? descInput.value : "";
      const dueRaw = dueInput ? dueInput.value : "";
      const dueDate = dueRaw ? new Date(dueRaw).toISOString() : null;

      todos = addTodo({ title, description, dueDate });
      renderList(todos);

      // 확인 알림
      alert("할 일이 추가되었습니다.");

      form.reset();
      titleInput.focus();
    });
  }

  // 필터 버튼 클릭
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-filter");
      if (!value) return;
      currentFilter = value;
      updateFilterButtons();
      renderList(todos);
    });
  });

  // 정렬 변경
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value;
      renderList(todos);
    });
  }

  // 목록 내 이벤트 위임 (완료 체크, 수정, 삭제)
  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const itemEl = target.closest(".todo-item");
      if (!itemEl) return;
      const id = itemEl.dataset.id;
      if (!id) return;

      // 삭제
      if (target.classList.contains("delete")) {
        const ok = confirm("정말 삭제하시겠습니까?");
        if (!ok) return;
        todos = deleteTodo(id);
        renderList(todos);
        return;
      }

      // 수정
      if (target.classList.contains("edit")) {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;
        const newTitle = prompt("새 제목을 입력하세요.", todo.title);
        if (newTitle === null) return; // 취소
        const trimmed = newTitle.trim();
        if (!trimmed) {
          alert("제목은 비울 수 없습니다.");
          return;
        }
        const newDesc = prompt(
          "새 설명을 입력하세요. (비워두면 공백)",
          todo.description || ""
        );
        const updates = {
          title: trimmed,
          description: newDesc !== null ? newDesc : todo.description,
        };
        todos = updateTodo(id, updates);
        renderList(todos);
        return;
      }
    });

    // 체크박스 변경 (완료 상태 토글)
    listEl.addEventListener("change", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.classList.contains("todo-checkbox")) return;

      const itemEl = target.closest(".todo-item");
      if (!itemEl) return;
      const id = itemEl.dataset.id;
      if (!id) return;

      todos = updateTodo(id, { completed: target.checked });
      renderList(todos);
    });
  }

  // 마감 알림(옵션) 체크 시작
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  setInterval(checkDueDatesAndNotify, 60 * 1000);
}

/**
 * Check due dates and send notifications / alerts
 */
function checkDueDatesAndNotify() {
  const now = Date.now();
  todos.forEach((todo) => {
    if (!todo.dueDate || todo.completed) return;
    if (notifiedIds.has(todo.id)) return;
    const time = new Date(todo.dueDate).getTime();
    if (Number.isNaN(time)) return;

    if (time <= now) {
      notifiedIds.add(todo.id);
      const message = `마감 시간 지남: ${todo.title}`;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Todo 알림", { body: message });
      } else {
        alert(message);
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", init);


