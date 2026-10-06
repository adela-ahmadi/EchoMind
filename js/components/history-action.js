const TASKS_KEY = "echoMindTasks";
const HISTORY_KEY = "echoMindHistory";

let tasks = loadData(TASKS_KEY);
let history = loadData(HISTORY_KEY);

let selectedStatus = "todo";
let boardFilter = "all";
let historyMode = "all";


document.addEventListener("DOMContentLoaded", () => {
    setupBoardColumns();
    bindEvents();

    renderTasks();
    renderHistory();
    updateStats();
});


/* =========================
   STORAGE
========================= */

function loadData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Storage error:", error);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}


/* =========================
   INITIAL SETUP
========================= */

function setupBoardColumns() {
    const columns = document.querySelectorAll(".board-column");

    const statuses = ["todo", "progress", "done"];

    columns.forEach((column, index) => {
        if (statuses[index]) {
            column.dataset.status = statuses[index];
        }
    });
}


/* =========================
   EVENTS
========================= */

function bindEvents() {

    // New Task button
    const newTaskBtn = document.getElementById("newTaskBtn");

    if (newTaskBtn) {
        newTaskBtn.addEventListener("click", () => {
            openTaskModal("todo");
        });
    }


    // Add task buttons inside columns
    document.querySelectorAll(".add-small-task").forEach(button => {
        button.addEventListener("click", () => {
            const status = button.dataset.status || "todo";
            openTaskModal(status);
        });
    });


    // Task modal
    const closeModal = document.getElementById("closeModal");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskModal = document.getElementById("taskModal");

    if (closeModal) {
        closeModal.addEventListener("click", closeTaskModal);
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", createTask);
    }

    if (taskModal) {
        taskModal.addEventListener("click", event => {
            if (event.target === taskModal) {
                closeTaskModal();
            }
        });
    }


    // Enter key inside task input
    const taskInput = document.getElementById("taskInput");

    if (taskInput) {
        taskInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                createTask();
            }
        });
    }


    // Board filters
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {

            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            boardFilter = button.dataset.filter || "all";

            renderTasks();
        });
    });


    // History search
    const historySearch = document.getElementById("historySearch");

    if (historySearch) {
        historySearch.addEventListener("input", renderHistory);
    }


    // History mode filter
    const historyFilter = document.getElementById("historyFilter");

    if (historyFilter) {
        historyFilter.addEventListener("change", () => {
            historyMode = historyFilter.value;
            renderHistory();
        });
    }


    // Clear history
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", clearHistory);
    }


    // Analysis modal
    const closeAnalysis = document.getElementById("closeAnalysis");
    const analysisModal = document.getElementById("analysisModal");

    if (closeAnalysis) {
        closeAnalysis.addEventListener("click", closeAnalysisModal);
    }

    if (analysisModal) {
        analysisModal.addEventListener("click", event => {
            if (event.target === analysisModal) {
                closeAnalysisModal();
            }
        });
    }


    // Notification button
    const notificationBtn = document.getElementById("notificationBtn");

    if (notificationBtn) {
        notificationBtn.addEventListener("click", () => {
            alert("Your EchoMind workspace is up to date ✨");
        });
    }


    // Escape closes modals
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeTaskModal();
            closeAnalysisModal();
        }
    });
}


/* =========================
   TASK MODAL
========================= */

function openTaskModal(status = "todo") {

    selectedStatus = status;

    const modal = document.getElementById("taskModal");
    const input = document.getElementById("taskInput");
    const priority = document.getElementById("taskPriority");

    if (!modal) return;

    modal.classList.add("show");

    if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 100);
    }

    if (priority) {
        priority.value = "medium";
    }
}


function closeTaskModal() {

    const modal = document.getElementById("taskModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =========================
   CREATE TASK
========================= */

function createTask() {

    const input = document.getElementById("taskInput");
    const prioritySelect = document.getElementById("taskPriority");

    if (!input) return;

    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task title.");
        input.focus();
        return;
    }

    const priority = prioritySelect
        ? prioritySelect.value
        : "medium";

    const newTask = {
        id: Date.now(),
        title: title,
        priority: priority,
        status: selectedStatus,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveTasks();

    renderTasks();
    updateStats();

    closeTaskModal();
}


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    const todoList = document.getElementById("todoList");
    const progressList = document.getElementById("progressList");
    const doneList = document.getElementById("doneList");

    if (!todoList || !progressList || !doneList) return;

    todoList.innerHTML = "";
    progressList.innerHTML = "";
    doneList.innerHTML = "";

    const visibleTasks = boardFilter === "all"
        ? tasks
        : tasks.filter(task => task.status === boardFilter);


    visibleTasks.forEach(task => {

        const card = createTaskCard(task);

        if (task.status === "todo") {
            todoList.appendChild(card);
        }

        if (task.status === "progress") {
            progressList.appendChild(card);
        }

        if (task.status === "done") {
            doneList.appendChild(card);
        }
    });


    updateColumnCounts();
}


/* =========================
   TASK CARD
========================= */

function createTaskCard(task) {

    const card = document.createElement("div");

    card.className = "task-card";

    const priorityClass = getPriorityClass(task.priority);

    let actionText = "Start";

    if (task.status === "progress") {
        actionText = "Complete";
    }

    if (task.status === "done") {
        actionText = "View";
    }

    card.innerHTML = `
        <div class="task-card-top">
            <span class="priority-badge ${priorityClass}">
                ${escapeHTML(capitalize(task.priority))}
            </span>

            <button 
                class="task-delete"
                data-action="delete"
                data-id="${task.id}"
                aria-label="Delete task">
                ×
            </button>
        </div>

        <h4 class="task-title">
            ${escapeHTML(task.title)}
        </h4>

        <div class="task-meta">
            <span>
                ${formatDate(task.createdAt)}
            </span>

            <div class="task-actions">
                <button 
                    class="task-action"
                    data-action="move"
                    data-id="${task.id}">
                    ${actionText}
                </button>
            </div>
        </div>
    `;


    const moveButton = card.querySelector('[data-action="move"]');
    const deleteButton = card.querySelector('[data-action="delete"]');


    if (moveButton) {
        moveButton.addEventListener("click", () => {
            handleTaskAction(task.id);
        });
    }


    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });
    }


    return card;
}


