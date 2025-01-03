import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['playFinish', 'loadFinish', 'addNewSong', 'playSong', 'playID', 'deleteID', 'askFresh', 'playNext']
    // console.log("receive");
    if (validChannels.includes(channel) || channel.indexOf("proRes")==0) {
      // console.log(data)
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    let validChannels = ['newSong', 'proReq', 'freshList', 'startLoading', 'finishLoading']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})