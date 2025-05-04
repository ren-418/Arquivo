import { app, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";

import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

function createWindow() {
  // Always use the built preload script
  const preload = path.join(process.cwd(), "dist/preload/preload.js");

  console.log('Electron main __dirname:', __dirname);
  console.log('Electron main process.cwd():', process.cwd());
  console.log('Preload script path:', preload);

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      devTools: true, // Enable devtools for debugging
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
  });

  registerListeners(mainWindow);

  // Always load the built HTML file
  mainWindow.loadFile(path.join(process.cwd(), "renderer/main_window/index.html"));
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch (err) {
    console.error("Failed to install extensions:", err);
  }
}

// Only run Electron-specific code if we're in an Electron environment
if (process.versions.electron) {
  app.whenReady().then(createWindow).then(installExtensions);

  // Quit when all windows are closed, except on macOS
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
}
//osX only ends

const pkg = require(path.join(process.cwd(), 'package.json'));
