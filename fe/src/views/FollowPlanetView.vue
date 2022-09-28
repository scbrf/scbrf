<template>
    <div class="w-full h-screen nodrag flex flex-col p-2">
        <div class="text-center pb-2">Follow Planet</div>
        <div class="flex-1 flex flex-col p-2">
            <div class="flex flex-row flex-1 p-1">
                <textarea v-if="!following" placeholder=".eth .bit or ipns directly"
                    class="textarea  textarea-bordered flex-1 dark:bg-slate-800 p-4" v-model="follow"></textarea>
                <div class="flex-1 flex flex-col items-center justify-center" v-else>
                    <progress class="progress w-60 mb-2"></progress>
                    <div class="msg"> following, please wait ... </div>
                </div>
            </div>
        </div>
        <div class="flex flex-row  p-2">
            <button class="btn btn-sm btn-ghost" @click="doclose">Close</button>
            <div class="flex-1"></div>
            <button @click="doFollow" class="btn btn-sm btn-ghost" :disabled="!validate || following">Follow</button>
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