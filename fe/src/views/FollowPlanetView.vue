<template>
    <div class="w-full h-screen nodrag flex flex-col p-2">
        <div class="text-center border-b-2 pb-2">Follow Planet</div>
        <div class="flex-1 flex flex-col p-2">
            <div class="flex flex-row flex-1 p-1">
                <textarea v-if="!following" class="flex-1 dark:bg-slate-800 p-2" v-model="follow"></textarea>
                <div class="flex-1 flex items-center justify-center msg" v-else>following, please wait ...</div>
            </div>
        </div>
        <div class="flex flex-row border-t-2 p-2">
            <button @click="doclose">Close</button>
            <div class="flex-1"></div>
            <button @click="doFollow" :disabled="!validate || following">Follow</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            follow: '',
            following: false
        }
    },
    computed: {
        validate() {
            return this.follow;
        }
    },
    methods: {
        doclose() {
            api.send('ipcCloseWin')
        },
        doFollow() {
            this.following = true
            api.send('ipcFollowPlanet', { follow: this.follow })
        }
    }
}
</script>