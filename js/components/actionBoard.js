import { getState, addAction, updateAction, deleteAction } from "../state.js";

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function priorityClass(priority) {
  return `priority-${priority || "medium"}`;
}

function renderTask(task) {
  const nextAction =
    task.status === "todo"
      ? "Start"
      : task.status === "progress"
        ? "Complete"
        : "Reopen";

  const nextStatus =
    task.status === "todo"
      ? "progress"
      : task.status === "progress"
        ? "done"
        : "todo";

  return `
    <article class="task-card">

      <div class="task-card-top">

        <span class="priority-badge ${priorityClass(task.priority)}">
          ${escapeHTML(task.priority)}
        </span>

        <button
          class="task-delete"
          data-delete-task="${task.id}"
          aria-label="Delete task"
        >
          ×
        </button>

      </div>

      <h3>${escapeHTML(task.title)}</h3>

      <div class="task-meta">
        <span>${formatDate(task.createdAt)}</span>

        <button
          class="task-action"
          data-move-task="${task.id}"
          data-next-status="${nextStatus}"
        >
          ${nextAction}
        </button>
      </div>

    </article>
  `;
}

export function renderActionBoard() {
  const container = document.getElementById("actionBoardContent");

  if (!container) return;

  const { actions } = getState();

  const todo = actions.filter((action) => action.status === "todo");

  const progress = actions.filter((action) => action.status === "progress");

  const done = actions.filter((action) => action.status === "done");

  container.innerHTML = `
    <div class="board-stats">
      <div>
        <strong>${actions.length}</strong>
        <span>Total</span>
      </div>

      <div>
        <strong>${todo.length}</strong>
        <span>To do</span>
      </div>

      <div>
        <strong>${progress.length}</strong>
        <span>In progress</span>
      </div>

      <div>
        <strong>${done.length}</strong>
        <span>Done</span>
      </div>
    </div>

    <div class="board">

      ${renderColumn("todo", "To do", todo)}

      ${renderColumn("progress", "In progress", progress)}

      ${renderColumn("done", "Done", done)}

    </div>
  `;

  bindTaskEvents();
}

function renderColumn(status, title, tasks) {
  return `
    <section class="board-column">

      <div class="column-header">
        <h2>${title}</h2>
        <span>${tasks.length}</span>
      </div>

      <div class="task-list">

        ${
          tasks.length
            ? tasks.map(renderTask).join("")
            : `
              <div class="empty-column">
                No tasks here.
              </div>
            `
        }

      </div>

      <button
        class="add-small-task"
        data-add-status="${status}"
      >
        + Add task
      </button>

    </section>
  `;
}

function bindTaskEvents() {
  document.querySelectorAll("[data-move-task]").forEach((button) => {
    button.addEventListener("click", () => {
      updateAction(button.dataset.moveTask, {
        status: button.dataset.nextStatus,
      });

      renderActionBoard();
    });
  });

  document.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteAction(button.dataset.deleteTask);

      renderActionBoard();
    });
  });

  document.querySelectorAll("[data-add-status]").forEach((button) => {
    button.addEventListener("click", () => {
      openTaskModal(button.dataset.addStatus);
    });
  });
}

function openTaskModal(status = "todo") {
  const modal = document.getElementById("taskModal");
  const statusInput = document.getElementById("taskStatus");

  if (!modal) return;

  if (statusInput) {
    statusInput.value = status;
  }

  modal.hidden = false;

  document.getElementById("taskInput")?.focus();
}

export function setupActionBoard() {
  const newTaskButton = document.getElementById("newTaskButton");

  const closeButton = document.getElementById("closeTaskModal");

  const saveButton = document.getElementById("saveTaskButton");

  const modal = document.getElementById("taskModal");

  if (newTaskButton) {
    newTaskButton.addEventListener("click", () => openTaskModal("todo"));
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeTaskModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeTaskModal();
      }
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveNewTask);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeTaskModal();
    }
  });
}

function closeTaskModal() {
  const modal = document.getElementById("taskModal");

  if (modal) {
    modal.hidden = true;
  }
}

function saveNewTask() {
  const input = document.getElementById("taskInput");

  const priority = document.getElementById("taskPriority");

  const status = document.getElementById("taskStatus");

  if (!input) return;

  const title = input.value.trim();

  if (!title) {
    input.focus();
    return;
  }

  addAction({
    title,
    priority: priority?.value || "medium",
    status: status?.value || "todo",
  });

  input.value = "";

  closeTaskModal();

  renderActionBoard();
}
