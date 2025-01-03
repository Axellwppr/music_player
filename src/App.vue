<template>
    <v-app>
        <v-main>
            <div style="position: absolute;height: 100%;width: 100%;overflow-y: hidden;z-index: -2;">
                <div class="bg" :style="{ backgroundImage: `url(${currentTrack.cover})` }"></div>
            </div>
            <div class="mask"></div>
            <div style="display: flex;background-color:transparent;">
                <div class="wrapper" style="display: flex;flex-direction: column;width: 50%">
                    <!-- <div class="qr mb-6" style="height: 150px;"></div> -->
                    <div class="player">
                        <div class="player__top">
                            <div class="player-cover">
                                <div class="player-cover__item"
                                    :style="{ backgroundImage: `url(${currentTrack.cover})` }"></div>
                            </div>
                            <div class="player-controls">
                                <div style=" visibility: hidden" class="player-controls__item -favorite">
                                    <svg class="icon">
                                        <use xlink:href="#icon-heart-o"></use>
                                    </svg>
                                </div>
                                <a class="player-controls__item" @click="setting = 1">
                                    <svg class="icon">
                                        <use xlink:href="#icon-heart"></use>
                                    </svg>
                                </a>
                                <div class="player-controls__item">
                                    <svg class="icon">
                                        <use xlink:href="#icon-prev"></use>
                                    </svg>
                                </div>
                                <div class="player-controls__item">
                                    <svg class="icon">
                                        <use xlink:href="#icon-next"></use>
                                    </svg>
                                </div>
                                <div class="player-controls__item -xl js-play" @click="play">
                                    <svg class="icon">
                                        <use xlink:href="#icon-pause" v-if="isTimerPlaying"></use>
                                        <use xlink:href="#icon-play" v-else></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="progress" ref="progress">
                            <div class="progress__top">
                                <div class="album-info" v-if="currentTrack">
                                    <div class="album-info__name">{{ currentTrack.artist }}</div>
                                    <div class="album-info__track">{{ currentTrack.name }}</div>
                                </div>
                                <div class="progress__duration">{{ duration }}</div>
                            </div>
                            <div class="progress__bar" @click="clickProgress">
                                <div class="progress__current" :style="{ width: barWidth }"></div>
                            </div>
                            <div class="progress__time">{{ currentTime }}</div>
                        </div>
                        <div v-cloak></div>
                    </div>
                </div>
                <div style="width: 50%;">
                    <v-row class="height: 100%; pr-16" align="center">
                        <v-col
                            style="height: 700px;overflow-y: scroll;-webkit-mask-image: linear-gradient(180deg,hsla(0,0%,100%,0) 0,hsla(0,0%,100%,.6) 15%,#fff 25%,#fff 75%,hsla(0,0%,100%,.6) 85%,hsla(0,0%,100%,0));"
                            ref="lrc">
                            <div class="text-h5 mb-3">
                                <div style="height: 200px"></div>
                                <p v-for="(l, index) in lyric" :key="index"
                                    :class="index == highlight ? 'text-h3 mb-8 mt-8' : ''"
                                    :style="index == highlight ? 'color:rgba(255,255,255)' : 'color:rgba(255,255,255,.8)'">
                                    {{ l.main }}<font v-if="l.sub" class="text-h5"><br />{{ l.sub }}</font>
                                </p>
                                <div style="height: 200px"></div>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </div>
            <v-dialog v-model="setting" max-width="390">
                <v-card>
                    <v-card-title class="pt-5 headline">
                        音量调节
                    </v-card-title>
                    <v-card-text>
                        <v-slider step="1" label="人声" dense v-model="vocal" @change="chgV()"></v-slider>
                        <v-slider step="1" label="背景" dense v-model="backg" @change="chgB()"></v-slider>
                    </v-card-text>
                </v-card>
            </v-dialog>
            <v-dialog :value="loading>0" persistent max-width="390">
                <v-card>
                    <v-card-title class="pt-5 headline">预加载中</v-card-title>
                    <v-card-text>
                        正在预加载音频资源，SQ或Hi-Res资源大约需要20秒<br />
                        将音乐提前加入歌单可使预加载过程在后台完成以节约时间
                    </v-card-text>
                </v-card>
            </v-dialog>
            <svg xmlns="http://www.w3.org/2000/svg" hidden xmlns:xlink="http://www.w3.org/1999/xlink">
                <defs>
                    <symbol id="icon-heart-o" viewBox="0 0 32 32">
                        <title>icon-heart-o</title>
                        <path
                            d="M22.88 1.952c-2.72 0-5.184 1.28-6.88 3.456-1.696-2.176-4.16-3.456-6.88-3.456-4.48 0-9.024 3.648-9.024 10.592 0 7.232 7.776 12.704 15.072 17.248 0.256 0.16 0.544 0.256 0.832 0.256s0.576-0.096 0.832-0.256c7.296-4.544 15.072-10.016 15.072-17.248 0-6.944-4.544-10.592-9.024-10.592zM16 26.56c-4.864-3.072-12.736-8.288-12.736-14.016 0-5.088 3.040-7.424 5.824-7.424 2.368 0 4.384 1.504 5.408 4.032 0.256 0.608 0.832 0.992 1.472 0.992s1.248-0.384 1.472-0.992c1.024-2.528 3.040-4.032 5.408-4.032 2.816 0 5.824 2.304 5.824 7.424 0.064 5.728-7.808 10.976-12.672 14.016z">
                        </path>
                        <path
                            d="M16 30.144c-0.32 0-0.64-0.096-0.896-0.256-7.296-4.576-15.104-10.048-15.104-17.344 0-7.008 4.576-10.688 9.12-10.688 2.656 0 5.152 1.216 6.88 3.392 1.728-2.144 4.224-3.392 6.88-3.392 4.544 0 9.12 3.68 9.12 10.688 0 7.296-7.808 12.768-15.104 17.344-0.256 0.16-0.576 0.256-0.896 0.256zM9.12 2.048c-4.448 0-8.928 3.616-8.928 10.496 0 7.168 7.744 12.64 15.008 17.152 0.48 0.288 1.12 0.288 1.568 0 7.264-4.544 15.008-9.984 15.008-17.152 0-6.88-4.48-10.496-8.928-10.496-2.656 0-5.088 1.216-6.816 3.392l-0.032 0.128-0.064-0.096c-1.696-2.176-4.192-3.424-6.816-3.424zM16 26.688l-0.064-0.032c-3.808-2.4-12.768-8.032-12.768-14.112 0-5.152 3.072-7.52 5.952-7.52 2.432 0 4.48 1.536 5.504 4.096 0.224 0.576 0.768 0.928 1.376 0.928s1.152-0.384 1.376-0.928c1.024-2.56 3.072-4.096 5.504-4.096 2.848 0 5.952 2.336 5.952 7.52 0 6.080-8.96 11.712-12.768 14.112l-0.064 0.032zM9.12 5.248c-2.752 0-5.728 2.304-5.728 7.328 0 5.952 8.8 11.488 12.608 13.92 3.808-2.4 12.608-7.968 12.608-13.92 0-5.024-2.976-7.328-5.728-7.328-2.336 0-4.32 1.472-5.312 3.968-0.256 0.64-0.864 1.056-1.568 1.056s-1.312-0.416-1.568-1.056c-0.992-2.496-2.976-3.968-5.312-3.968z">
                        </path>
                        <path
                            d="M6.816 20.704c0.384 0.288 0.512 0.704 0.48 1.12 0.224 0.256 0.384 0.608 0.384 0.96 0 0.032 0 0.032 0 0.064 0.16 0.128 0.32 0.256 0.48 0.384 0.128 0.064 0.256 0.16 0.384 0.256 0.096 0.064 0.192 0.16 0.256 0.224 0.8 0.576 1.632 1.12 2.496 1.664 0.416 0.128 0.8 0.256 1.056 0.32 1.984 0.576 4.064 0.8 6.112 0.928 2.688-1.92 5.312-3.904 8-5.792 0.896-1.088 1.92-2.080 2.912-3.104v-7.552c-0.096-0.128-0.192-0.288-0.32-0.416-0.768-1.024-1.184-2.176-1.6-3.296-0.768-0.416-1.536-0.8-2.336-1.12-0.128-0.064-0.256-0.096-0.384-0.16h-21.568v12.992c1.312 0.672 2.496 1.6 3.648 2.528z">
                        </path>
                    </symbol>
                    <symbol id="icon-heart" viewBox="0 0 1024 1024">
                        <title>icon-heart</title>
                        <path
                            d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088l-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36l-116.224-25.088l-65.28 113.152l79.68 88.192l-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136l-79.808 88.192l65.344 113.152l116.224-25.024l22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152l24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296l116.288 25.024l65.28-113.152l-79.744-88.192l1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136l79.808-88.128l-65.344-113.152l-116.288 24.96l-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384a192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256a128 128 0 0 0 0-256z" />
                        <!-- <path fill="currentColor" d="m924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1c0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1l74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3l-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2l-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9l-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5l-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5c0-15.3 1.2-30.6 3.7-45.5l6.5-40l-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2l31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3l17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97l38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8l92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176s176-78.8 176-176s-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z"/>           -->\
                    </symbol>
                    <symbol id="icon-infinity" viewBox="0 0 32 32">
                        <title>icon-infinity</title>
                        <path
                            d="M29.312 20.832c-1.28 1.28-3.008 1.984-4.832 1.984s-3.52-0.704-4.832-1.984c-0.032-0.032-0.224-0.224-0.256-0.256v0 1.28c0 0.448-0.352 0.8-0.8 0.8s-0.8-0.352-0.8-0.8v-3.168c0-0.448 0.352-0.8 0.8-0.8h3.168c0.448 0 0.8 0.352 0.8 0.8s-0.352 0.8-0.8 0.8h-1.28c0.032 0.032 0.224 0.224 0.256 0.256 0.992 0.992 2.304 1.536 3.68 1.536 1.408 0 2.72-0.544 3.68-1.536 0.992-0.992 1.536-2.304 1.536-3.68s-0.544-2.72-1.536-3.68c-0.992-0.992-2.304-1.536-3.68-1.536-1.408 0-2.72 0.544-3.68 1.536l-8.416 8.448c-1.312 1.312-3.072 1.984-4.832 1.984s-3.488-0.672-4.832-1.984c-2.656-2.656-2.656-6.976 0-9.632s6.976-2.656 9.632 0c0.032 0.032 0.16 0.16 0.192 0.192l0.064 0.064v-1.28c0-0.448 0.352-0.8 0.8-0.8s0.8 0.352 0.8 0.8v3.168c0 0.448-0.352 0.8-0.8 0.8h-3.168c-0.448 0-0.8-0.352-0.8-0.8s0.352-0.8 0.8-0.8h1.28l-0.096-0.064c-0.032-0.032-0.16-0.16-0.192-0.192-0.992-0.992-2.304-1.536-3.68-1.536s-2.72 0.544-3.68 1.536c-2.048 2.048-2.048 5.344 0 7.392 0.992 0.992 2.304 1.536 3.68 1.536s2.72-0.544 3.68-1.536l8.512-8.512c1.28-1.28 3.008-1.984 4.832-1.984s3.52 0.704 4.832 1.984c2.624 2.656 2.624 7.008-0.032 9.664z">
                        </path>
                        <path
                            d="M24.512 23.488c-1.6 0-3.136-0.512-4.416-1.44-0.128 0.704-0.736 1.248-1.44 1.248-0.8 0-1.472-0.672-1.472-1.472v-3.168c0-0.8 0.672-1.472 1.472-1.472h3.168c0.8 0 1.472 0.672 1.472 1.472 0 0.608-0.384 1.152-0.928 1.376 0.64 0.352 1.376 0.544 2.144 0.544 1.216 0 2.368-0.48 3.2-1.344 0.864-0.864 1.344-1.984 1.344-3.2s-0.48-2.368-1.344-3.2c-0.864-0.864-1.984-1.344-3.2-1.344s-2.368 0.48-3.2 1.344l-8.512 8.48c-1.408 1.408-3.296 2.176-5.312 2.176s-3.872-0.768-5.312-2.176c-2.912-2.912-2.912-7.68 0-10.592 1.408-1.408 3.296-2.176 5.312-2.176 0 0 0 0 0 0 1.6 0 3.136 0.512 4.416 1.44 0.128-0.704 0.736-1.248 1.472-1.248 0.8 0 1.472 0.672 1.472 1.472v3.168c0 0.8-0.672 1.472-1.472 1.472h-3.168c-0.8 0-1.472-0.672-1.472-1.472 0-0.608 0.384-1.152 0.928-1.376-0.64-0.352-1.376-0.544-2.144-0.544-1.216 0-2.368 0.48-3.2 1.344-1.76 1.76-1.76 4.64 0 6.432 0.864 0.864 2.016 1.344 3.2 1.344 1.216 0 2.368-0.48 3.2-1.344l8.48-8.544c1.408-1.408 3.296-2.208 5.312-2.208s3.872 0.768 5.312 2.208c1.408 1.408 2.176 3.296 2.176 5.312s-0.768 3.872-2.208 5.312v0c0 0 0 0 0 0-1.408 1.408-3.296 2.176-5.28 2.176zM18.752 18.912l1.44 1.44c1.152 1.152 2.688 1.792 4.32 1.792s3.168-0.64 4.32-1.792v0c1.152-1.152 1.792-2.688 1.792-4.32s-0.64-3.168-1.792-4.32c-1.152-1.152-2.688-1.792-4.352-1.792-1.632 0-3.168 0.64-4.32 1.792l-8.48 8.448c-1.12 1.12-2.592 1.728-4.16 1.728s-3.072-0.608-4.16-1.728c-2.304-2.304-2.304-6.048 0-8.352 1.12-1.12 2.592-1.728 4.16-1.728s3.072 0.608 4.16 1.728l1.44 1.408h-2.912c-0.064 0-0.128 0.064-0.128 0.128s0.064 0.128 0.128 0.128h3.168c0.064 0 0.128-0.064 0.128-0.128v-3.168c0-0.064-0.064-0.128-0.128-0.128s-0.128 0.064-0.128 0.128v2.912l-1.408-1.408c-1.152-1.152-2.688-1.792-4.352-1.792-1.632 0-3.168 0.64-4.32 1.792-2.4 2.4-2.4 6.272 0 8.672 1.152 1.152 2.688 1.792 4.32 1.792s3.168-0.64 4.32-1.792l8.512-8.512c1.12-1.12 2.592-1.728 4.16-1.728s3.072 0.608 4.16 1.728c1.12 1.12 1.728 2.592 1.728 4.16s-0.608 3.072-1.728 4.16c-1.12 1.12-2.592 1.728-4.16 1.728s-3.072-0.608-4.16-1.728l-1.408-1.408h2.912c0.064 0 0.128-0.064 0.128-0.128s-0.064-0.128-0.128-0.128h-3.168c-0.064 0-0.128 0.064-0.128 0.128v3.168c0 0.064 0.064 0.128 0.128 0.128s0.128-0.064 0.128-0.128v-2.88z">
                        </path>
                    </symbol>
                    <symbol id="icon-pause" viewBox="0 0 32 32">
                        <title>icon-pause</title>
                        <path
                            d="M16 0.32c-8.64 0-15.68 7.040-15.68 15.68s7.040 15.68 15.68 15.68 15.68-7.040 15.68-15.68-7.040-15.68-15.68-15.68zM16 29.216c-7.296 0-13.216-5.92-13.216-13.216s5.92-13.216 13.216-13.216 13.216 5.92 13.216 13.216-5.92 13.216-13.216 13.216z">
                        </path>
                        <path
                            d="M16 32c-8.832 0-16-7.168-16-16s7.168-16 16-16 16 7.168 16 16-7.168 16-16 16zM16 0.672c-8.448 0-15.328 6.88-15.328 15.328s6.88 15.328 15.328 15.328c8.448 0 15.328-6.88 15.328-15.328s-6.88-15.328-15.328-15.328zM16 29.568c-7.488 0-13.568-6.080-13.568-13.568s6.080-13.568 13.568-13.568c7.488 0 13.568 6.080 13.568 13.568s-6.080 13.568-13.568 13.568zM16 3.104c-7.104 0-12.896 5.792-12.896 12.896s5.792 12.896 12.896 12.896c7.104 0 12.896-5.792 12.896-12.896s-5.792-12.896-12.896-12.896z">
                        </path>
                        <path
                            d="M12.16 22.336v0c-0.896 0-1.6-0.704-1.6-1.6v-9.472c0-0.896 0.704-1.6 1.6-1.6v0c0.896 0 1.6 0.704 1.6 1.6v9.504c0 0.864-0.704 1.568-1.6 1.568z">
                        </path>
                        <path
                            d="M19.84 22.336v0c-0.896 0-1.6-0.704-1.6-1.6v-9.472c0-0.896 0.704-1.6 1.6-1.6v0c0.896 0 1.6 0.704 1.6 1.6v9.504c0 0.864-0.704 1.568-1.6 1.568z">
                        </path>
                    </symbol>
                    <symbol id="icon-play" viewBox="0 0 32 32">
                        <title>icon-play</title>
                        <path
                            d="M21.216 15.168l-7.616-5.088c-0.672-0.416-1.504 0.032-1.504 0.832v10.176c0 0.8 0.896 1.248 1.504 0.832l7.616-5.088c0.576-0.416 0.576-1.248 0-1.664z">
                        </path>
                        <path
                            d="M13.056 22.4c-0.224 0-0.416-0.064-0.608-0.16-0.448-0.224-0.704-0.672-0.704-1.152v-10.176c0-0.48 0.256-0.928 0.672-1.152s0.928-0.224 1.344 0.064l7.616 5.088c0.384 0.256 0.608 0.672 0.608 1.088s-0.224 0.864-0.608 1.088l-7.616 5.088c-0.192 0.16-0.448 0.224-0.704 0.224zM13.056 10.272c-0.096 0-0.224 0.032-0.32 0.064-0.224 0.128-0.352 0.32-0.352 0.576v10.176c0 0.256 0.128 0.48 0.352 0.576 0.224 0.128 0.448 0.096 0.64-0.032l7.616-5.088c0.192-0.128 0.288-0.32 0.288-0.544s-0.096-0.416-0.288-0.544l-7.584-5.088c-0.096-0.064-0.224-0.096-0.352-0.096z">
                        </path>
                        <path
                            d="M16 0.32c-8.64 0-15.68 7.040-15.68 15.68s7.040 15.68 15.68 15.68 15.68-7.040 15.68-15.68-7.040-15.68-15.68-15.68zM16 29.216c-7.296 0-13.216-5.92-13.216-13.216s5.92-13.216 13.216-13.216 13.216 5.92 13.216 13.216-5.92 13.216-13.216 13.216z">
                        </path>
                        <path
                            d="M16 32c-8.832 0-16-7.168-16-16s7.168-16 16-16 16 7.168 16 16-7.168 16-16 16zM16 0.672c-8.448 0-15.328 6.88-15.328 15.328s6.88 15.328 15.328 15.328c8.448 0 15.328-6.88 15.328-15.328s-6.88-15.328-15.328-15.328zM16 29.568c-7.488 0-13.568-6.080-13.568-13.568s6.080-13.568 13.568-13.568c7.488 0 13.568 6.080 13.568 13.568s-6.080 13.568-13.568 13.568zM16 3.104c-7.104 0-12.896 5.792-12.896 12.896s5.792 12.896 12.896 12.896c7.104 0 12.896-5.792 12.896-12.896s-5.792-12.896-12.896-12.896z">
                        </path>
                    </symbol>
                    <symbol id="icon-link" viewBox="0 0 32 32">
                        <title>link</title>
                        <path
                            d="M23.584 17.92c0 0.864 0 1.728 0 2.56 0 1.312 0 2.656 0 3.968 0 0.352 0.032 0.736-0.032 1.12 0.032-0.16 0.032-0.288 0.064-0.448-0.032 0.224-0.096 0.448-0.16 0.64 0.064-0.128 0.128-0.256 0.16-0.416-0.096 0.192-0.192 0.384-0.32 0.576 0.096-0.128 0.16-0.224 0.256-0.352-0.128 0.16-0.288 0.32-0.48 0.48 0.128-0.096 0.224-0.16 0.352-0.256-0.192 0.128-0.352 0.256-0.576 0.32 0.128-0.064 0.256-0.128 0.416-0.16-0.224 0.096-0.416 0.16-0.64 0.16 0.16-0.032 0.288-0.032 0.448-0.064-0.256 0.032-0.512 0.032-0.768 0.032-0.448 0-0.896 0-1.312 0-1.472 0-2.976 0-4.448 0-1.824 0-3.616 0-5.44 0-1.568 0-3.104 0-4.672 0-0.736 0-1.44 0-2.176 0-0.128 0-0.224 0-0.352-0.032 0.16 0.032 0.288 0.032 0.448 0.064-0.224-0.032-0.448-0.096-0.64-0.16 0.128 0.064 0.256 0.128 0.416 0.16-0.192-0.096-0.384-0.192-0.576-0.32 0.128 0.096 0.224 0.16 0.352 0.256-0.16-0.128-0.32-0.288-0.48-0.48 0.096 0.128 0.16 0.224 0.256 0.352-0.128-0.192-0.256-0.352-0.32-0.576 0.064 0.128 0.128 0.256 0.16 0.416-0.096-0.224-0.16-0.416-0.16-0.64 0.032 0.16 0.032 0.288 0.064 0.448-0.032-0.256-0.032-0.512-0.032-0.768 0-0.448 0-0.896 0-1.312 0-1.472 0-2.976 0-4.448 0-1.824 0-3.616 0-5.44 0-1.568 0-3.104 0-4.672 0-0.736 0-1.44 0-2.176 0-0.128 0-0.224 0.032-0.352-0.032 0.16-0.032 0.288-0.064 0.448 0.032-0.224 0.096-0.448 0.16-0.64-0.064 0.128-0.128 0.256-0.16 0.416 0.096-0.192 0.192-0.384 0.32-0.576-0.096 0.128-0.16 0.224-0.256 0.352 0.128-0.16 0.288-0.32 0.48-0.48-0.128 0.096-0.224 0.16-0.352 0.256 0.192-0.128 0.352-0.256 0.576-0.32-0.128 0.064-0.256 0.128-0.416 0.16 0.224-0.096 0.416-0.16 0.64-0.16-0.16 0.032-0.288 0.032-0.448 0.064 0.48-0.064 0.96-0.032 1.44-0.032 0.992 0 1.952 0 2.944 0 1.216 0 2.432 0 3.616 0 1.056 0 2.112 0 3.168 0 0.512 0 1.024 0 1.536 0 0 0 0 0 0.032 0 0.448 0 0.896-0.192 1.184-0.48s0.512-0.768 0.48-1.184c-0.032-0.448-0.16-0.896-0.48-1.184s-0.736-0.48-1.184-0.48c-0.64 0-1.28 0-1.92 0-1.408 0-2.816 0-4.224 0-1.44 0-2.848 0-4.256 0-0.672 0-1.344 0-2.016 0-0.736 0-1.472 0.192-2.112 0.576s-1.216 0.96-1.568 1.6c-0.384 0.64-0.544 1.376-0.544 2.144 0 0.672 0 1.376 0 2.048 0 1.28 0 2.56 0 3.84 0 1.504 0 3.040 0 4.544 0 1.408 0 2.848 0 4.256 0 0.992 0 1.952 0 2.944 0 0.224 0 0.448 0 0.64 0 0.864 0.224 1.76 0.768 2.464 0.16 0.192 0.288 0.384 0.48 0.576s0.384 0.352 0.608 0.512c0.32 0.224 0.64 0.384 1.024 0.512 0.448 0.16 0.928 0.224 1.408 0.224 0.16 0 0.32 0 0.48 0 0.896 0 1.792 0 2.72 0 1.376 0 2.784 0 4.16 0 1.536 0 3.040 0 4.576 0 1.312 0 2.656 0 3.968 0 0.768 0 1.536 0 2.336 0 0.416 0 0.832-0.032 1.248-0.128 1.504-0.32 2.784-1.6 3.104-3.104 0.128-0.544 0.128-1.056 0.128-1.568 0-0.608 0-1.184 0-1.792 0-1.408 0-2.816 0-4.224 0-0.256 0-0.512 0-0.768 0-0.448-0.192-0.896-0.48-1.184s-0.768-0.512-1.184-0.48c-0.448 0.032-0.896 0.16-1.184 0.48-0.384 0.384-0.576 0.768-0.576 1.248v0z">
                        </path>
                        <path
                            d="M32 11.232c0-0.8 0-1.568 0-2.368 0-1.248 0-2.528 0-3.776 0-0.288 0-0.576 0-0.864 0-0.896-0.768-1.696-1.696-1.696-0.8 0-1.568 0-2.368 0-1.248 0-2.528 0-3.776 0-0.288 0-0.576 0-0.864 0-0.448 0-0.896 0.192-1.184 0.48s-0.512 0.768-0.48 1.184c0.032 0.448 0.16 0.896 0.48 1.184s0.736 0.48 1.184 0.48c0.8 0 1.568 0 2.368 0 1.248 0 2.528 0 3.776 0 0.288 0 0.576 0 0.864 0-0.576-0.576-1.12-1.12-1.696-1.696 0 0.8 0 1.568 0 2.368 0 1.248 0 2.528 0 3.776 0 0.288 0 0.576 0 0.864 0 0.448 0.192 0.896 0.48 1.184s0.768 0.512 1.184 0.48c0.448-0.032 0.896-0.16 1.184-0.48 0.352-0.256 0.544-0.64 0.544-1.12v0z">
                        </path>
                        <path
                            d="M15.040 21.888c0.16-0.16 0.288-0.288 0.448-0.448 0.384-0.384 0.8-0.8 1.184-1.184 0.608-0.608 1.184-1.184 1.792-1.792 0.704-0.704 1.44-1.44 2.176-2.176 0.8-0.8 1.568-1.568 2.368-2.368s1.6-1.6 2.4-2.4c0.736-0.736 1.504-1.504 2.24-2.24 0.64-0.64 1.248-1.248 1.888-1.888 0.448-0.448 0.896-0.896 1.344-1.344 0.224-0.224 0.448-0.416 0.64-0.64 0 0 0.032-0.032 0.032-0.032 0.32-0.32 0.48-0.768 0.48-1.184s-0.192-0.896-0.48-1.184c-0.32-0.288-0.736-0.512-1.184-0.48-0.512 0.032-0.928 0.16-1.248 0.48-0.16 0.16-0.288 0.288-0.448 0.448-0.384 0.384-0.8 0.8-1.184 1.184-0.608 0.608-1.184 1.184-1.792 1.792-0.704 0.704-1.44 1.44-2.176 2.176-0.8 0.8-1.568 1.568-2.368 2.368s-1.6 1.6-2.4 2.4c-0.736 0.736-1.504 1.504-2.24 2.24-0.64 0.64-1.248 1.248-1.888 1.888-0.448 0.448-0.896 0.896-1.344 1.344-0.224 0.224-0.448 0.416-0.64 0.64 0 0-0.032 0.032-0.032 0.032-0.32 0.32-0.48 0.768-0.48 1.184s0.192 0.896 0.48 1.184c0.32 0.288 0.736 0.512 1.184 0.48 0.48 0 0.928-0.16 1.248-0.48v0z">
                        </path>
                    </symbol>
                    <symbol id="icon-next" viewBox="0 0 32 32">
                        <title>next</title>
                        <path
                            d="M2.304 18.304h14.688l-4.608 4.576c-0.864 0.864-0.864 2.336 0 3.232 0.864 0.864 2.336 0.864 3.232 0l8.448-8.48c0.864-0.864 0.864-2.336 0-3.232l-8.448-8.448c-0.448-0.448-1.056-0.672-1.632-0.672s-1.184 0.224-1.632 0.672c-0.864 0.864-0.864 2.336 0 3.232l4.64 4.576h-14.688c-1.248 0-2.304 0.992-2.304 2.272s1.024 2.272 2.304 2.272z">
                        </path>
                        <path
                            d="M29.696 26.752c1.248 0 2.304-1.024 2.304-2.304v-16.928c0-1.248-1.024-2.304-2.304-2.304s-2.304 1.024-2.304 2.304v16.928c0.064 1.28 1.056 2.304 2.304 2.304z">
                        </path>
                    </symbol>
                    <symbol id="icon-prev" viewBox="0 0 32 32">
                        <title>prev</title>
                        <path
                            d="M29.696 13.696h-14.688l4.576-4.576c0.864-0.864 0.864-2.336 0-3.232-0.864-0.864-2.336-0.864-3.232 0l-8.448 8.48c-0.864 0.864-0.864 2.336 0 3.232l8.448 8.448c0.448 0.448 1.056 0.672 1.632 0.672s1.184-0.224 1.632-0.672c0.864-0.864 0.864-2.336 0-3.232l-4.608-4.576h14.688c1.248 0 2.304-1.024 2.304-2.304s-1.024-2.24-2.304-2.24z">
                        </path>
                        <path
                            d="M2.304 5.248c-1.248 0-2.304 1.024-2.304 2.304v16.928c0 1.248 1.024 2.304 2.304 2.304s2.304-1.024 2.304-2.304v-16.928c-0.064-1.28-1.056-2.304-2.304-2.304z">
                        </path>
                    </symbol>
                </defs>
            </svg>
        </v-main>
    </v-app>
