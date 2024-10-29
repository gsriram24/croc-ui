// src/renderer.js
document.addEventListener("DOMContentLoaded", async () => {
  if (window.api && window.api.Terminal) {
    const term = new Terminal();
    term.open(document.getElementById("terminal"));

    // Get DOM elements
    const commandInput = document.getElementById("command-input");
    const runButton = document.getElementById("run-button");
    const crocCodeDisplay = document.getElementById("croc-code-display");
    const codeValue = document.getElementById("code-value");
    const cancelButton = document.getElementById("cancel-transfer");

    try {
      await window.api.spawnShell();

      window.api.onCrocCode((code) => {
        crocCodeDisplay.style.display = "block";
        codeValue.textContent = code;
      });

      // Handle cancel button
      cancelButton.addEventListener("click", async () => {
        await window.api.terminateProcess();
        crocCodeDisplay.style.display = "none";
        term.write("\r\nTransfer cancelled by user\r\n");
      });

      // Listen for shell output from the main process
      window.api.onShellOutput((data) => {
        term.write(data);
      });

      // Handle terminal input
      term.onData((input) => {
        window.api.sendShellInput(input);
      });

      // Handle run button click
      runButton.addEventListener("click", () => {
        executeCommand();
      });

      // Handle Enter key in input field
      commandInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          executeCommand();
        }
      });

      // Function to execute command
      function executeCommand() {
        const command = commandInput.value;
        if (command) {
          window.api.sendShellInput(command + "\n");
          commandInput.value = ""; // Clear input after sending
        }
      }
    } catch (error) {
      console.error("Error spawning shell:", error);
    }
  } else {
    console.error("API is not defined or Terminal is not available.");
  }
});
