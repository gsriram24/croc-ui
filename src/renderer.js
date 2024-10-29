document.getElementById("runCommand").addEventListener("click", () => {
  const command = document.getElementById("commandInput").value;
  // Clear previous output
  document.getElementById("output").textContent = "";
  window.electronAPI.runCommand(command);
});

window.electronAPI.onCommandOutput((data) => {
  const outputElement = document.getElementById("output");

  if (data.error) {
    // Handle error
    outputElement.innerHTML += `<span style="color: red">${data.error}</span>\n`;
  } else if (data.output) {
    // Handle regular output
    outputElement.innerHTML += `${data.output}\n`;
  } else if (data.status === "finished") {
    // Handle process completion
    outputElement.innerHTML += `\nProcess finished with code ${data.code}\n`;
  }

  // Auto-scroll to bottom
  outputElement.scrollTop = outputElement.scrollHeight;
});
