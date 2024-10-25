// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  runCommand: (command, args) =>
    ipcRenderer.invoke("run-command", command, args),
  selectFiles: () => ipcRenderer.invoke("select-files"),
  onCommandOutput: (callback) =>
    ipcRenderer.on("command-output", (event, data) => callback(data)),
});
