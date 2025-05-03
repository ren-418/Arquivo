import {
  THEME_MODE_CURRENT_CHANNEL,
  THEME_MODE_DARK_CHANNEL,
  THEME_MODE_LIGHT_CHANNEL,
  THEME_MODE_SYSTEM_CHANNEL,
  THEME_MODE_TOGGLE_CHANNEL,
} from "./theme-channels";

export function exposeThemeContext() {
  try {
    // Check if we're in an Electron environment
    if (typeof window.require === 'function') {
      const { contextBridge, ipcRenderer } = window.require("electron");
      
      // Ensure we're not exposing the API multiple times
      if (!window.themeMode) {
        contextBridge.exposeInMainWorld("themeMode", {
          current: () => ipcRenderer.invoke(THEME_MODE_CURRENT_CHANNEL),
          toggle: () => ipcRenderer.invoke(THEME_MODE_TOGGLE_CHANNEL),
          dark: () => ipcRenderer.invoke(THEME_MODE_DARK_CHANNEL),
          light: () => ipcRenderer.invoke(THEME_MODE_LIGHT_CHANNEL),
          system: () => ipcRenderer.invoke(THEME_MODE_SYSTEM_CHANNEL),
        });
      }
    } else {
      console.warn('Not in an Electron environment, theme mode will be limited');
    }
  } catch (error) {
    console.error('Error exposing theme context:', error);
  }
}
