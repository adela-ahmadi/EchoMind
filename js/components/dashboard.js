import { getState, addAction } from "../state.js";

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p class="empty-text">Nothing identified.</p>`;
  }

  return `
    <ul class="analysis-list">
      ${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
    </ul>
  `;
}

export function renderDashboard() {
  const container = document.getElementById("dashboardContent");

  if (!container) return;

  const { analysis } = getState();

  if (!analysis) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No analysis yet</h2>
        <p>Start a new analysis to see your results.</p>
        <button class="btn primary" data-page="input">
          Start analysis
        </button>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <section class="analysis-summary">
      <div>
        <span class="eyebrow">
          ${escapeHTML(analysis.mode || "UNDERSTAND")}
        </span>

        <h2>AI Insight</h2>

        <p>
          ${escapeHTML(analysis.summary || "No summary available.")}
        </p>
      </div>
    </section>

    <section class="analysis-grid">

      <article class="analysis-card">
        <h3>Topics</h3>
        ${renderList(analysis.topics)}
      </article>

      <article class="analysis-card">
        <h3>Priorities</h3>
        ${renderList(analysis.priorities)}
      </article>

      <article class="analysis-card">
        <h3>Actions</h3>
        ${renderList(analysis.actions)}

        ${
          analysis.actions?.length
            ? `
              <button
                class="btn small-btn primary"
                id="addAiActions"
              >
                Add actions to board
              </button>
            `
            : ""
        }
      </article>

      <article class="analysis-card">
        <h3>Risks</h3>
        ${renderList(analysis.risks)}
      </article>

      <article class="analysis-card">
        <h3>Decisions</h3>
        ${renderList(analysis.decisions)}
      </article>

      <article class="analysis-card">
        <h3>Insights</h3>
        ${renderList(analysis.insights)}
      </article>

    </section>
  `;

  const addButton = document.getElementById("addAiActions");

  if (addButton) {
    addButton.addEventListener("click", () => {
      const currentState = getState();

      currentState.analysis.actions.forEach((title) => {
        addAction({
          title,
          priority: "medium",
          status: "todo",
        });
      });

      addButton.textContent = "Added to Action Board";
      addButton.disabled = true;
    });
  }
}
