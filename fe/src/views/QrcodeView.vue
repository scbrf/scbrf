<template>
    <div>
        <XCircleIcon @click="closewin"
            class="absolute right-4 top-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag" />
        <vue-qrcode v-if="api" :value="api" :options="{ width: 400 }"></vue-qrcode>
    </div>
</template>
<script>
import { XCircleIcon } from '@heroicons/vue/24/outline'
import { mapState } from 'pinia';
import { useSiteStore } from '../stores/site';

export default {
    components: { XCircleIcon },
    computed: {
        ...mapState(useSiteStore, ['api'])
    },
    methods: {
        closewin() {
            api.send('ipcCloseWin')
        }
    },
    watch: {
        api() {
            console.log(this.api)
        }
    },
    mounted() {
        console.log(this.api)
    }
}
</script>