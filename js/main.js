import { analyzeThought } from "./api.js";

import {
  getState,
  setLoading,
  setAnalysis,
  setError,
  addHistoryItem,
} from "./state.js";

import { renderDashboard } from "./components/dashboard.js";
import {
  renderActionBoard,
  setupActionBoard,
} from "./components/actionBoard.js";

import { renderHistory, setupHistory } from "./components/history.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupInput();
  setupActionBoard();
  setupHistory();

  initializeApp();
});

function initializeApp() {
  const state = getState();

  if (state.analysis) {
    renderDashboard();
  }

  renderActionBoard();
  renderHistory();

  showPage("landing");
}

function setupNavigation() {
  document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");

    if (pageButton) {
      event.preventDefault();

      const page = pageButton.dataset.page;

      if (page === "history") {
        showPage("history");
        renderHistory();
        return;
      }

      showPage(page);

      return;
    }

    const scrollLink = event.target.closest("[data-scroll]");

    if (scrollLink) {
      event.preventDefault();

      const target = document.getElementById(scrollLink.dataset.scroll);

      if (!target) return;

      showPage("landing");

      requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: "smooth",
        });
      });
    }

    const noticeElement = event.target.closest("[data-notice]");

    if (noticeElement) {
      event.preventDefault();

      showNotice(noticeElement.dataset.notice);
    }
  });

  const menuButton = document.getElementById("menuButton");

  const mobileNav = document.getElementById("mobileNav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = !mobileNav.hidden;

      mobileNav.hidden = isOpen;

      menuButton.setAttribute("aria-expanded", String(!isOpen));
    });
  }
}

function showPage(page) {
  const pages = {
    landing: document.getElementById("landingPage"),
    input: document.getElementById("inputPage"),
    dashboard: document.getElementById("dashboardPage"),
    actions: document.getElementById("actionsPage"),
    history: document.getElementById("historyPage"),
  };

  Object.entries(pages).forEach(([name, element]) => {
    if (element) {
      element.hidden = name !== page;
    }
  });

  const titles = {
    landing: "EchoMind | Make Sense of Your Thoughts",

    input: "New Analysis | EchoMind",

    dashboard: "Thought Analysis | EchoMind",

    actions: "Action Board | EchoMind",

    history: "Analysis History | EchoMind",
  };

  document.title = titles[page] || titles.landing;

  if (page === "dashboard") {
    renderDashboard();
  }

  if (page === "actions") {
    renderActionBoard();
  }

  if (page === "history") {
    renderHistory();
  }

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });

  document.querySelectorAll(".side-link[data-page]").forEach((element) => {
    element.classList.toggle("active", element.dataset.page === page);
  });

  document.dispatchEvent(
    new CustomEvent("echomind:pagechange", {
      detail: { page },
    }),
  );
}

function setupInput() {
  const form = document.getElementById("thoughtForm");

  const textarea = document.getElementById("thoughtInput");

  const charCount = document.getElementById("charCount");

  const formError = document.getElementById("formError");

  const analyzeButton = document.getElementById("analyzeButton");

  const buttonText = document.getElementById("analyzeButtonText");

  const arrow = document.getElementById("analyzeArrow");

  const loadingPanel = document.getElementById("loadingPanel");

  const noticeMessage = document.getElementById("noticeMessage");

  if (!form || !textarea) return;

  function updateCharacterCount() {
    if (charCount) {
      charCount.textContent = `${textarea.value.length} / 5000`;
    }
  }

  function clearError() {
    if (!formError) return;

    formError.hidden = true;
    formError.textContent = "";
  }

  textarea.addEventListener("input", () => {
    updateCharacterCount();
    clearError();
  });

  document.querySelectorAll(".mode-card").forEach((card) => {
    const radio = card.querySelector('input[type="radio"]');

    card.addEventListener("click", () => {
      if (!radio) return;

      radio.checked = true;

      document.querySelectorAll(".mode-card").forEach((item) => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const thought = textarea.value.trim();

    const selectedMode = document.querySelector('input[name="mode"]:checked');

    const mode = selectedMode?.value || "understand";

    if (!thought) {
      showFormError(
        formError,
        "Please write something before analyzing your thoughts.",
      );

      textarea.focus();

      return;
    }

    if (thought.length < 10) {
      showFormError(
        formError,
        "Please write a little more so we can better understand your thoughts.",
      );

      textarea.focus();

      return;
    }

    clearError();

    analyzeButton.disabled = true;

    if (buttonText) {
      buttonText.textContent = "Analyzing...";
    }

    if (arrow) {
      arrow.textContent = "…";
    }

    if (loadingPanel) {
      loadingPanel.hidden = false;
    }

    if (noticeMessage) {
      noticeMessage.hidden = true;
    }

    setLoading();

    try {
      const analysis = await analyzeThought(thought, mode);

      setAnalysis(analysis, mode);

      addHistoryItem(analysis, mode, thought);

      renderDashboard();
      renderActionBoard();
      renderHistory();

      showPage("dashboard");
    } catch (error) {
      setError(error);

      showFormError(
        formError,
        error.message || "Something went wrong while analyzing your thoughts.",
      );
    } finally {
      analyzeButton.disabled = false;

      if (buttonText) {
        buttonText.textContent = "Analyze My Thoughts";
      }

      if (arrow) {
        arrow.textContent = "→";
      }

      if (loadingPanel) {
        loadingPanel.hidden = true;
      }
    }
  });

  updateCharacterCount();
}

function showFormError(element, message) {
  if (!element) return;

  element.textContent = message;
  element.hidden = false;
}

function showNotice(message) {
  const notice = document.getElementById("noticeMessage");

  if (!notice) return;

  notice.textContent = message;
  notice.hidden = false;

  clearTimeout(showNotice.timeout);

  showNotice.timeout = setTimeout(() => {
    notice.hidden = true;
  }, 3000);
}

window.EchoUI = Object.freeze({
  showPage,
});
