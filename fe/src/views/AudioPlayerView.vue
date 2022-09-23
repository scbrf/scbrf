<template>
    <AudioPlayer @delete="stopAudio" />
</template>
<script>
import AudioPlayer from '../components/AudioPlayer.vue'

export default {
    components: {
        AudioPlayer
    },
    methods: {
        stopAudio() {
            api.send('stopAudio')
        },
    }
}
</script>