</template>

<script>

export default {
    name: 'App',

    components: {
    },

    data() {
        return {
            audio: null,
            circleLeft: null,
            barWidth: null,
            duration: null,
            currentTime: null,
            isTimerPlaying: false,
            tracks: [
                {
                    name: "Default",
                    artist: "Default",
                    cover: "https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/9.jpg",
                    source: "https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/9.mp3",
                    sourceH: "https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/9.mp3"
                }
            ],
            currentTrack: null,
            transitionName: "scale-out",
            lyric: [],
            offset: [],
            highlight: 0,
            setting: true,
            vocal: 100,
            backg: 100,
            loading: 0
        };
    },
    methods: {
        chgV() {
            this.audioH.volume = this.vocal / 100;
        },
        chgB() {
            this.audio.volume = this.backg / 100;
        },
        play() {
            if (this.audio.paused) {
                this.audio.play();
                this.audioH.play();
                this.isTimerPlaying = true;
            } else {
                this.audio.pause();
                this.audioH.pause();
                this.isTimerPlaying = false;
            }
        },
        parseLRC(lrc) {
            var parseTime = (time) => {
                var tl = time.split(":");
                switch (tl.length) {
                    case 1:
                        return parseFloat(tl[0]);
                    case 2:
                        return parseFloat(tl[0]) * 60 + parseFloat(tl[1]);
                    case 3:
                        return parseFloat(tl[0]) * 3600 + parseFloat(tl[1]) * 60 + parseFloat(tl[2]);
                }
            }
            var arr = lrc.split("\n");
            var text = [], offset = [];
            var reg = /^[\d:\\.]+$/;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != "") {
                    var tempArray = arr[i].split("]");
                    if (tempArray.length > 1) {
                        var off = tempArray[0].substring(1, tempArray[0].length - 1);
                        if (!reg.test(off)) continue;
                        var te = tempArray[1];
                        if (te == '') te = "　";
                        text.push({ main: te });
                        offset.push(parseTime(off));
                    }
                }
            }
            return [text, offset];
        },
        initLRC() {
            var [text, offset] = this.parseLRC(this.currentTrack.lrc)
            if (this.currentTrack.tlrc != '') {
                var [tt, to] = this.parseLRC(this.currentTrack.tlrc);
                // console.log(offset, to, tt)
                for (var i = 0, now = 0; i < offset.length && now < to.length;) {
                    // console.log(i, now,to[now], offset[i], Math.abs(to[now] - offset[i]) < 0.001)
                    if (to[now] == offset[i]) {
                        text[i].sub = tt[now].main;
                        i++, now++;
                    } else if (to[now] > offset[i]) i++;
                    else now++;
                }
            }
            this.lyric = text;
            this.offset = offset;
            // console.log(this.lyric);
        },
        updateLRC(ct) {
            var getNewH = (ct) => {
                var hh = this.highlight;
                var c = this.lyric.length - 1;
                if (hh > 0 && hh < c && ct >= this.offset[hh] && ct < this.offset[hh + 1]) return hh;
                if (ct <= this.offset[0]) return 0;
                if (ct >= this.offset[c]) return c;
                for (var i = 0; i < c; ++i) {
                    if (ct >= this.offset[i] && ct < this.offset[i + 1]) return i;
                }
                return c;
            }
            var newH = getNewH(ct);
            if (newH == this.highlight) return;
            this.highlight = newH;
            this.$nextTick(() => {
                var par = this.$refs.lrc;
                var chi = par.firstChild.childNodes[this.highlight + 1];
                // console.log(par.offsetTop,chi.offsetTop,chi.offsetHeight,par.offsetHeight,chi.offsetParent);
                var scrollTop = chi.offsetTop - par.offsetTop - par.offsetHeight / 2 + chi.offsetHeight / 2
                par.scrollTo({ top: scrollTop, behavior: 'smooth' })
            })
        },
        generateTime() {
            let width = (100 / this.audio.duration) * this.audio.currentTime;
            this.barWidth = width + "%";
            this.circleLeft = width + "%";
            this.updateLRC(this.audio.currentTime);
            let durmin = Math.floor(this.audio.duration / 60);
            let dursec = Math.floor(this.audio.duration - durmin * 60);
            let curmin = Math.floor(this.audio.currentTime / 60);
            let cursec = Math.floor(this.audio.currentTime - curmin * 60);
            if (durmin < 10) {
                durmin = "0" + durmin;
            }
            if (dursec < 10) {
                dursec = "0" + dursec;
            }
            if (curmin < 10) {
                curmin = "0" + curmin;
            }
            if (cursec < 10) {
                cursec = "0" + cursec;
            }
            this.duration = durmin + ":" + dursec;
            this.currentTime = curmin + ":" + cursec;
        },
        updateBar(x) {
            let progress = this.$refs.progress;
            let maxduration = this.audio.duration;
            let position = x - progress.offsetLeft;
            let percentage = (100 * position) / progress.offsetWidth;
            if (percentage > 100) {
                percentage = 100;
            }
            if (percentage < 0) {
                percentage = 0;
            }
            this.barWidth = percentage + "%";
            this.circleLeft = percentage + "%";
            this.audio.currentTime = (maxduration * percentage) / 100;
            this.audioH.currentTime = (maxduration * percentage) / 100;
            this.audio.play();
            this.audioH.play();
        },
        clickProgress(e) {
            this.isTimerPlaying = true;
            this.audio.pause();
            this.audioH.pause();
            this.updateBar(e.pageX);
        },
        nextTrack() {
            window.ipcRenderer.send('playNext');
        },
        resetPlayer() {
            this.barWidth = 0;
            this.circleLeft = 0;
            this.audio.currentTime = 0;
            this.audioH.currentTime = 0;
            this.highlight = 0;
            this.audio.src = this.currentTrack.source;
            this.audioH.src = this.currentTrack.sourceH;
            this.audio.play();
            this.audioH.play();
            this.isTimerPlaying = true;
        },
    },
    created() {
        let vm = this;
        this.currentTrack = this.tracks[0];
        this.audio = new Audio();
        this.audioH = new Audio();
        this.audio.src = this.currentTrack.source;
        this.audioH.src = this.currentTrack.sourceH;
        this.audio.ontimeupdate = function () {
            vm.generateTime();
        };
        this.audio.onloadedmetadata = function () {
            vm.generateTime();
        };
        this.audio.onended = function () {
            vm.audio.pause();
            vm.audioH.pause();
            vm.highlight = 0;
            vm.nextTrack();
            vm.isTimerPlaying = false;
        };
        console.log("MOUNTED")
        window.ipcRenderer.send('loadFinish');
        window.ipcRenderer.receive('newSong', (data) => {
            console.log(data)
            vm.currentTrack = data;
            vm.highlight = 0;
            vm.initLRC();
            vm.resetPlayer();
        });
        window.ipcRenderer.receive('startLoading', () => {
            vm.loading ++;
        });
        window.ipcRenderer.receive('finishLoading', () => {
            vm.loading --;
        });
    }
};
</script>
<style>
html,
body {
    margin: 0;
    padding: 0;
    /* color: #f2f3f3; */
}

