<template>
    <div class="w-screen h-screen flex flex-col items-stretch border-r">
        <video v-if="videoFilename" class="w-screen" style="height:56.25vw;" controls :src="videoFilename"></video>
        <AudioPlayer v-if="audioFilename" :src="audioFilename" />
        <input @input="save" v-model="title" placeholder="Title"
            class="!outline-none dark:bg-slate-900 p-2 border-b nodrag" />
        <textarea @input="save" v-model="content"
            class="!outline-none flex-1 nodrag dark:bg-slate-800 p-2">hello</textarea>
        <div v-if="attachments.length" class="bg-gray-100 dark:bg-slate-800 ">
            <img v-for="a in attachments" @click="addPhoto(a)" class="w-16 h-10 m-4" :key="a.url" :src="a.url" />
        </div>
    </div>
</template>
<script>
import { mapState, mapWritableState } from 'pinia';
import { useEditorStore } from '../stores/editor';
import AudioPlayer from '../components/AudioPlayer.vue';

export default {
    computed: {
        ...mapState(useEditorStore, ["videoFilename", "audioFilename", 'attachments']),
        ...mapWritableState(useEditorStore, ['title', 'content'])
    },
    methods: {
        save() {
            api.send("draft", JSON.stringify({
                title: this.title,
                content: this.content,
                attachments: this.attachments,
                audioFilename: this.audioFilename,
                videoFilename: this.videoFilename
            }));
        },
        addPhoto(a) {
            const basename = a.name
            const node = document.querySelector('textarea')
            this.content = this.content.substring(0, node.selectionStart)
                + `<img width="${a.size.width}" alt="${basename}" src="${basename}">`
                + this.content.substring(node.selectionStart)
            this.save()
        }
    },
    components: { AudioPlayer }
}
</script>