<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <div class="d-flex align-center">
                <v-toolbar-title>
                    <span>播放列表</span>
                </v-toolbar-title>
            </div>
        </v-app-bar>
        <v-main>
            <v-container style="max-width: 800px;">
                <v-row align="start" justify="center">
                    <v-col cols="11" class="mt-5 pb-0">
                            <div class="px-0" v-for="(item, index) in list" :key="item.id">
                                <v-row class="py-2">
                                    <v-col cols="10" class="pr-0" :class="{'primary--text': item.id == nowIndex}">
                                        {{ item.name }}
                                    </v-col>
                                    <v-col cols="2" class="pl-0">
                                        <v-icon color="primary" @click="play(item.id)">mdi-play</v-icon>
                                        <v-icon color="primary" @click="del(item.id)">mdi-delete</v-icon>
                                    </v-col>
                                </v-row>
                                <v-divider class="px-0"></v-divider>
                            </div>
                    </v-col>
                </v-row>
            </v-container>
            <v-dialog :value="loading > 0" persistent max-width="390">
                <v-card>
                    <v-card-title class="pt-5 headline">预加载中</v-card-title>
                    <v-card-text>
                        正在预加载音频资源，SQ或Hi-Res资源大约需要20秒<br />
                        将音乐提前加入歌单可使预加载过程在后台完成以节约时间
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    components: {
    },
    data: () => ({
        list: [],
        nowIndex: -1,
        loading: false
    }),
    methods: {
        play(id){
            window.ipcRenderer.send('playID', id)
        },
        del(id){
            window.ipcRenderer.send('deleteID', id)
        }
    },
    mounted(){
        window.$fromWechat = navigator.userAgent.toLocaleLowerCase().indexOf("micromessenger") > -1;
        window.$fromQQ =navigator.userAgent.indexOf("MQQBrowser") > -1 || navigator.userAgent.indexOf("QQTheme") > -1;
        if (window.$fromWechat || window.$fromQQ){
            this.url = window.location.href;
        }
        window.ipcRenderer.send('askFresh');
        window.ipcRenderer.receive('freshList', (d)=>{
            console.log("OK")
            this.list = d.playlist;
            this.nowIndex = d.nowIndex;
            console.log(this.list)
        })
        window.ipcRenderer.receive('startLoading', () => {
            this.loading ++;
        });
        window.ipcRenderer.receive('finishLoading', () => {
            this.loading --;
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