::-webkit-scrollbar {
    display: none;
}

* {
    user-select: none;
    -webkit-touch-callout: none;
}

.bg {
    position: absolute;
    top: -20%;
    left: -20%;
    /* right: -100px; */
    z-index: -2;
    height: 140%;
    width: 140%;
    background-size: cover;
    filter: blur(100px);
}

.mask {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .35);
}

#app,
.container,
.row {
    min-height: 100%;
    background-color: transparent;
}
</style>

<style>
body {
    background: transparent;
    font-family: "Bitter", serif;
}

* {
    box-sizing: border-box;
}

.icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    stroke-width: 0;
    stroke: currentColor;
    fill: currentColor;
}

.wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-size: cover;
}

@media screen and (max-width: 700px),
(max-height: 500px) {
    .wrapper {
        flex-wrap: wrap;
        flex-direction: column;
    }
}

.player {
    background: #eef3f7ec;
    width: 410px;
    min-height: 480px;
    box-shadow: 0px 15px 35px -5px rgba(50, 88, 130, 0.32);
    border-radius: 15px;
    padding: 30px;
}

.qr {
    background: #eef3f7ec;
    width: 410px;
    box-shadow: 0px 15px 35px -5px rgba(50, 88, 130, 0.32);
    border-radius: 15px;
    padding: 30px;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player {
        width: 95%;
        padding: 20px;
        margin-top: 75px;
        min-height: initial;
        padding-bottom: 30px;
        max-width: 400px;
    }
}

