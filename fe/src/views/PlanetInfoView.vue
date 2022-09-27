<template>
    <div class="flex flex-col p-4 h-screen">
        <div class="flex items-center">
            <div class="text-xs text-gray-500">Published {{pubdata}} </div>
            <div class="flex-1"> </div>
            <XCircleIcon @click="close" class="w-5 h-5"> </XCircleIcon>
        </div>
        <div class="flex justify-center">
            <Avatar :image="fixPath(icon)" extraClass="w-16 h-16 text-3xl" :placeholder="title" />
        </div>
        <div class="flex justify-center text-xl">
            {{title}}
        </div>
        <div class="flex justify-center text-base mt-2" v-html="about">
        </div>
        <div class="flex-1"></div>
        <div class="flex justify-center">
            <button @click="close">OK</button>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import { mapState } from 'pinia';
import Avatar from '../components/Avatar.vue'
import { usePlanetInfoStore } from '../stores/planetinfo';
import { XCircleIcon } from '@heroicons/vue/24/outline'

export default {
    computed: {
        ...mapState(usePlanetInfoStore, ['title', 'about', 'icon', 'updateat']),
        pubdata() {
            return moment(this.updateat).fromNow()
        }
    },
    components: {
        XCircleIcon, Avatar
    },
    methods: {
        fixPath(path) {
            if (path && path.startsWith('/')) return `file://${path}`
            return path
        },
        close() {
            console.log('close')
            api.send('ipcCloseWin')
        }
    }
}
</script>