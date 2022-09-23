<template>
    <div class="w-full flex px-2 items-center">
        <span id="audiotitle" class="mr-2">{{ title }}</span>
        <PlayIcon v-if="!playing" @click="playpause" class="w-6 h-6 m-2 nodrag"></PlayIcon>
        <PauseIcon v-else @click="playpause" class="w-6 h-6 m-2 nodrag"></PauseIcon>
        <audio @timeupdate="setProgress" class="flex-1 h-10 bg-transparent" :src="src"></audio>
        <!-- <div class="flex-1"></div> -->
        <progress @click="adjustProgress" class="progress progress-info w-56 flex-1 nodrag" :value="progress"
            :max="duration"></progress>
        <select v-model="speed" class="select select-bordered select-xs max-w-xs">
            <option selected>1.0</option>
            <option>1.5</option>
            <option>2.0</option>
        </select>
        <XMarkIcon @click="stopAudio" class="w-6 h-6 m-2 nodrag"></XMarkIcon>
    </div>
</template>
<script>
import { XMarkIcon, PlayIcon, PauseIcon } from '@heroicons/vue/24/outline'

export default {
    emits: ['delete'],
    props: ['src'],
    data() {
        return {
            duration: 100,
            progress: 0,
            playing: false,
            speed: '1.0'
        }
    },
    watch: {
        speed() {
            const node = document.querySelector('audio')
            node.playbackRate = parseFloat(this.speed)
        }
    },
    computed: {
        title() {
            return (this.src || '').split("/").slice(-1)[0] || ''
        }
    },
    components: {
        XMarkIcon, PlayIcon, PauseIcon
    },
    methods: {
        stopAudio() {
            this.$emit('delete')
        },
        playpause() {
            const node = document.querySelector('audio')
            this.playing = !this.playing
            if (this.playing) node.play(); else node.pause()
        },
        setProgress() {
            const node = document.querySelector('audio')
            this.playing = !node.paused
            if (!isNaN(node.duration)) {
                this.duration = Math.ceil(node.duration)
                this.progress = Math.ceil(node.currentTime)
            }
        },
        adjustProgress(e) {
            const pos = e.offsetX
            const total = e.target.clientWidth
            const node = document.querySelector('audio')
            if (!isNaN(node.duration)) {
                node.currentTime = pos * node.duration / total
                this.progress = Math.ceil(pos * node.duration / total)
                node.play()
            }
        }
    }
}
</script>