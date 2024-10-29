const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./static/preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("run-command", (event, command) => {
  const pythonProcess = spawn(
    "python",
    ["-u", path.join(__dirname, "croc-ui.py")],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  // Handle each line of output
  pythonProcess.stdout.on("data", (data) => {
    try {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => {
        if (line) {
          const parsedData = JSON.parse(line);
          event.reply("command-output", parsedData);
        }
      });
    } catch (error) {
      event.reply("command-output", { error: "Failed to parse Python output" });
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    event.reply("command-output", { error: data.toString() });
  });

  pythonProcess.on("close", (code) => {
    event.reply("command-output", { status: "finished", code });
  });

  // Send the command to the Python script
  pythonProcess.stdin.write(JSON.stringify({ command: command }));
  pythonProcess.stdin.end();
});