.player__top {
    display: flex;
    align-items: flex-start;
    position: relative;
    z-index: 4;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player__top {
        flex-wrap: wrap;
    }
}

.player-cover {
    width: 300px;
    height: 300px;
    margin-left: -70px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    border-radius: 15px;
    z-index: 1;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player-cover {
        margin-top: -70px;
        margin-bottom: 25px;
        width: 290px;
        height: 230px;
        margin-left: auto;
        margin-right: auto;
    }
}

.player-cover__item {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    width: 100%;
    height: 100%;
    border-radius: 15px;
    position: absolute;
    left: 0;
    top: 0;
}

.player-cover__item:before {
    content: "";
    background: inherit;
    width: 100%;
    height: 100%;
    box-shadow: 0px 10px 40px 0px rgba(76, 70, 124, 0.5);
    display: block;
    z-index: 1;
    position: absolute;
    top: 30px;
    transform: scale(0.9);
    filter: blur(10px);
    opacity: 0.9;
    border-radius: 15px;
}

.player-cover__item:after {
    content: "";
    background: inherit;
    width: 100%;
    height: 100%;
    box-shadow: 0px 10px 40px 0px rgba(76, 70, 124, 0.5);
    display: block;
    z-index: 2;
    position: absolute;
    border-radius: 15px;
}

