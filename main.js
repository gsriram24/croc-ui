// src/main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { spawn } = require("child_process");

let ptyProcess;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "./static/preload.js"),
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
  win.webContents.openDevTools();
}

// Handle IPC to spawn a shell
ipcMain.handle("spawn-shell", () => {
  const shell = process.platform === "win32" ? "croc help" : "bash";
  ptyProcess = spawn(shell, { shell: true });

  ptyProcess.stdout.on("data", (data) => {
    win.webContents.send("shell-output", data.toString());
  });

  ptyProcess.on("error", (error) => {
    console.log(error);
  });
});

// Handle input from the renderer to the shell
ipcMain.on("shell-input", (event, input) => {
  if (ptyProcess) {
    ptyProcess.stdin.write(input);
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
