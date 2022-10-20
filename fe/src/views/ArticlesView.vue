<template>
    <div class="h-screen flex flex-col border-gray-200 border-r drag">
        <div class="bg-gray-100 p-2 h-12 dark:bg-slate-800">
            <div class="font-bold">
                {{ title }}
            </div>
            <div class="text-xs">
                {{ articles.length }} articles
            </div>
        </div>
        <div class="bg-white p-2 flex-1 overflow-y-scroll dark:bg-slate-700">
            <div @contextmenu="articleCtxMenu(a)" @click="setFocus(a)" v-for="(a,idx) in articles" :key="a.id"
                class="mb-1 rounded px-4 py-1 nodrag flex"
                :class="focus === a.id ? ['bg-blue-500', `e2e-post-${idx}`] : [`e2e-post-${idx}`]">
                <StarIcon v-if="a.starred === true" class="w-4 h-4 mr-2 mt-2 text-yellow-400"></StarIcon>
                <div v-else-if="a.read === false" class="w-2 h-2 mr-4 mt-2 rounded-full bg-green-500">
                </div>
                <div v-else class="w-4 h-4 mr-2"></div>
                <div style="text-align: justify;" :style="{maxWidth: isWin ? '200px' : '228px'}">
                    <div class="font-bold">{{ a.title }}</div>
                    <div class="text-sm text-gray-400 line-clamp-2">{{ a.summary }}</div>
                    <div class="text-xs text-gray-400 mt-1 mb-3 flex items-center">
                        <span> {{ date(a.created) }} {{ a.pinState }} </span>
                        <MicrophoneIcon v-if="a.audioFilename" class="w-4 h-4 ml-4"></MicrophoneIcon>
                        <FilmIcon v-if="a.videoFilename" class="w-4 h-4 ml-4"></FilmIcon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import monent from 'moment'
import { mapState, mapWritableState } from 'pinia';
import { useArticlesStore } from '../stores/articles';
import { FilmIcon, MicrophoneIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'

export default {
    components: {
        FilmIcon, MicrophoneIcon, StarIcon
    },
    computed: {
        ...mapState(useArticlesStore, ['title', 'articles']),
        ...mapWritableState(useArticlesStore, ['focus']),

        isWin() {
            //windows 版本滚动条会占用内容区域
            return (navigator.userAgent.indexOf("Win") != -1)
        }
    },
    watch: {
        focus() {
            console.log('focus change to', this.focus)
        }
    },
    methods: {
        date(t) {
            return monent(t).format('MMM D,YYYY')
        },
        setFocus(a) {
            this.focus = a.id
            api.send('ipcSetMiddleSidebarFocus', a.id)
        },
        articleCtxMenu(a) {
            api.send('ipcMyArticleCtxMenu', JSON.parse(JSON.stringify(a)))
        }
    }
}
</script>