/* =========================
   TASK ACTION
========================= */

function handleTaskAction(taskId) {

    const task = tasks.find(item => item.id === taskId);

    if (!task) return;


    if (task.status === "todo") {

        task.status = "progress";

    } else if (task.status === "progress") {

        task.status = "done";

        addTaskToHistory(task);

    } else if (task.status === "done") {

        showTaskAnalysis(task);
        return;
    }


    saveTasks();

    renderTasks();
    updateStats();
}


/* =========================
   DELETE TASK
========================= */

function deleteTask(taskId) {

    const task = tasks.find(item => item.id === taskId);

    if (!task) return;


    const shouldDelete = confirm(
        `Delete "${task.title}"?`
    );

    if (!shouldDelete) return;


    tasks = tasks.filter(item => item.id !== taskId);

    saveTasks();

    renderTasks();
    updateStats();
}


/* =========================
   COLUMN COUNTS
========================= */

function updateColumnCounts() {

    const todoCount = document.getElementById("todoCount");
    const progressCount = document.getElementById("progressCount");
    const doneCount = document.getElementById("doneCount");

    const todo = tasks.filter(task => task.status === "todo").length;
    const progress = tasks.filter(task => task.status === "progress").length;
    const done = tasks.filter(task => task.status === "done").length;


    if (todoCount) {
        todoCount.textContent = todo;
    }

    if (progressCount) {
        progressCount.textContent = progress;
    }

    if (doneCount) {
        doneCount.textContent = done;
    }
}


/* =========================
   STATISTICS
========================= */

function updateStats() {

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        task => task.status === "done"
    ).length;

    const progressTasks = tasks.filter(
        task => task.status === "progress"
    ).length;


    const completionRate = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);


    const progressPercentage = totalTasks === 0
        ? 0
        : Math.round(
            ((completedTasks + progressTasks * 0.5) / totalTasks) * 100
        );


    const totalTasksElement = document.getElementById("totalTasks");
    const totalProgressElement = document.getElementById("totalProgress");
    const totalDoneElement = document.getElementById("totalDone");
    const completionRateElement = document.getElementById("completionRate");

    if (totalTasksElement) {
        totalTasksElement.textContent = totalTasks;
    }

    if (totalProgressElement) {
        totalProgressElement.textContent = progressTasks;
    }

    if (totalDoneElement) {
        totalDoneElement.textContent = completedTasks;
    }

    if (completionRateElement) {
        completionRateElement.textContent = `${completionRate}%`;
    }


    const percentageElement =
        document.getElementById("progressPercentage");

    const progressBar =
        document.getElementById("progressBar");

    const progressMessage =
        document.getElementById("progressMessage");


    if (percentageElement) {
        percentageElement.textContent = `${progressPercentage}%`;
    }

    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
    }

    if (progressMessage) {

        if (progressPercentage === 0) {
            progressMessage.textContent =
                "Start with one small action.";
        } else if (progressPercentage < 50) {
            progressMessage.textContent =
                "You're making progress. Keep going!";
        } else if (progressPercentage < 100) {
            progressMessage.textContent =
                "You're getting close. Finish strong!";
        } else {
            progressMessage.textContent =
                "Amazing! You completed everything.";
        }
    }
}


/* =========================
   HISTORY
========================= */

function addTaskToHistory(task) {

    const historyItem = {
        id: Date.now(),
        title: task.title,
        mode: "Organize",
        summary: "This action was completed from your Action Board.",
        insight: "You turned a thought into a completed action.",
        date: new Date().toISOString()
    };


    history.unshift(historyItem);

    saveHistory();

    renderHistory();
}


/* =========================
   RENDER HISTORY
========================= */

