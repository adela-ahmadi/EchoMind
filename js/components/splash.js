
document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splashScreen");

  if (!splashScreen) return;

  // Keep the splash screen visible briefly.
  window.setTimeout(() => {
    splashScreen.classList.add("splash-hidden");

    // Remove it from the page after the fade-out.
    window.setTimeout(() => {
      splashScreen.remove();
    }, 650);
  }, 1800);
});