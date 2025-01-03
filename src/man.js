let db;
import path, { resolve } from 'path'
import lowdb from 'lowdb';
import fileSync from 'lowdb/adapters/FileSync';
import fetch from 'electron-fetch';
import fs from 'fs'
import AbortController from 'abort-controller'
import stream from 'stream'
import pipe from 'promisified-pipe'
import { promisify } from 'util';
import { exec } from 'child_process';
import { ipcMain, BrowserWindow, session } from 'electron';
let win = BrowserWindow.getAllWindows()[0];

let execPromise = promisify(exec);
// const pipelineAsync = promisify(pipeline);

var playlist = [], index = 0, hmap = [];
var nowIndex = -1, playLock = false;

var init = () => {
    const adapter = new fileSync('./db.json')
    db = lowdb(adapter)
    db = new lowdb(adapter);
    db.read();
    db.defaults({index: 0, nowIndex: -1, playlist: [], hmap: []}).write();
    playlist = db.get('playlist').value();
    index = db.get('index').value();
    hmap = db.get('hmap').value();
    nowIndex = db.get('nowIndex').value();
    console.log(playlist, index, hmap);
}

var updateDB = () => {
    db.set('index', index)
    .set('playlist', playlist)
    .set('hmap', hmap)
    .set('nowIndex', nowIndex)
    .write();
}

var add = (uid, name) => {
    uid = new String(uid);
    playlist.push({id: index + 1, uid: uid, name: name});
    index ++;
    updateDB();
    freshUI();
    setTimeout(()=>{
        console.log('trying to cache the next song');
        var next = findNext(nowIndex);
        if (next == -1) return false;
        startCache(playlist[next].uid, 0, ()=>{})
    }, 5*1000)
}

var del = (id) => {
    if (id == nowIndex) return false;
    var loc = findID(id);
    if (loc != -1){
        playlist.splice(loc, 1);
        updateDB();
        freshUI();
    }
}

//return Location
var findID = (id) => {
    for (var i=0;i<playlist.length;++i){
        if (playlist[i].id == id) return i;
    }
    return -1;
}

//return Location
var findNext = (id) => {
    for (var i=0;i<playlist.length;++i){
        if (playlist[i].id > id) return i;
    }
    return -1;
}

var getDetail = (uid) => {
    //call API
}

var isCaching = false, cachingUID = 0, cachingPriority = 0, abortLock = false, cachingCB;
var ac;
var headers = {"User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"};

var startCache = async (uid, priority, cb) => {
    uid = String(uid);
    if (abortLock){
        return cb(null, null);
    }
    if (isCaching && cachingUID != uid) {
        if (priority < cachingPriority){
            cb(null, null);
            return false;
        }
        abortLock = true;
        //stopCaching
        console.log("trying stopping the previous cache task ", cachingUID);
        console.log()
        cachingUID = uid;
        var waitForAbort = () => new Promise((resolve, reject) => {
            ac.abort();
            var it = setInterval(() => {
                if (isCaching == false){
                    clearInterval(it);
                    resolve();
                }
            }, 50);
        });
        await waitForAbort();
        abortLock = false;
    }
    if (isCaching && cachingUID == uid) {
        if (cachingPriority == 0){
            cachingCB(null, null);
            cachingCB = cb;
        }else{
            cb(null, null);
        }
        return false;
    }
    console.log(hmap, uid, hmap.includes(uid));
    if (!hmap.includes(uid)){
        isCaching = true, cachingUID = uid, cachingPriority = priority, cachingCB = cb;
        ac = new AbortController();
        //TODO: cache main

        //debug1
        try{
            var res = await pfetch("http://localhost:3000/song/url?id=" + uid);
            // console.log(res)
            var {url, type} = res.data[0];
            var rawPath = path.join(__dirname, "cache."+type);
            var dest = fs.createWriteStream(rawPath);
            console.log("Download start");
            await fetch(url, {headers: headers, signal: ac.signal, timeout: 30000}).then(res => {
                ac.signal.addEventListener('abort', () => {
                    res.body.destroy(new Error("abort"));
                    dest.destroy(new Error("abort"));
                })
                return pipe(res.body, dest)
            });
            console.log("Download OK");

            try{fs.mkdirSync(path.join(__dirname, '..', 'cache', uid));}catch(e){};
            console.log("Coverting start");
            var rawPath = path.join(__dirname, "cache."+type);
            var sh1 = `ffmpeg -y -i ${JSON.stringify(rawPath)} ${JSON.stringify(path.join(__dirname, '..', 'cache', uid, 'proc.wav'))}`;
            var { stdout, stderr } = await execPromise(sh1, {signal: ac.signal});
            console.log(stdout, stderr);
            console.log("Coverting OK");

            console.log("Splitting start");
            var sh2 = `python inference.py --gpu 0 --input ${JSON.stringify(path.join(__dirname, '..', 'cache', uid, 'proc.wav'))} --output_dir ${JSON.stringify(path.join(__dirname, '..', 'cache', uid))}`
            var { stdout, stderr } = await execPromise(sh2, {cwd: "D:\\vocal-remover\\", signal: ac.signal});
            console.log(stdout, stderr);
            console.log("Splitting OK");

            hmap.push(uid);
            updateDB();
        }catch(e){
            console.error(e);
            isCaching = false;
            cb(null, null); //fake callback function
            return false;
        }
        if (!ac || !ac.signal.aborted) cachingCB(path.join(__dirname, '..', 'cache', uid, 'proc_Instruments.wav'), path.join(__dirname, '..', 'cache', uid, 'proc_Vocals.wav'));
    } else {
        if (!ac || !ac.signal.aborted) cb(path.join(__dirname, '..', 'cache', uid, 'proc_Instruments.wav'), path.join(__dirname, '..', 'cache', uid, 'proc_Vocals.wav'));
    }
    isCaching = false;
    return true;
}

