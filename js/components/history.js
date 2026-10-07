import { getState, deleteHistoryItem, clearHistory } from "../state.js";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
export function renderHistory(root) {
  const { history } = getState();
  root.innerHTML = `<div class="workspace-header"><div><span class="eyebrow">YOUR HISTORY</span><h2>Previous analyses</h2><p class="muted">Revisit the thoughts you have already explored.</p></div>${history.length ? '<button class="secondary-btn" id="clearHistory">Clear history</button>' : ""}</div><div class="history-controls"><div class="search-box"><span>⌕</span><input id="historySearch" placeholder="Search your analyses..."></div><select id="historyFilter"><option value="all">All modes</option><option value="understand">Understand</option><option value="organize">Organize</option><option value="decide">Decide</option></select></div><div class="history-list" id="historyList"></div><div class="empty-state" id="emptyHistory" hidden><h4>No analyses yet</h4><p>Your previous AI analyses will appear here.</p></div>`;
  const list = root.querySelector("#historyList"),
    empty = root.querySelector("#emptyHistory");
  function draw() {
    const q = root.querySelector("#historySearch").value.toLowerCase();
    const mode = root.querySelector("#historyFilter").value;
    const items = history.filter((item) => {
      const a = item.analysis || {};
      return (
        (mode === "all" || a.mode === mode) &&
        `${a.title} ${a.summary}`.toLowerCase().includes(q)
      );
    });
    list.innerHTML = items
      .map((item) => {
        const a = item.analysis;
        return `<article class="history-item"><div><span class="eyebrow">${esc(a.mode)} · ${new Date(item.createdAt).toLocaleString()}</span><h4>${esc(a.title)}</h4><p>${esc(a.summary)}</p></div><div class="history-item-actions"><button class="text-btn" data-open="${item.id}">View</button><button class="text-btn" data-delete="${item.id}">Delete</button></div></article>`;
      })
      .join("");
    empty.hidden = items.length > 0;
    list
      .querySelectorAll("[data-open]")
      .forEach((b) => (b.onclick = () => openHistory(b.dataset.open)));
    list.querySelectorAll("[data-delete]").forEach(
      (b) =>
        (b.onclick = () => {
          deleteHistoryItem(b.dataset.delete);
          renderHistory(root);
        }),
    );
  }
  draw();
  root.querySelector("#historySearch").oninput = draw;
  root.querySelector("#historyFilter").onchange = draw;
  root.querySelector("#clearHistory")?.addEventListener("click", () => {
    if (confirm("Clear all analysis history?")) {
      clearHistory();
      renderHistory(root);
    }
  });
}
function openHistory(id) {
  const item = getState().history.find((x) => x.id === id);
  if (!item) return;
  const a = item.analysis;
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `<div class="modal analysis-modal"><button class="modal-close">×</button><span class="eyebrow">${esc(a.mode)} ANALYSIS</span><h3>${esc(a.title)}</h3><div class="analysis-content"><div><span>Summary</span><p>${esc(a.summary)}</p></div><div><span>Key Insight</span><p>${esc(a.insight)}</p></div><div><span>Actions</span><p>${(a.actions || []).map((x) => `• ${esc(x.title)}`).join("<br>") || "None"}</p></div></div></div>`;
  document.body.append(modal);
  modal.querySelector(".modal-close").onclick = () => modal.remove();
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}
