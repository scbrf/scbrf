<template>
    <div class="bg-gray-100 h-12 flex items-center dark:bg-slate-800">
        <PencilSquareIcon @click="newArticle" v-if="planet && planet.ipns" class="w-6 h-6 ml-4"></PencilSquareIcon>
        <ChartBarSquareIcon v-if="planet && planet.ipns && planet.p" class="w-6 h-6 ml-4"></ChartBarSquareIcon>
        <InformationCircleIcon v-if="planet" @click="planetInfo" class="w-6 h-6 ml-4"></InformationCircleIcon>
        <div class="flex-1"></div>
        <SpeakerWaveIcon v-if="hasAudio" @click="playAudio" class="w-6 h-6 ml-4 nodrag"></SpeakerWaveIcon>
        <button v-if="hasAttachment" class="flex shrink-0 items-center px-2 rounded border-2 ml-4">
            <PaperClipIcon class="w-5 h-5"></PaperClipIcon>
            <span class="ml-2"> {{ article.attachments.length }}</span>
        </button>
        <div class="flex-1"></div>
        <ShareIcon class="w-6 h-6 mr-4 text-slate-300"></ShareIcon>
    </div>
</template>
<script>
import { PencilSquareIcon, ChartBarSquareIcon, InformationCircleIcon, SpeakerWaveIcon, PaperClipIcon, ShareIcon } from '@heroicons/vue/24/outline'
import { mapState } from 'pinia';
import { useTopbarStore } from '../stores/topbar';


export default {
    components: {
        PencilSquareIcon, ChartBarSquareIcon, InformationCircleIcon, SpeakerWaveIcon, PaperClipIcon, ShareIcon
    },
    computed: {
        ...mapState(useTopbarStore, ['planet', 'article']),
        hasAudio() {
            return this.article.audioFilename
        },
        hasAttachment() {
            return this.article.attachments && this.article.attachments.length > 0
        }
    },
    methods: {
        playAudio() {
            api.send('playAudio', JSON.parse(JSON.stringify(this.article)))
        },
        newArticle() {
            api.send('newArticle', JSON.parse(JSON.stringify(this.planet)))
        },
        planetInfo() {
            api.send('planetInfo', JSON.parse(JSON.stringify(this.planet)))
        }
    }
}
</script>