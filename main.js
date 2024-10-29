// src/main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { spawn } = require("child_process");

let ptyProcess;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1024, // Increased window size for better visibility
    height: 768,
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

// Function to determine the default shell based on platform
function getDefaultShell() {
  switch (process.platform) {
    case "win32":
      return "cmd.exe";
    case "darwin":
      return "bash";
    default:
      return "bash";
  }
}

// Handle IPC to spawn a shell
ipcMain.handle("spawn-shell", () => {
  try {
    const shell = getDefaultShell();
    const shellArgs = process.platform === "win32" ? [] : [];

    ptyProcess = spawn(shell, shellArgs, {
      shell: true,
      env: process.env,
      cwd: process.cwd(),
      // Add these options to ensure we get real-time output
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Improve stdout handling for real-time output
    ptyProcess.stdout.on("data", (data) => {
      const output = data.toString();
      win.webContents.send("shell-output", output);
      console.log(output);

      // If the output contains a croc code, send it separately
      if (output.includes("Code is:")) {
        win.webContents.send(
          "croc-code",
          output.match(/Code is: (.*)/)[1].trim()
        );
      }
    });

    // Enhanced stderr handling
    ptyProcess.stderr.on("data", (data) => {
      win.webContents.send("shell-output", data.toString());
    });

    return true;
  } catch (error) {
    console.error("Failed to spawn shell:", error);
    return false;
  }
});

ipcMain.handle("terminate-process", () => {
  if (ptyProcess) {
    ptyProcess.kill();
    return true;
  }
  return false;
});

// Handle input from the renderer to the shell
ipcMain.on("shell-input", (event, input) => {
  if (ptyProcess && ptyProcess.stdin) {
    try {
      ptyProcess.stdin.write(input);
    } catch (error) {
      console.error("Error writing to shell:", error);
      win.webContents.send("shell-output", `Error: ${error.message}\n`);
    }
  } else {
    console.error("Shell process or stdin not available");
    win.webContents.send("shell-output", "Error: Shell not ready\n");
  }
});

// Clean up the shell process when the window is closed
function cleanupShellProcess() {
  if (ptyProcess) {
    try {
      ptyProcess.kill();
      ptyProcess = null;
    } catch (error) {
      console.error("Error killing shell process:", error);
    }
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  cleanupShellProcess();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Clean up on app quit
app.on("before-quit", () => {
  cleanupShellProcess();
});
