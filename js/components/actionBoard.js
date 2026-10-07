import { getState, addAction, updateAction, deleteAction } from "../state.js";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
let filter = "all";
function taskCard(t) {
  const next =
    t.status === "todo" ? "progress" : t.status === "progress" ? "done" : null;
  return `<article class="task"><div class="task-title">${esc(t.title)}</div><div class="task-meta"> <span class="badge ${esc(t.priority)}">${esc(t.priority)}</span><div class="task-actions">${next ? `<button data-move="${t.id}">→ ${next}</button>` : ""}${t.status !== "todo" ? `<button data-back="${t.id}">←</button>` : ""}<button data-delete="${t.id}">Delete</button></div></div></article>`;
}
export function renderActionBoard(root) {
  const s = getState(),
    actions = s.actions || [];
  const counts = {
    todo: actions.filter((x) => x.status === "todo").length,
    progress: actions.filter((x) => x.status === "progress").length,
    done: actions.filter((x) => x.status === "done").length,
  };
  const total = actions.length,
    rate = total ? Math.round((counts.done / total) * 100) : 0;
  root.innerHTML = `<div class="workspace-header"><div><span class="eyebrow">ACTION BOARD</span><h2>Your tasks</h2><p class="muted">Move useful ideas from thought to action.</p></div><button class="primary-btn" id="newTask">＋ New Task</button></div><div class="workspace-stats"><div class="stat-card"><span>Total Tasks</span><strong>${total}</strong></div><div class="stat-card"><span>In Progress</span><strong>${counts.progress}</strong></div><div class="stat-card"><span>Completed</span><strong>${counts.done}</strong></div><div class="stat-card"><span>Completion</span><strong>${rate}%</strong></div></div><div class="board-tools" style="margin-bottom:10px">${["all", "todo", "progress", "done"].map((x) => `<button class="filter-btn ${filter === x ? "active" : ""}" data-filter="${x}">${x === "todo" ? "To Do" : x === "progress" ? "In Progress" : x === "done" ? "Done" : "All"}</button>`).join("")}</div><div class="board">${[
    "todo",
    "progress",
    "done",
  ]
    .map(
      (status) =>
        `<div class="board-column"><div class="column-title"><div class="column-name"><span class="status-dot ${status}-dot"></span><h4>${status === "todo" ? "To Do" : status === "progress" ? "In Progress" : "Done"}</h4></div><span class="count">${counts[status]}</span></div><div class="task-list">${
          actions
            .filter(
              (x) =>
                (filter === "all" || x.status === filter) &&
                x.status === status,
            )
            .map(taskCard)
            .join("") || `<div class="empty-block">No tasks here.</div>`
        }</div><button class="add-small-task" data-add="${status}">＋ Add task</button></div>`,
    )
    .join(
      "",
    )}</div><div class="progress-card"><div class="progress-top"><div><span class="eyebrow">YOUR PROGRESS</span><h3>${rate === 100 ? "All tasks completed" : "Keep going"}</h3></div><strong>${rate}%</strong></div><div class="progress-track"><div class="progress-bar" style="width:${rate}%"></div></div><p>${rate ? `${counts.done} of ${total} tasks completed.` : "Start completing tasks to see your progress."}</p></div>`;
  root.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        renderActionBoard(root);
      }),
  );
  root.querySelector("#newTask").onclick = () => openTaskModal();
  root
    .querySelectorAll("[data-add]")
    .forEach((b) => (b.onclick = () => openTaskModal(b.dataset.add)));
  root.querySelectorAll("[data-move]").forEach(
    (b) =>
      (b.onclick = () => {
        updateAction(b.dataset.move, {
          status: b.textContent.includes("progress") ? "progress" : "done",
        });
        renderActionBoard(root);
      }),
  );
  root.querySelectorAll("[data-back]").forEach(
    (b) =>
      (b.onclick = () => {
        const t = actions.find((x) => x.id === b.dataset.back);
        updateAction(t.id, {
          status: t.status === "done" ? "progress" : "todo",
        });
        renderActionBoard(root);
      }),
  );
  root.querySelectorAll("[data-delete]").forEach(
    (b) =>
      (b.onclick = () => {
        deleteAction(b.dataset.delete);
        renderActionBoard(root);
      }),
  );
}
function openTaskModal(defaultStatus = "todo") {
  const title = prompt("Task title");
  if (!title?.trim()) return;
  const priority = (
    prompt("Priority: low, medium, or high", "medium") || "medium"
  ).toLowerCase();
  const safe = ["low", "medium", "high"].includes(priority)
    ? priority
    : "medium";
  addAction({ title: title.trim(), priority: safe, status: defaultStatus });
  window.dispatchEvent(new CustomEvent("echomind:state-changed"));
}
export function seedActionsFromAnalysis() {
  const { analysis, actions } = getState();
  if (!analysis || actions.length) return;
  for (const x of analysis.actions || [])
    addAction({ title: x.title, priority: x.priority, status: "todo" });
}
