// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process"); // Use spawn for real-time output
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./src/preload.js"), // Use preload script to handle IPC
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();
}

ipcMain.handle("run-command", async (event, command, args) => {
  return new Promise((resolve, reject) => {
    const normalizedArgs = args.map((arg) => path.normalize(arg));
    const child = spawn(command, normalizedArgs); // Use normalized arguments

    let output = "";
    child.stdout.on("data", (data) => {
      console.log(data);
      output += data.toString();
      // Send output to renderer

      console.log(`stdout: ${data}`); // Log standard output
      event.sender.send("command-output", data.toString());
    });

    child.stderr.on("data", (data) => {
      output += data.toString();
      // Send error output to renderer
      event.sender.send("command-output", data.toString());
    });

    child.on("close", (code) => {
      resolve(output); // Resolve the promise with the final output
    });

    child.on("error", (err) => {
      reject(err.message); // Reject the promise on error
    });
  });
});

// New IPC handler for file selection
ipcMain.handle("select-files", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"], // Allow multiple file selection
  });
  return result.filePaths; // Return the selected file paths
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
