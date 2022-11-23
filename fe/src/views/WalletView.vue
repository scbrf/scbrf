<template>
    <div>
        <div class="bg-gray-100 h-12 flex items-center dark:bg-slate-800 drag">
            <div class="flex-1"></div>
            <div class="mr-4 text-gray-400">{{ network }}</div>
        </div>
        <div>
            <div class="text-center text-sm font-thin mt-8"> {{ address }} </div>
            <div class="text-center text-lg font-black mt-2"> {{ balance }} ETH </div>
        </div>
        <div v-if="events.length == 0" class="text-center mt-4">
            暂时没有人订阅您的站点
        </div>
    </div>
</template>
<script>
import { mapState } from 'pinia';
import { useWalletStore } from '../stores/wallet';

export default {
    computed: {
        ...mapState(useWalletStore, ['network', 'address', 'balance', 'events']),
    }
}
</script>