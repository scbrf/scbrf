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
            没有什么消息好展示的
        </div>
        <div v-else class="overflow-x-auto mt-6">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th></th>
                        <th>type</th>
                        <th>planet</th>
                        <th>price/expire</th>
                        <th>block</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(event, idx) in events">
                        <th>{{ idx + 1 }}</th>
                        <td>{{ event.type }}</td>
                        <td>{{ event.planet }}</td>
                        <td>{{ event.price || fmt(event.expire) }}</td>
                        <td>{{ event.block }}</td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>
</template>
<script>
import { mapState } from 'pinia';
import { useWalletStore } from '../stores/wallet';
import moment from 'moment';

export default {
    computed: {
        ...mapState(useWalletStore, ['network', 'address', 'balance', 'events']),
    },
    methods: {
        fmt(date) {
            return moment(date * 1000).format('YYYY-MM-DD HH:mm')
        }
    }
}
</script>