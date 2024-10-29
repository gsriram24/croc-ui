// src/preload.js
const { contextBridge, ipcRenderer } = require("electron");
const { Terminal } = require("@xterm/xterm");

// Helper function to validate data
const validateInput = (input) => {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }
  return input;
};

contextBridge.exposeInMainWorld("api", {
  Terminal: Terminal,

  // Spawn shell with error handling
  spawnShell: async () => {
    try {
      return await ipcRenderer.invoke("spawn-shell");
    } catch (error) {
      console.error("Failed to spawn shell:", error);
      throw error;
    }
  },

  // Handle shell output with callback validation
  onShellOutput: (callback) => {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    // Remove any existing listeners to prevent duplicates
    ipcRenderer.removeAllListeners("shell-output");

    return ipcRenderer.on("shell-output", (event, data) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in shell output callback:", error);
      }
    });
  },

  // Send shell input with input validation
  sendShellInput: (input) => {
    try {
      const validatedInput = validateInput(input);
      ipcRenderer.send("shell-input", validatedInput);
    } catch (error) {
      console.error("Error sending shell input:", error);
      throw error;
    }
  },

  onCrocCode: (callback) => {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    ipcRenderer.on("croc-code", (event, code) => {
      callback(code);
    });
  },

  // Add method to terminate the process
  terminateProcess: async () => {
    try {
      return await ipcRenderer.invoke("terminate-process");
    } catch (error) {
      console.error("Error terminating process:", error);
      return false;
    }
  },

  // Additional utility methods that might be useful
  clearListeners: () => {
    ipcRenderer.removeAllListeners("shell-output");
  },

  // Method to check if the terminal is ready
  isTerminalReady: async () => {
    try {
      return await ipcRenderer.invoke("spawn-shell");
    } catch (error) {
      return false;
    }
  },
});