// playNext
// playLock

// var timeStamp;

var play = async (id, priority) => {
    if (!priority) priority = 0; //priority: 0.auto(default for offline cache) 1.playNext(trigger by player) 2.forcePlay(trigger by user)
    // timeStamp = new Date();
    // console.log(timeStamp)
    // var cts = timeStamp;
    var loc = findID(id);
    if (loc == -1){
        throw new Error('id not found');
    }
    var uid = String(playlist[loc].uid);
    console.log(playlist[loc], 'start playing');
    // debug2
    var res = await pfetch("http://localhost:3000/song/detail?ids=" + uid);
    // console.log(res)
    var detail = res.songs[0];
    var lrc = (await pfetch("http://localhost:3000/lyric?id=" + uid));
    // console.log(detail);
    var det = {
        name: detail.name,
        artist: detail.ar.map(ar => ar.name).join('/'),
        cover: (detail.al && detail.al.id!=0 && detail.al.picUrl) ? detail.al.picUrl : "TODO",
        lrc: lrc.lrc.lyric,
        tlrc: (lrc.tlyric && lrc.tlyric.lyric) ? lrc.tlyric.lyric : ""
    }
    // console.log(det)
    // playLock = false;
    //call cache
    // if (cts != timeStamp) return false;
    win.webContents.send('startLoading');
    list.webContents.send('startLoading');
    startCache(uid, priority, (r, h) => {
        if (r == null) return false;
        // if (cts != timeStamp) return false;
        nowIndex = id;
        updateDB();
        freshUI();
        det.source = 'atom:///' + r;
        det.sourceH = 'atom:///' + h;
        console.log(det);
        win.webContents.send('finishLoading');
        list.webContents.send('finishLoading');
        win.webContents.send("newSong", det);
        setTimeout(()=>{
            console.log('trying to cache the next song');
            var next = findNext(nowIndex);
            if (next == -1) return false;
            startCache(playlist[next].uid, 0, ()=>{})
        }, 15*1000)
    });
    //play
}

var playNext = () => {
    var loc = findNext(nowIndex);
    if (loc == -1) return false;
    var id = playlist[loc].id;
    play(id, 1); //playNext
}

var freshUI = () => {
    list.webContents.send("freshList", {playlist, nowIndex});
}

init();
ipcMain.on('loadFinish', ()=>{
    pfetch("http://localhost:3000/login/status").then(console.log)
})
ipcMain.on('addNewSong', (event, arg) => {
    var {uid, name} = arg;
    uid = String(uid);
    add(uid, name);
})
ipcMain.on('playSong', (event, arg) => {
    var {uid, name} = arg;
    uid = String(uid);
    console.log(uid)
    add(uid, name);
    play(index, 2);
})
ipcMain.on('playID', (event, id) => {
    play(id, 2);
})
ipcMain.on('deleteID', (event, id) => {
    del(id);
})
ipcMain.on('askFresh', (event) => {
    freshUI();
})
ipcMain.on('playNext', () => {
    playNext();
})

//create proxy window
let proxy;
(()=>{
    proxy = new BrowserWindow({
    width: 960,
    height: 1080,
    fullscreenable: true,
    show: true,
    webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        preload: path.join(__dirname, 'preload.js'),
    }
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        proxy.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'proxy')
        .then(()=>{
            // if (!process.env.IS_TEST) proxy.webContents.openDevTools()
            //debug
            // play(2);
            // setInterval(()=>{
            //     playNext();
            // }, 120*1000)
        })
    } else {
        // createProtocol('app')
        proxy.loadURL('app://./proxy.html')
    }
})();
//create proxy window end
//create list window
let list;
(()=>{
    list = new BrowserWindow({
    width: 960,
    height: 1080,
    fullscreenable: true,
    show: true,
    webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        preload: path.join(__dirname, 'preload.js'),
    }
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        list.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'list')
        .then(()=>{
            // if (!process.env.IS_TEST) list.webContents.openDevTools()
        })
    } else {
        // createProtocol('app')
        list.loadURL('app://./list.html')
    }
})();
//create list window end

let login;
(() => {
    login = new BrowserWindow({
        width: 960,
        height: 1080,
        fullscreenable: true,
        show: true,
        webPreferences: {
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    login.loadURL('http://localhost:3000/qrlogin.html')
})();

setTimeout(()=>{
    freshUI();
}, 6000)

const ts = () => {
    return Date.now();
}

var pid = 0;
const pfetch = (url) => {
    var st = `${ts()}.${pid++}`;
    console.log(st);
    proxy.webContents.send('proReq', {id: st, url: url});
    return new Promise((resolve, reject) => {
        ipcMain.once(`proRes.${st}`, (event, data)=>{
            if (data == null) reject("Network Error");
            else resolve(data);
        })
    })
}