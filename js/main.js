import { analyzeThought, hasApiKey } from "./api.js";

import {
  getState,
  setAnalysis,
  addActions,
  addAction,
  updateAction,
  deleteAction,
  deleteHistory,
  clearHistory,
} from "./state.js";

const pages = ["landing", "input", "dashboard", "actions", "history"];

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [...document.querySelectorAll(selector)];

function pageEl(name) {
  return document.getElementById(`${name}Page`);
}

function route(name) {
  const nextPage = pages.includes(name) ? name : "landing";

  pages.forEach((page) => {
    const element = pageEl(page);

    if (element) {
      element.hidden = page !== nextPage;
    }
  });

  closeWorkspaceSidebar();

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });

  if (nextPage === "dashboard") {
    renderDashboard();
  }

  if (nextPage === "actions") {
    renderBoard();
  }

  if (nextPage === "history") {
    renderHistory();
  }

  if (nextPage === "input") {
    setTimeout(() => {
      $("#thoughtInput")?.focus();
    }, 50);
  }

  history.replaceState(null, "", `#${nextPage}`);
}

function toast(message) {
  const element = $("#toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.__echoMindToast);

  window.__echoMindToast = setTimeout(() => {
    element.classList.remove("show");
  }, 3200);
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[match],
  );
}

