import {
  WIN_MINIMIZE_CHANNEL,
  WIN_MAXIMIZE_CHANNEL,
  WIN_CLOSE_CHANNEL,
} from "./window-channels";

export function exposeWindowContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
    maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
    close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL),
  });

  // Expose IPC functions to the renderer process
  contextBridge.exposeInMainWorld('electron', {
    // Single ticket checkout
    checkoutManually: (ticketData: any) => {
      ipcRenderer.send('checkout-manually', ticketData);
    },

    // Bulk ticket checkout
    checkoutManuallyBulk: (ticketsArray: any) => {
      ipcRenderer.send('checkout-manually-bulk', ticketsArray);
    },
    ipcRenderer: {
      on(channel: string, listener: (...args: any[]) => void) {
        // wrap so the raw event is hidden
        const wrapped = (_event: IpcRendererEvent, ...args: any[]) => listener(...args);
        ipcRenderer.on(channel, wrapped);
        // store the wrapped fn so removeListener can find it if needed
        return wrapped;
      },
      removeListener(channel: string, listener: (...args: any[]) => void) {
        ipcRenderer.removeListener(channel, listener);
      },
      send(channel: string, ...args: any[]) {
        ipcRenderer.send(channel, ...args);
      },
      invoke<T>(channel: string, ...args: any[]) {
        return ipcRenderer.invoke<T>(channel, ...args);
      },
    }
  });
}
