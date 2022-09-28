<template>
    <div class="bg-gray-100 h-12 flex items-center dark:bg-slate-800 drag">
        <PencilSquareIcon @click="newArticle" v-if="isMyPlanet" class="e2e-new w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </PencilSquareIcon>
        <ChartBarSquareIcon v-if="planet && planet.ipns && planet.p" class="w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </ChartBarSquareIcon>
        <InformationCircleIcon v-if="planet" @click="planetInfo"
            class="e2e-info w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </InformationCircleIcon>
        <div class="flex-1"></div>
        <SpeakerWaveIcon v-if="hasAudio" @click="playAudio" class="e2e-sound w-6 h-6 ml-4 hover:text-gray-900 nodrag">
        </SpeakerWaveIcon>
        <button v-if="hasAttachment" @click="showDownloadMenu"
            class="e2e-attachs flex shrink-0 items-center px-2 hover:text-gray-900 hover:bg-slate-200 rounded border-2 ml-4 nodrag">
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
        },
        isMyPlanet() {
            return this.planet && this.planet.name && (!this.planet.planetType)
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
        },
        showDownloadMenu() {
            api.send('ipcDownloadMenu')
        }
    }
}
</script>