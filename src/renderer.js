// renderer.js
const button = document.getElementById("run-command");
const outputElement = document.getElementById("output");
const selectFilesButton = document.getElementById("select-files");
const selectedFilesElement = document.getElementById("selected-files");

let filePaths;

window.electron.onCommandOutput((data) => {
  console.log(data); // This should log the output
  outputElement.innerHTML += data.replace(/\n/g, "<br>"); // Append the output to the output element with line breaks
  outputElement.scrollTop = outputElement.scrollHeight; // Scroll to the bottom
});

button.addEventListener("click", async () => {
  if (!filePaths) {
    outputElement.textContent = "No files selected";
    return;
  }
  //   const files = filePaths.join(", "); // Get selected files
  const files = selectedFilesElement.textContent
    .trim()
    .split("\n")
    .filter(Boolean); // Get selected files

  const command = "croc";
  console.log(files);
  //   const args = [`send ${files}`];
  const args = ["send", ...files.map((file) => `"${file}"`)];
  console.log("Running command:", command, args.join(" ")); // Log the command

  // Clear previous output
  outputElement.textContent = "";

  // Send the command to the main process
  window.electron.runCommand(command, args);

  // Listen for command output
  window.electron.onCommandOutput((data) => {
    console.log(data);
    outputElement.innerHTML = data.replace(/\n/g, "<br>"); // Append the output to the output element with line breaks
    outputElement.scrollTop = outputElement.scrollHeight;
  });
});

// Handle file selection
selectFilesButton.addEventListener("click", async () => {
  selectedFilesElement.textContent = "Selecting files...";
  try {
    filePaths = await window.electron.selectFiles();
    console.log(String.raw`${filePaths}`);
    selectedFilesElement.textContent = filePaths.join(", "); // Display selected file paths
  } catch (error) {
    selectedFilesElement.textContent = `Error: ${error}`;
  }
});
