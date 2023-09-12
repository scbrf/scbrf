import api from "./be/api";
import { setMenu } from "./be/menu";
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

Object.keys(api).forEach((name) => {
  ipcMain.handle(name, api[name]);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  setMenu();
  const mainWindow = new BrowserWindow({
    minWidth: 840,
    minHeight: 600,
    transparency: true,
    backgroundColor: "#00000000",
    vibrancy: "under-window",
    visualEffectState: "followWindow",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
