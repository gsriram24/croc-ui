// src/renderer.js
document.addEventListener("DOMContentLoaded", async () => {
  if (window.api && window.api.Terminal) {
    const term = new Terminal(); // Ensure 'new' is used here
    term.open(document.getElementById("terminal"));

    try {
      await window.api.spawnShell();

      // Listen for shell output from the main process
      window.api.onShellOutput((data) => {
        term.write(data);
      });

      term.onData((input) => {
        window.api.sendShellInput(input);
      });
    } catch (error) {
      console.error("Error spawning shell:", error);
    }
  } else {
    console.error("API is not defined or Terminal is not available.");
  }
});
