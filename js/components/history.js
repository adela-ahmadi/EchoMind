import { getState, deleteHistoryItem, clearHistory } from "../state.js";

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

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function renderHistory() {
  const container = document.getElementById("historyContent");

  if (!container) return;

  const { history } = getState();

  if (!history.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◷</div>

        <h2>No analyses yet</h2>

        <p>
          Your completed analyses will appear here.
        </p>

        <button
          class="btn primary"
          data-page="input"
        >
          Start your first analysis
        </button>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="history-list">

      ${history
        .map(
          (item) => `
            <article class="history-card">

              <div class="history-icon">
                ${getModeIcon(item.mode)}
              </div>

              <div class="history-main">

                <div class="history-top">
                  <span class="mode-badge">
                    ${escapeHTML(item.mode)}
                  </span>

                  <span class="history-date">
                    ${formatDate(item.createdAt)}
                  </span>
                </div>

                <h3>
                  ${escapeHTML(item.analysis?.summary || "Untitled analysis")}
                </h3>

                <p>
                  ${
                    item.thought
                      ? escapeHTML(item.thought.slice(0, 180)) +
                        (item.thought.length > 180 ? "..." : "")
                      : "No original thought saved."
                  }
                </p>

              </div>

              <div class="history-actions">

                <button
                  class="text-btn"
                  data-view-history="${item.id}"
                >
                  View
                </button>

                <button
                  class="history-delete"
                  data-delete-history="${item.id}"
                  aria-label="Delete analysis"
                >
                  ×
                </button>

              </div>

            </article>
          `,
        )
        .join("")}

    </div>
  `;

  bindEvents();
}

function getModeIcon(mode) {
  switch (String(mode).toLowerCase()) {
    case "organize":
      return "☷";

    case "decide":
      return "◇";

    default:
      return "◉";
  }
}

function bindEvents() {
  document.querySelectorAll("[data-delete-history]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteHistoryItem(button.dataset.deleteHistory);

      renderHistory();
    });
  });

  document.querySelectorAll("[data-view-history]").forEach((button) => {
    button.addEventListener("click", () => {
      const { history } = getState();

      const item = history.find(
        (entry) => entry.id === button.dataset.viewHistory,
      );

      if (!item) return;

      showHistoryDetails(item);
    });
  });
}

function showHistoryDetails(item) {
  const modal = document.getElementById("taskModal");

  if (!modal) return;

  const card = modal.querySelector(".modal-card");

  if (!card) return;

  card.innerHTML = `
    <button
      class="modal-close"
      id="closeHistoryDetails"
    >
      ×
    </button>

    <span class="eyebrow">
      ${escapeHTML(item.mode)}
    </span>

    <h2>Analysis</h2>

    <p>
      ${escapeHTML(item.analysis?.summary || "No summary available.")}
    </p>

    <div class="modal-section">
      <strong>Insights</strong>

      ${
        item.analysis?.insights?.length
          ? `<ul>
              ${item.analysis.insights
                .map((value) => `<li>${escapeHTML(value)}</li>`)
                .join("")}
             </ul>`
          : "<p>No insights.</p>"
      }
    </div>

    <div class="modal-section">
      <strong>Created</strong>

      <p>${formatDate(item.createdAt)}</p>
    </div>
  `;

  modal.hidden = false;

  document
    .getElementById("closeHistoryDetails")
    ?.addEventListener("click", () => {
      modal.hidden = true;
    });
}

export function setupHistory() {
  const clearButton = document.getElementById("clearHistoryButton");

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      const { history } = getState();

      if (!history.length) return;

      const confirmed = confirm(
        "Are you sure you want to clear your entire history?",
      );

      if (!confirmed) return;

      clearHistory();

      renderHistory();
    });
  }
}