.player-cover__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
    box-shadow: 0px 10px 40px 0px rgba(76, 70, 124, 0.5);
    user-select: none;
    pointer-events: none;
}

.player-controls {
    flex: 1;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player-controls {
        flex-direction: row;
        padding-left: 0;
        width: 100%;
        flex: unset;
    }
}

.player-controls__item {
    display: inline-flex;
    font-size: 30px;
    padding: 5px;
    margin-bottom: 10px;
    color: #acb8cc;
    cursor: pointer;
    width: 50px;
    height: 50px;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease-in-out;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player-controls__item {
        font-size: 26px;
        padding: 5px;
        margin-right: 10px;
        color: #acb8cc;
        cursor: pointer;
        width: 40px;
        height: 40px;
        margin-bottom: 0;
    }
}

.player-controls__item::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #fff;
    transform: scale(0.5);
    opacity: 0;
    box-shadow: 0px 5px 10px 0px rgba(76, 70, 124, 0.2);
    transition: all 0.3s ease-in-out;
    transition: all 0.4s cubic-bezier(0.35, 0.57, 0.13, 0.88);
}

@media screen and (min-width: 500px) {
    .player-controls__item:hover {
        color: #532ab9;
    }

    .player-controls__item:hover::before {
        opacity: 1;
        transform: scale(1.3);
    }
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player-controls__item:active {
        color: #532ab9;
    }

    .player-controls__item:active::before {
        opacity: 1;
        transform: scale(1.3);
    }
}

