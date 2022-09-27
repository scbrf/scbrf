<template>
    <div class="w-screen h-screen flex flex-col items-stretch border-r">
        <video v-if="videoFilename" @contextmenu="showVideoCtxMenu" class="w-screen" style="height:56.25vw;" controls
            :src="fixUrl(videoFilename)"></video>
        <AudioPlayer v-if="audioFilename" @delete="removeAttachment(audioFilename)" :src="fixUrl(audioFilename)" />
        <input @input="save" v-model="title" placeholder="Title"
            class="!outline-none dark:bg-slate-900 p-2 border-b nodrag" />
        <textarea @input="save" v-model="content"
            class="!outline-none flex-1 nodrag dark:bg-slate-800 p-2">hello</textarea>
        <div v-if="attachments.length" class="bg-gray-100 flex dark:bg-slate-800 overflow-x-auto">
            <div v-for="a in attachments" @click="addPhoto(a)" :key="a.url" class="relative group">
                <img class="w-16 h-10 mx-2 my-2" :src="a.url" />
                <XCircleIcon @click="removeAttachment(a.name) "
                    class="absolute w-4 h-4 text-blue-500 bg-white rounded-full top-1 right-1 hidden group-hover:inline">
                </XCircleIcon>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapWritableState } from 'pinia';
import { useEditorStore } from '../stores/editor';
import AudioPlayer from '../components/AudioPlayer.vue';
import { XCircleIcon } from '@heroicons/vue/24/solid'

export default {
    computed: {
        ...mapState(useEditorStore, ["videoFilename", "audioFilename", 'attachments']),
        ...mapWritableState(useEditorStore, ['title', 'content'])
    },
    methods: {
        save() {
            api.send("ipcDraftSave", JSON.stringify({
                title: this.title,
                content: this.content,
                attachments: this.attachments,
                audioFilename: this.audioFilename,
                videoFilename: this.videoFilename
            }));
        },
        fixUrl(path) {
            if (path.startsWith('/')) return `file://${path}`
            return path
        },
        addPhoto(a) {
            const basename = a.name
            const node = document.querySelector('textarea')
            this.content = this.content.substring(0, node.selectionStart)
                + `<img width="${a.size.width}" alt="${basename}" src="${basename}">`
                + this.content.substring(node.selectionStart)
            this.save()
        },
        removeAttachment(name) {
            api.send('ipcDraftRemoveAttachment', { name })
        },
        showVideoCtxMenu() {
            api.send('ipcDraftVideoContextMenu')
        }
    },
    components: { AudioPlayer, XCircleIcon }
}
</script>