function renderHistory() {

    const historyList = document.getElementById("historyList");
    const emptyHistory = document.getElementById("emptyHistory");
    const searchInput = document.getElementById("historySearch");

    if (!historyList || !emptyHistory) return;


    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";


    let filteredHistory = [...history];


    if (historyMode !== "all") {
        filteredHistory = filteredHistory.filter(item =>
            item.mode &&
            item.mode.toLowerCase() === historyMode.toLowerCase()
        );
    }


    if (searchText) {
        filteredHistory = filteredHistory.filter(item => {

            const content = `
                ${item.title || ""}
                ${item.summary || ""}
                ${item.insight || ""}
                ${item.mode || ""}
            `.toLowerCase();

            return content.includes(searchText);
        });
    }


    historyList.innerHTML = "";


    if (filteredHistory.length === 0) {
        emptyHistory.style.display = "block";
        return;
    }


    emptyHistory.style.display = "none";


    filteredHistory.forEach(item => {

        const historyCard = document.createElement("div");

        historyCard.className = "history-item";


        historyCard.innerHTML = `
            <div class="history-item-icon">
                ${getModeIcon(item.mode)}
            </div>

            <div class="history-item-content">
                <div class="history-item-top">
                    <h4>
                        ${escapeHTML(item.title || "Untitled analysis")}
                    </h4>

                    <span class="mode-badge ${getModeClass(item.mode)}">
                        ${escapeHTML(item.mode || "Understand")}
                    </span>
                </div>

                <p>
                    ${escapeHTML(
                        item.summary || "No summary available."
                    )}
                </p>

                <span class="history-date">
                    ${formatDate(item.date)}
                </span>
            </div>

            <div class="history-item-actions">
                <button 
                    class="history-view"
                    data-history-id="${item.id}">
                    View
                </button>

                <button 
                    class="history-delete"
                    data-history-delete="${item.id}">
                    ×
                </button>
            </div>
        `;


        const viewButton =
            historyCard.querySelector("[data-history-id]");

        const deleteButton =
            historyCard.querySelector("[data-history-delete]");


        if (viewButton) {
            viewButton.addEventListener("click", () => {
                showHistoryAnalysis(item);
            });
        }


        if (deleteButton) {
            deleteButton.addEventListener("click", () => {
                deleteHistoryItem(item.id);
            });
        }


        historyList.appendChild(historyCard);
    });
}


/* =========================
   DELETE HISTORY
========================= */

function deleteHistoryItem(id) {

    history = history.filter(item => item.id !== id);

    saveHistory();

    renderHistory();
}


/* =========================
   CLEAR HISTORY
========================= */

function clearHistory() {

    if (history.length === 0) {
        return;
    }


    const shouldClear = confirm(
        "Are you sure you want to clear your entire history?"
    );


    if (!shouldClear) return;


    history = [];

    saveHistory();

    renderHistory();
}


/* =========================
   ANALYSIS MODAL
========================= */

function showHistoryAnalysis(item) {

    const modal = document.getElementById("analysisModal");

    const title = document.getElementById("analysisTitle");
    const mode = document.getElementById("analysisMode");
    const summary = document.getElementById("analysisSummary");
    const insight = document.getElementById("analysisInsight");


    if (!modal) return;


    if (title) {
        title.textContent = item.title || "Untitled analysis";
    }


    if (mode) {
        mode.textContent = item.mode || "Understand";

        mode.classList.remove(
            "mode-understand",
            "mode-organize",
            "mode-decide"
        );

        mode.classList.add(
            getModeClass(item.mode)
        );
    }


    if (summary) {
        summary.textContent =
            item.summary || "No summary available.";
    }


    if (insight) {
        insight.textContent =
            item.insight || "No insight available.";
    }


    modal.classList.add("show");
}


function showTaskAnalysis(task) {

    showHistoryAnalysis({
        title: task.title,
        mode: "Organize",
        summary: "This task has already been completed.",
        insight: "You successfully moved this action from your board to Done."
    });
}


function closeAnalysisModal() {

    const modal = document.getElementById("analysisModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =========================
   HELPERS
========================= */

function getPriorityClass(priority) {

    switch (priority) {

        case "high":
            return "priority-high";

        case "low":
            return "priority-low";

        default:
            return "priority-medium";
    }
}


function getModeClass(mode) {

    if (!mode) {
        return "mode-understand";
    }

    const value = mode.toLowerCase();

    if (value === "organize") {
        return "mode-organize";
    }

    if (value === "decide") {
        return "mode-decide";
    }

    return "mode-understand";
}


function getModeIcon(mode) {

    if (!mode) {
        return "💡";
    }

    const value = mode.toLowerCase();

    if (value === "organize") {
        return "📋";
    }

    if (value === "decide") {
        return "🎯";
    }

    return "💡";
}


function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
}


function formatDate(dateString) {

    if (!dateString) {
        return "Recently";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   FUTURE TEAM INTEGRATION
========================= */

window.addEchoMindHistory = function (item) {

    const newHistoryItem = {
        id: Date.now(),
        title: item.title || "Untitled analysis",
        mode: item.mode || "Understand",
        summary: item.summary || "",
        insight: item.insight || "",
        date: item.date || new Date().toISOString()
    };


    history.unshift(newHistoryItem);

    saveHistory();

    renderHistory();
};