function modeLabel(mode = "understand") {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function priorityClass(priority) {
  return `priority ${priority || "medium"}`;
}

function list(items, empty = "Nothing identified.") {
  if (!items?.length) {
    return `<p class="empty-inline">${escapeHtml(empty)}</p>`;
  }

  return `
    <div class="list">
      ${items
        .map((item) => {
          const text =
            typeof item === "string" ? item : item?.title || item?.name || "";

          return `
            <div class="list-item">
              <span class="dot purple"></span>
              <span>${escapeHtml(text)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  const state = getState();
  const analysis = state.analysis;

  if (!analysis) {
    route("input");
    return;
  }

  $("#analysisTitle").textContent = analysis.title || "Untitled analysis";

  $("#analysisSubtitle").textContent =
    analysis.summary || "No summary available.";

  $("#analysisModeBadge").textContent = modeLabel(analysis.mode);

  $("#analysisModeBadge").className = `badge mode-${analysis.mode}`;

  const topics = analysis.topics || [];
  const nodes = topics.slice(0, 4);

  const actions = analysis.actions || [];
  const risks = analysis.risks || [];
  const priorities = analysis.priorities || [];
  const decisions = analysis.decisions || [];
  const options = analysis.options || [];

  $("#dashboardContent").innerHTML = `
    <div class="analysis-grid">

      <section class="panel">
        <div class="panel-heading-row">
          <div>
            <span class="section-kicker">Structure</span>
            <h3>Thought map</h3>
          </div>

          <span class="panel-count">
            ${nodes.length} topics
          </span>
        </div>

        <div class="mind-map">

          <div class="mind-center">
            ${escapeHtml((analysis.mode || "understand").toUpperCase())}
          </div>

          ${nodes
            .map(
              (node, index) => `
                <div class="mind-node node${index + 1}">
                  <b>${escapeHtml(node.name)}</b>
                  <span>${escapeHtml(node.detail)}</span>
                </div>
              `,
            )
            .join("")}

        </div>
      </section>


      <section class="panel summary-panel">

        <div class="panel-heading-row">
          <div>
            <span class="section-kicker">Core signal</span>
            <h3>AI insight</h3>
          </div>

          <span class="insight-symbol">✦</span>
        </div>

        <p class="main-insight">
          ${escapeHtml(analysis.insight || "No insight available.")}
        </p>

        <div class="summary-divider"></div>

        <span class="section-kicker">Summary</span>

        <p>
          ${escapeHtml(analysis.summary || "No summary available.")}
        </p>

        <div class="summary-metrics">

          <div class="summary-metric">
            <span class="dot purple"></span>
            <div>
              <strong>${actions.length}</strong>
              <small>Action items</small>
            </div>
          </div>

          <div class="summary-metric">
            <span class="dot orange"></span>
            <div>
              <strong>${risks.length}</strong>
              <small>Risks</small>
            </div>
          </div>

        </div>

      </section>

    </div>


    <div class="insight-grid">

      <section class="panel insight-panel">
        <div class="panel-heading-row">
          <div>
            <span class="section-kicker">Focus</span>
            <h3>Priorities</h3>
          </div>

          <span class="panel-count">
            ${priorities.length}
          </span>
        </div>

        ${list(priorities, "No priorities identified.")}
      </section>


      <section class="panel insight-panel">
        <div class="panel-heading-row">
          <div>
            <span class="section-kicker">Movement</span>
            <h3>Actions</h3>
          </div>

          <span class="panel-count">
            ${actions.length}
          </span>
        </div>

        ${list(actions, "No actions identified.")}
      </section>


      <section class="panel insight-panel">
        <div class="panel-heading-row">
          <div>
            <span class="section-kicker">Awareness</span>
            <h3>Risks</h3>
          </div>

          <span class="panel-count">
            ${risks.length}
          </span>
        </div>

        ${list(risks, "No risks identified.")}
      </section>


      <section class="panel insight-panel">
        <div class="panel-heading-row">
          <div>
            <span class="section-kicker">Choice</span>
            <h3>Decisions</h3>
          </div>

          <span class="panel-count">
            ${decisions.length}
          </span>
        </div>

        ${list(decisions, "No decisions identified.")}
      </section>

    </div>


    ${
      options.length
        ? `
          <section class="panel options-panel">

            <div class="panel-heading-row">
              <div>
                <span class="section-kicker">
                  Compare
                </span>
                <h3>Options & trade-offs</h3>
              </div>

              <span class="panel-count">
                ${options.length}
              </span>
            </div>

            <div class="options-list">

              ${options
                .map(
                  (option, index) => `
                    <article class="option-item">

                      <div class="option-index">
                        ${String(index + 1).padStart(2, "0")}
                      </div>

                      <div class="option-content">
                        <h4>
                          ${escapeHtml(option.name || "Option")}
                        </h4>

                        <div class="option-columns">

                          <div>
                            <span class="option-label positive">
                              Pros
                            </span>

                            <p>
                              ${escapeHtml(
                                option.pros?.join(", ") || "None listed",
                              )}
                            </p>
                          </div>

                          <div>
                            <span class="option-label negative">
                              Cons
                            </span>

                            <p>
                              ${escapeHtml(
                                option.cons?.join(", ") || "None listed",
                              )}
                            </p>
                          </div>

                        </div>
                      </div>

                    </article>
                  `,
                )
                .join("")}

            </div>

          </section>
        `
        : ""
    }
  `;
}

/* =========================================================
   ACTION BOARD
========================================================= */

function renderBoard() {
  const tasks = getState().actions || [];

  const todo = tasks.filter((task) => task.status === "todo");

  const progress = tasks.filter((task) => task.status === "progress");

  const done = tasks.filter((task) => task.status === "done");

  const total = tasks.length;
  const completed = done.length;

  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  $("#statsGrid").innerHTML = `
    <div class="stat">
      <span>Total tasks</span>
      <strong>${total}</strong>
    </div>

    <div class="stat">
      <span>In progress</span>
      <strong>${progress.length}</strong>
    </div>

    <div class="stat">
      <span>Completed</span>
      <strong>${completed}</strong>
    </div>

    <div class="stat">
      <span>Completion</span>
      <strong>${completionRate}%</strong>
    </div>
  `;

  $("#board").innerHTML = [
    ["todo", "To Do", todo],
    ["progress", "In Progress", progress],
    ["done", "Done", done],
  ]
    .map(
      ([status, title, items]) => `
        <section class="board-column">

          <div class="column-head">
            <h3>${title}</h3>
            <span class="count">${items.length}</span>
          </div>

          <div class="task-list">

            ${
              items.length
                ? items.map(taskCard).join("")
                : `
                  <div class="empty">
                    <h3>Nothing here yet.</h3>
                    <p>Move a task here when you're ready.</p>
                  </div>
                `
            }

          </div>

          <button
            class="text-btn add-column"
            data-status="${status}"
          >
            + Add task
          </button>

        </section>
      `,
    )
    .join("");

  const progressPercent = total
    ? Math.round(((completed + progress.length * 0.5) / total) * 100)
    : 0;

  $("#progressPct").textContent = `${progressPercent}%`;

  $("#progressBar").style.width = `${progressPercent}%`;

  $("#progressMessage").textContent =
    progressPercent === 100
      ? "Everything is complete."
      : progressPercent > 50
        ? "You're getting close. Finish strong!"
        : progressPercent
          ? "You're making progress. Keep going."
          : "Start with one small action.";
}

function taskCard(task) {
  const nextAction =
    task.status === "todo"
      ? "Start"
      : task.status === "progress"
        ? "Complete"
        : "View";

  return `
    <article class="task-card">

      <div class="task-top">

        <span class="${priorityClass(task.priority)}">
          ${escapeHtml(task.priority)}
        </span>

        <button
          class="text-btn delete-task"
          data-delete-task="${escapeHtml(task.id)}"
          aria-label="Delete task"
          type="button"
        >
          ×
        </button>

      </div>

      <h4>
        ${escapeHtml(task.title)}
      </h4>

      <div class="task-footer">

        <span>
          ${new Date(task.createdAt).toLocaleDateString()}
        </span>

        <button
          type="button"
          data-move-task="${escapeHtml(task.id)}"
        >
          ${nextAction}
        </button>

      </div>

    </article>
  `;
}

/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {
  const state = getState();

  let items = state.history || [];

  const search = $("#historySearch")?.value.trim().toLowerCase() || "";

  const filter = $("#historyFilter")?.value || "all";

  if (filter !== "all") {
    items = items.filter((item) => item.mode === filter);
  }

  if (search) {
    items = items.filter((item) =>
      `
        ${item.title || ""}
        ${item.summary || ""}
        ${item.insight || ""}
        ${item.thought || ""}
      `
        .toLowerCase()
        .includes(search),
    );
  }

  $("#historyList").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="history-item">

              <div class="history-icon">
                ✦
              </div>

              <div>
                <div class="analysis-label-row">
                  <span class="badge mode-${item.mode}">
                    ${modeLabel(item.mode)}
                  </span>
                </div>

                <h3>
                  ${escapeHtml(item.title)}
                </h3>

                <p>
                  ${escapeHtml(item.summary)}
                </p>

                <div class="history-meta">
                  ${new Date(item.createdAt).toLocaleString()}
                </div>
              </div>

              <div class="history-actions">

                <button
                  class="btn outline"
                  data-view-history="${escapeHtml(item.id)}"
                  type="button"
                >
                  View
                </button>

                <button
                  class="text-btn danger-text"
                  data-delete-history="${escapeHtml(item.id)}"
                  type="button"
                >
                  Delete
                </button>

              </div>

            </article>
          `,
        )
        .join("")
    : `
        <div class="empty">
          <h3>No analyses yet</h3>
          <p>Your AI analyses will appear here.</p>

          <button
            class="btn primary"
            data-route="input"
            type="button"
          >
            Start an analysis
          </button>
        </div>
      `;
}

/* =========================================================
   TASK MODAL
========================================================= */

function openTaskModal(status = "todo") {
  const modal = $("#taskModal");

  if (!modal) return;

  $("#taskStatus").value = status;
  $("#taskTitle").value = "";

  modal.hidden = false;

  setTimeout(() => {
    $("#taskTitle")?.focus();
  }, 50);
}

function closeTaskModal() {
  const modal = $("#taskModal");

  if (modal) {
    modal.hidden = true;
  }
}

/* =========================================================
   ANALYSIS MODAL
========================================================= */

function openAnalysis(item) {
  $("#modalTitle").textContent = item.title || "Analysis";

  $("#modalMode").textContent = modeLabel(item.mode);

  $("#modalMode").className = `badge mode-${item.mode}`;

  $("#modalBody").innerHTML = `
    <p>
      ${escapeHtml(item.summary)}
    </p>

    <h3>Insight</h3>

    <p>
      ${escapeHtml(item.insight)}
    </p>

    <h3>Thought</h3>

    <p>
      ${escapeHtml(item.thought || "")}
    </p>
  `;

  $("#analysisModal").hidden = false;
}

function closeAnalysisModal() {
  const modal = $("#analysisModal");

  if (modal) {
    modal.hidden = true;
  }
}

/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {
  const modal = $("#settingsModal");

  if (!modal) return;

  $("#apiKeyInput").value =
    localStorage.getItem("echomind_openrouter_key") || "";

  modal.hidden = false;

  setTimeout(() => {
    $("#apiKeyInput")?.focus();
  }, 50);
}

function closeSettings() {
  const modal = $("#settingsModal");

  if (modal) {
    modal.hidden = true;
  }
}

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openWorkspaceSidebar() {
  const currentPage = document.querySelector(".workspace-screen:not([hidden])");

  if (!currentPage) return;

  currentPage.classList.add("sidebar-open");

  const overlay = $("#sidebarOverlay");

  if (overlay) {
    overlay.hidden = false;
  }
}

function closeWorkspaceSidebar() {
  $$(".workspace-screen").forEach((screen) => {
    screen.classList.remove("sidebar-open");
  });

  const overlay = $("#sidebarOverlay");

  if (overlay) {
    overlay.hidden = true;
  }
}

function toggleWorkspaceSidebar() {
  const currentPage = document.querySelector(".workspace-screen:not([hidden])");

  if (!currentPage) return;

  if (currentPage.classList.contains("sidebar-open")) {
    closeWorkspaceSidebar();
  } else {
    openWorkspaceSidebar();
  }
}

/* =========================================================
   MODAL BACKDROP
========================================================= */

function closeAnyModalOnBackdrop(event) {
  if (event.target !== event.currentTarget) {
    return;
  }

  if (event.currentTarget.id === "settingsModal") {
    closeSettings();
  }

  if (event.currentTarget.id === "taskModal") {
    closeTaskModal();
  }

  if (event.currentTarget.id === "analysisModal") {
    closeAnalysisModal();
  }
}

/* =========================================================
   INIT
========================================================= */

function init() {
  /* ---------------------------------------------
     Global route / action clicks
  --------------------------------------------- */

  document.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route]");

    if (routeButton) {
      event.preventDefault();

      route(routeButton.dataset.route);

      $("#mobileNav")?.setAttribute("hidden", "");

      $("#menuBtn")?.setAttribute("aria-expanded", "false");

      return;
    }

    const sidebarToggle = event.target.closest("[data-sidebar-toggle]");

    if (sidebarToggle) {
      toggleWorkspaceSidebar();
      return;
    }

    const openSettingsButton = event.target.closest("[data-open-settings]");

    if (openSettingsButton) {
      openSettings();
      return;
    }

    const closeTaskButton = event.target.closest("[data-close-task-modal]");

    if (closeTaskButton) {
      closeTaskModal();
      return;
    }

    const addButton = event.target.closest(".add-column");

    if (addButton) {
      openTaskModal(addButton.dataset.status);

      return;
    }

    const moveButton = event.target.closest("[data-move-task]");

    if (moveButton) {
      const id = moveButton.dataset.moveTask;

      const task = getState().actions.find((item) => item.id === id);

      if (!task) return;

      if (task.status === "todo") {
        updateAction(id, {
          status: "progress",
        });
      } else if (task.status === "progress") {
        updateAction(id, {
          status: "done",
        });
      } else {
        const historyItem = getState().history.find(
          (item) => item.id === task.analysisId,
        );

        if (historyItem) {
          openAnalysis(historyItem);
        }
      }

      renderBoard();

      return;
    }

    const deleteTaskButton = event.target.closest("[data-delete-task]");

    if (deleteTaskButton) {
      deleteAction(deleteTaskButton.dataset.deleteTask);

      renderBoard();

      return;
    }

    const viewHistoryButton = event.target.closest("[data-view-history]");

    if (viewHistoryButton) {
      const item = getState().history.find(
        (historyItem) =>
          historyItem.id === viewHistoryButton.dataset.viewHistory,
      );

      if (item) {
        openAnalysis(item);
      }

      return;
    }

    const deleteHistoryButton = event.target.closest("[data-delete-history]");

    if (deleteHistoryButton) {
      deleteHistory(deleteHistoryButton.dataset.deleteHistory);

      renderHistory();

      return;
    }
  });

  /* ---------------------------------------------
     Landing mobile menu
  --------------------------------------------- */

  $("#menuBtn")?.addEventListener("click", () => {
    const mobileNav = $("#mobileNav");

    if (!mobileNav) return;

    mobileNav.hidden = !mobileNav.hidden;

    $("#menuBtn").setAttribute("aria-expanded", String(!mobileNav.hidden));
  });

  /* ---------------------------------------------
     Mobile sidebar overlay
  --------------------------------------------- */

  $("#sidebarOverlay")?.addEventListener("click", closeWorkspaceSidebar);

  /* ---------------------------------------------
     Landing anchor links
  --------------------------------------------- */

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href").slice(1);

      if (!id || !document.getElementById(id)) {
        return;
      }

      event.preventDefault();

      route("landing");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 20);
    });
  });

  /* ---------------------------------------------
     Thought input
  --------------------------------------------- */

  $("#thoughtInput")?.addEventListener("input", (event) => {
    $("#charCount").textContent = `${event.target.value.length} / 5000`;
  });

  /* ---------------------------------------------
     Mode selector
  --------------------------------------------- */

  $$(".mode-choice").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".mode-choice").forEach((item) => item.classList.remove("selected"));

      card.classList.add("selected");

      const input = card.querySelector('input[type="radio"]');

      if (input) {
        input.checked = true;
      }
    });
  });

  /* ---------------------------------------------
     Thought form
  --------------------------------------------- */

  $("#thoughtForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const thought = $("#thoughtInput").value.trim();

    const selectedMode = $("input[name=mode]:checked");

    const mode = selectedMode?.value || "understand";

    const error = $("#formError");

    const loading = $("#loadingPanel");

    const button = $("#analyzeBtn");

    error.hidden = true;

    if (thought.length < 20) {
      error.textContent =
        "Please write a little more so the AI has enough context to analyze.";

      error.hidden = false;

      return;
    }

    if (!hasApiKey()) {
      openSettings();

      toast("Add your OpenRouter API key first.");

      return;
    }

    loading.hidden = false;
    button.disabled = true;

    try {
      const analysis = await analyzeThought(thought, mode);

      setAnalysis(analysis);

      addActions(
        analysis.actions.map((action) => ({
          ...action,
          analysisId: analysis.id,
        })),
      );

      route("dashboard");
    } catch (errorObject) {
      console.error(errorObject);

      error.textContent =
        errorObject instanceof Error
          ? errorObject.message
          : "Something went wrong while analyzing your thought.";

      error.hidden = false;
    } finally {
      loading.hidden = true;
      button.disabled = false;
    }
  });

  /* ---------------------------------------------
     New task
  --------------------------------------------- */

  $("#newTaskBtn")?.addEventListener("click", () => openTaskModal());

  $("#closeTaskModal")?.addEventListener("click", closeTaskModal);

  $("#saveTaskBtn")?.addEventListener("click", () => {
    const title = $("#taskTitle").value.trim();

    if (!title) {
      toast("Enter a task title.");

      return;
    }

    addAction({
      title,
      priority: $("#taskPriority").value,
      status: $("#taskStatus").value,
    });

    closeTaskModal();

    renderBoard();
  });

  /* ---------------------------------------------
     Analysis modal
  --------------------------------------------- */

  $("#closeAnalysisModal")?.addEventListener("click", closeAnalysisModal);

  /* ---------------------------------------------
     Clear history
  --------------------------------------------- */

  $("#clearHistoryBtn")?.addEventListener("click", () => {
    if (confirm("Clear all saved analyses?")) {
      clearHistory();

      renderHistory();
    }
  });

  /* ---------------------------------------------
     History search/filter
  --------------------------------------------- */

  $("#historySearch")?.addEventListener("input", renderHistory);

  $("#historyFilter")?.addEventListener("change", renderHistory);

  /* ---------------------------------------------
     Settings
  --------------------------------------------- */

  $("#settingsBtn")?.addEventListener("click", openSettings);

  $("#sidebarSettings")?.addEventListener("click", openSettings);

  $$("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", openSettings);
  });

  $("#closeSettings")?.addEventListener("click", closeSettings);

  $("#saveSettingsBtn")?.addEventListener("click", () => {
    const key = $("#apiKeyInput").value.trim();

    if (!key) {
      toast("Enter an OpenRouter API key.");

      return;
    }

    localStorage.setItem("echomind_openrouter_key", key);

    closeSettings();

    toast("OpenRouter key saved locally.");
  });

  $("#removeKeyBtn")?.addEventListener("click", () => {
    localStorage.removeItem("echomind_openrouter_key");

    $("#apiKeyInput").value = "";

    toast("Saved API key removed.");
  });

  /* ---------------------------------------------
     Modal backdrops
  --------------------------------------------- */

  $("#settingsModal")?.addEventListener("click", closeAnyModalOnBackdrop);

  $("#taskModal")?.addEventListener("click", closeAnyModalOnBackdrop);

  $("#analysisModal")?.addEventListener("click", closeAnyModalOnBackdrop);

  /* ---------------------------------------------
     Escape key
  --------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeSettings();
    closeTaskModal();
    closeAnalysisModal();
    closeWorkspaceSidebar();
  });

  /* ---------------------------------------------
     Initial route
  --------------------------------------------- */

  const initialRoute = location.hash.replace("#", "");

  route(pages.includes(initialRoute) ? initialRoute : "landing");
}

init();
