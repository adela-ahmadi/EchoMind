document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("thoughtForm");
  const textarea = document.getElementById("thoughtInput");
  const charCount = document.getElementById("charCount");
  const formError = document.getElementById("formError");
  const analyzeButton = document.getElementById("analyzeButton");
  const analyzeButtonText = document.getElementById("analyzeButtonText");
  const analyzeArrow = document.getElementById("analyzeArrow");
  const loadingPanel = document.getElementById("loadingPanel");
  const noticeMessage = document.getElementById("noticeMessage");
  const modeCards = document.querySelectorAll(".mode-card");

  if (!form || !textarea) return;

  // Character counter
  function updateCharacterCount() {
    charCount.textContent = `${textarea.value.length} / 5000`;
  }

  textarea.addEventListener("input", () => {
    updateCharacterCount();

    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }
  });

  // Mode selection
  modeCards.forEach((card) => {
    const radio = card.querySelector('input[type="radio"]');

    card.addEventListener("click", () => {
      if (!radio) return;

      radio.checked = true;

      modeCards.forEach((item) => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");
    });
  });

  // Show notice
  function showNotice(message) {
    if (!noticeMessage) return;

    noticeMessage.textContent = message;
    noticeMessage.hidden = false;

    setTimeout(() => {
      noticeMessage.hidden = true;
    }, 3000);
  }

  // Handle buttons with data-notice
  document.addEventListener("click", (event) => {
    const noticeButton = event.target.closest("[data-notice]");

    if (!noticeButton) return;

    event.preventDefault();

    showNotice(noticeButton.dataset.notice);
  });

  // Submit form
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const thought = textarea.value.trim();
    const selectedMode = document.querySelector(
      'input[name="mode"]:checked'
    );

    // Validate empty input
    if (!thought) {
      if (formError) {
        formError.textContent =
          "Please write something before analyzing your thoughts.";
        formError.hidden = false;
      }

      textarea.focus();
      return;
    }

    // Validate minimum length
    if (thought.length < 10) {
      if (formError) {
        formError.textContent =
          "Please write a little more so we can better understand your thoughts.";
        formError.hidden = false;
      }

      textarea.focus();
      return;
    }

    const mode = selectedMode ? selectedMode.value : "understand";

    // Hide previous messages
    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }

    if (noticeMessage) {
      noticeMessage.hidden = true;
    }

    // Loading state
    analyzeButton.disabled = true;

    if (analyzeButtonText) {
      analyzeButtonText.textContent = "Analyzing...";
    }

    if (analyzeArrow) {
      analyzeArrow.textContent = "...";
    }

    if (loadingPanel) {
      loadingPanel.hidden = false;
    }

    // Temporary simulation
    setTimeout(() => {
      if (loadingPanel) {
        loadingPanel.hidden = true;
      }

      analyzeButton.disabled = false;

      if (analyzeButtonText) {
        analyzeButtonText.textContent = "Analyze My Thoughts";
      }

      if (analyzeArrow) {
        analyzeArrow.textContent = "...";
      }

      showNotice(
        `Your ${mode} analysis is ready. AI integration will be connected later.`
      );
    }, 1500);
  });

  // Initial character count
  updateCharacterCount();
});
