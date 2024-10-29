// src/preload.js
const { contextBridge, ipcRenderer } = require("electron");
const { Terminal } = require("@xterm/xterm");

contextBridge.exposeInMainWorld("api", {
  Terminal: Terminal,
  spawnShell: async () => {
    return await ipcRenderer.invoke("spawn-shell");
  },
  onShellOutput: (callback) =>
    ipcRenderer.on("shell-output", (event, data) => callback(data)),
  sendShellInput: (input) => ipcRenderer.send("shell-input", input),
});
