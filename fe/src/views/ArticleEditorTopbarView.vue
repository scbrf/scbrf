<template>
    <div>
        <div class="bg-gray-100 dark:bg-slate-800 h-12 flex items-center border-b">
            <ArrowUpCircleIcon @click="publish" class="ml-24 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </ArrowUpCircleIcon>
            <div class="flex-1"></div>
            <PhotoIcon @click="attachPhoto" class="mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </PhotoIcon>
            <MicrophoneIcon @click="attachAudio" class="mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
            </MicrophoneIcon>
            <FilmIcon @click="attachFilm" class="mr-6 mt-1 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag"></FilmIcon>
        </div>
    </div>
</template>
<script>
import { ArrowUpCircleIcon, FilmIcon, PhotoIcon, MicrophoneIcon } from '@heroicons/vue/24/outline'

export default {
    components: {
        ArrowUpCircleIcon, FilmIcon, PhotoIcon, MicrophoneIcon
    },
    methods: {
        attachFilm() {
            api.send('attachFilm')
        },
        attachAudio() {
            api.send('attachAudio')
        },
        attachPhoto() {
            api.send('attachPhoto')
        },
        publish() {
            api.send('editor/publish')
        }
    }
}
</script>