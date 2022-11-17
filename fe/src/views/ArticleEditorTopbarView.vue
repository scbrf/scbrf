<template>
    <div>
        <div class="bg-gray-100 dark:bg-slate-800 h-12 flex items-center border-b drag">
            <div v-if="isWin" class="flex p-0 m-0">
                <XCircleIcon @click="closeWin"
                    class="e2e-close mt-1 ml-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
                </XCircleIcon>
                <ArrowUpCircleIcon @click="publish"
                    class="e2e-publish ml-4 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
                </ArrowUpCircleIcon>
            </div>
            <div v-else class="flex p-0 m-0">
                <ArrowUpCircleIcon @click="publish"
                    class="e2e-publish ml-24 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
                </ArrowUpCircleIcon>
            </div>

            <div class="flex-1"></div>
            <CurrencyPoundIcon @click="attachOnlyfansTag"
                class="e2e-photo mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </CurrencyPoundIcon>
            <PhotoIcon @click="attachPhoto"
                class="e2e-photo mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </PhotoIcon>
            <MicrophoneIcon @click="attachAudio"
                class="e2e-audio mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </MicrophoneIcon>
            <FilmIcon @click="attachFilm" class="e2e-video mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </FilmIcon>
        </div>
    </div>
</template>
<script>
import { CurrencyPoundIcon, ArrowUpCircleIcon, FilmIcon, PhotoIcon, MicrophoneIcon, XCircleIcon } from '@heroicons/vue/24/outline'

export default {
    components: {
        ArrowUpCircleIcon, FilmIcon, PhotoIcon, MicrophoneIcon, XCircleIcon, CurrencyPoundIcon
    },
    computed: {
        isWin() {
            return (navigator.userAgent.indexOf("Win") != -1)
        }
    },
    methods: {
        attachFilm() {
            api.send('ipcDraftAddVideo')
        },
        attachAudio() {
            api.send('ipcDraftAddAudio')
        },
        attachPhoto() {
            api.send('ipcDraftAddPhoto')
        },
        attachOnlyfansTag() {
            api.send('ipcDraftAddOnlyFans')
        },
        publish() {
            api.send('ipcDraftPublish')
        },
        closeWin() {
            api.send('ipcCloseWin')
        }
    }
}
</script>