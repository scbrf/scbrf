<template>
    <div class="bg-gray-100 h-12 flex items-center dark:bg-slate-800 drag">
        <PencilSquareIcon @click="newArticle" v-if="isMyPlanet" class="w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </PencilSquareIcon>
        <ChartBarSquareIcon v-if="planet && planet.ipns && planet.p" class="w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </ChartBarSquareIcon>
        <InformationCircleIcon v-if="planet" @click="planetInfo" class="w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </InformationCircleIcon>
        <div class="flex-1"></div>
        <SpeakerWaveIcon v-if="hasAudio" @click="playAudio" class="w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </SpeakerWaveIcon>
        <button v-if="hasAttachment" class="flex shrink-0 items-center px-2 rounded border-2 ml-4">
            <PaperClipIcon class="w-5 h-5 hover:text-gray-900 nodrag"></PaperClipIcon>
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
        },
        isMyPlanet() {
            return this.planet && (!this.planet.planetType)
        }
    },
    methods: {
        playAudio() {
            api.send('ipcPlayAudio', JSON.parse(JSON.stringify(this.article)))
        },
        newArticle() {
            api.send('ipcNewArticle', JSON.parse(JSON.stringify(this.planet)))
        },
        planetInfo() {
            api.send('ipcPlanetInfo', JSON.parse(JSON.stringify(this.planet)))
        }
    }
}
</script>