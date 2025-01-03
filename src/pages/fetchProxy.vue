<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <div class="d-flex align-center">
                <v-toolbar-title>
                    <span>点歌台</span>
                </v-toolbar-title>
            </div>
        </v-app-bar>
        <v-main>
            <v-container style="max-width: 800px;">
                <v-row align="start" justify="center">
                    <v-col cols="11" class="mt-5 pb-0">
                        <v-text-field v-model="key" append-outer-icon="mdi-magnify" clear-icon="mdi-close-circle"
                            clearable label="搜索" type="text" @click:append-outer="sendMessage" outlined
                            @click:clear="clearMessage"></v-text-field>
                    </v-col>
                    <v-col cols="11" class="pt-0 mx-0 px-0">
                        <div v-if="data.length > 0" class="py-4 px-0 text-body-2">
                            <div class="px-0">
                                <v-row class="py-2">
                                    <v-col cols="6" class="text-truncate pr-0">
                                        歌曲名
                                    </v-col>
                                    <v-col cols="4" class="text-truncate px-0">
                                        歌手
                                    </v-col>
                                    <v-col cols="2" class="text-truncate pl-0">
                                        操作
                                    </v-col>
                                </v-row>
                                <v-divider class="px-0"></v-divider>
                            </div>
                            <div class="px-0" v-for="(item, index) in data" :key="item.id">
                                <v-row class="py-2">
                                    <v-col cols="6" class="pr-0">
                                        {{ item.name }}
                                    </v-col>
                                    <v-col cols="4" class="px-0">
                                        {{ item.ar }}
                                    </v-col>
                                    <v-col cols="2" class="pl-0">
                                        <!-- <v-icon color="primary" @click="play(index)">mdi-play</v-icon> -->
                                        <v-icon color="primary" @click="add(index)">mdi-plus</v-icon>
                                    </v-col>
                                </v-row>
                                <v-divider class="px-0"></v-divider>
                            </div>
                        </div>
                    </v-col>
                </v-row>
                <div class="text-center">
                    <v-overlay :value="overlay" z-index="1000">
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                    </v-overlay>
                </div>
                <v-dialog v-model="dialog" persistent max-width="390">
                    <v-card>
                        <v-card-title class="pt-5 headline">
                            确认添加
                        </v-card-title>
                        <v-card-text>
                            即将添加该歌曲进入歌单。<br />
                            请注意，歌曲一经添加只能在播放器中删除，请确认无误后点击确定按钮，否则请取消。
                        </v-card-text>
                        <v-card-actions class="pa-4">
                            <v-spacer></v-spacer>
                            <v-btn color="red" tile text>
                                确定
                            </v-btn>
                            <v-btn color="primary">
                                取消
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog :value="url.length>0" persistent max-width="390">
                    <v-card>
                        <v-card-title class="pt-5 headline">
                            不受支持的浏览器
                        </v-card-title>
                        <v-card-text>
                            本页面部分特性不受qq、微信内置浏览器支持，
                            请将下列网址复制到手机浏览器中打开。<br/>
                            <v-text-field disabled :value="url"></v-text-field>
                        </v-card-text>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="loading" max-width="390">
                    <v-card>
                        <v-card-title class="pt-5 headline">添加完成</v-card-title>
                        <v-card-text>
                            请注意查看播放列表变动
                        </v-card-text>
                    </v-card>
                </v-dialog>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    components: {
    },
    data: () => ({
        key: "",
        data: [
        ],
        overlay: false,
        dialog: false,
        url:"",
        loading: false
    }),
    methods: {
        clearMessage() {
            this.key = ''
        },
        sendMessage() {
            console.log(this.key)
            var key = this.key;
            this.overlay = true;
            fetch('http://localhost:3000/cloudsearch?keywords='+encodeURIComponent(key), { credentials: 'include' }).then(res => res.json()).then(d => {
                var s = d.result.songs;
                var data = [];
                for (var i=0;i<s.length;++i){
                    var arr = s[i].ar.map(ar => ar.name);
                    data.push({name: s[i].name, ar: arr.join('/'), id: s[i].id})
                }
                this.data = data;
                this.overlay = false;
            }).catch(e => {
                alert('我们遇到了错误，错误代码：'+e);
            });
        },
        play(id){
            window.ipcRenderer.send("playSong", {uid: this.data[id].id, name: this.data[id].name});
        },
        add(id){
            this.loading = true;
            window.ipcRenderer.send("addNewSong", {uid: this.data[id].id, name: this.data[id].name});
        }
    },
    mounted(){
        window.$fromWechat = navigator.userAgent.toLocaleLowerCase().indexOf("micromessenger") > -1;
        window.$fromQQ =navigator.userAgent.indexOf("MQQBrowser") > -1 || navigator.userAgent.indexOf("QQTheme") > -1;
        if (window.$fromWechat || window.$fromQQ){
            this.url = window.location.href;
        }
        window.ipcRenderer.receive('proReq', (r)=>{
            fetch(r.url, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                window.ipcRenderer.send(`proRes.${r.id}`, data)
            })
            .catch(e => window.ipcRenderer.send(`proRes.${r.id}`, null))
        });
    },
};
</script>

<style>
.heading {
    background: linear-gradient(
            to bottom,
            transparent 60%,
            rgba(97, 159, 198, 0.612) 0
        )
        no-repeat;
}
html,
body {
    margin: 0;
    padding: 0;
}

::-webkit-scrollbar {
    display: none;
}

* {
    user-select: none;
    -webkit-touch-callout: none;
}

#app,
.container,
.row {
    min-height: 100%;
}
</style>