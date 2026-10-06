document.addEventListener("DOMContentLoaded", () => {
  const landing = document.getElementById("landingPage");
  const input = document.getElementById("inputPage");

  if (!input && !landing) return;

  function showPage(page) {
    if (landing) {
      landing.hidden = page !== "landing";
    }

    if (input) {
      input.hidden = page !== "input";
    }

    if (page === "landing") {
      document.title = "EchoMind — Clarity Starts Here";
    } else {
      document.title = "New Analysis — EchoMind";
    }

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    document
      .querySelectorAll(".side-link[data-page]")
      .forEach((element) => {
        element.classList.toggle(
          "active",
          element.dataset.page === page
        );
      });

    document.dispatchEvent(
      new CustomEvent("echomind:pagechange", {
        detail: { page },
      })
    );
  }

  document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");

    if (pageButton) {
      event.preventDefault();
      showPage(pageButton.dataset.page);
      return;
    }

    const scrollLink = event.target.closest("[data-scroll]");

    if (scrollLink && landing) {
      event.preventDefault();

      showPage("landing");

      requestAnimationFrame(() => {
        const target = document.getElementById(
          scrollLink.dataset.scroll
        );

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
          });
        }
      });
    }
  });

  // If there is no Landing page yet,
  // show the Input page directly.
  if (!landing && input) {
    input.hidden = false;
    document.title = "New Analysis — EchoMind";
  }

  window.EchoUI = Object.freeze({
    showPage,
  });
});