.player-controls__item .icon {
    position: relative;
    z-index: 2;
}

.player-controls__item.-xl {
    margin-bottom: 0;
    font-size: 95px;
    filter: drop-shadow(0 11px 6px rgba(172, 184, 204, 0.45));
    color: #fff;
    width: auto;
    height: auto;
    display: inline-flex;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .player-controls__item.-xl {
        margin-left: auto;
        font-size: 75px;
        margin-right: 0;
    }
}

.player-controls__item.-xl:before {
    display: none;
}

.player-controls__item.-favorite.active {
    color: red;
}

[v-cloak] {
    display: none;
}

[v-cloak]>* {
    display: none;
}

.progress {
    width: 100%;
    margin-top: -15px;
    user-select: none;
}

.progress__top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.progress__duration {
    color: #71829e;
    font-weight: 700;
    font-size: 20px;
    opacity: 0.5;
}

.progress__time {
    margin-top: 2px;
    color: #71829e;
    font-weight: 700;
    font-size: 16px;
    opacity: 0.7;
}

.progress__bar {
    height: 6px;
    width: 100%;
    cursor: pointer;
    background-color: #d0d8e6;
    display: inline-block;
    border-radius: 10px;
}

.progress__current {
    height: inherit;
    width: 0%;
    background-color: #a3b3ce;
    border-radius: 10px;
}

.album-info {
    color: #71829e;
    flex: 1;
    padding-right: 60px;
    user-select: none;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .album-info {
        padding-right: 30px;
    }
}

.album-info__name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
    line-height: 1.3em;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .album-info__name {
        font-size: 18px;
        margin-bottom: 9px;
    }
}

.album-info__track {
    font-weight: 400;
    font-size: 20px;
    opacity: 0.7;
    line-height: 1.3em;
    min-height: 52px;
}

@media screen and (max-width: 576px),
(max-height: 500px) {
    .album-info__track {
        font-size: 18px;
        min-height: 50px;
    }
}

.github-btn {
    position: absolute;
    right: 40px;
    bottom: 50px;
    text-decoration: none;
    padding: 15px 25px;
    border-radius: 4px;
    box-shadow: 0px 4px 30px -6px rgba(36, 52, 70, 0.65);
    background: #24292e;
    color: #fff;
    font-weight: bold;
    letter-spacing: 1px;
    font-size: 16px;
    transition: all 0.3s ease-in-out;
}

@media screen and (min-width: 500px) {
    .github-btn:hover {
        transform: scale(1.1);
        box-shadow: 0px 17px 20px -6px rgba(36, 52, 70, 0.36);
    }
}

@media screen and (max-width: 700px) {
    .github-btn {
        position: relative;
        bottom: auto;
        right: auto;
        margin-top: 20px;
    }

    .github-btn:active {
        transform: scale(1.1);
        box-shadow: 0px 17px 20px -6px rgba(36, 52, 70, 0.36);
    }
}

.scale-out-enter-active {
    transition: all 0.35s ease-in-out;
}

.scale-out-leave-active {
    transition: all 0.35s ease-in-out;
}

.scale-out-enter {
    transform: scale(0.55);
    pointer-events: none;
    opacity: 0;
}

.scale-out-leave-to {
    transform: scale(1.2);
    pointer-events: none;
    opacity: 0;
}

.scale-in-enter-active {
    transition: all 0.35s ease-in-out;
}

.scale-in-leave-active {
    transition: all 0.35s ease-in-out;
}

.scale-in-enter {
    transform: scale(1.2);
    pointer-events: none;
    opacity: 0;
}

.scale-in-leave-to {
    transform: scale(0.55);
    pointer-events: none;
    opacity: 0;
}

/*# sourceMappingURL=main.css.map */
</style>