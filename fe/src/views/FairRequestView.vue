<template>
    <div v-if="!title || isLoading" class="h-screen w-screen flex flex-col items-center justify-center">
        <XCircleIcon @click="closeWin" class="absolute right-4 top-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
        </XCircleIcon>
        <progress class="progress w-56 mb-4"></progress>
        <div>Loading, may take a few minutes depend on your network...</div>
        <div v-if="error" class="flex-1 flex items-center justify-center text-red-600 font-bold mt-4">{{ error }}</div>
    </div>
    <div v-else class="h-screen w-screen flex flex-col p-4">
        <div class="text-lg text-center font-bold my-2">投放到集市</div>
        <div class="leading-6 mb-2 font-bold">
            站点 {{ planet }} 的文章 {{ title }} 将会被投放到集市，所有人都有机会看到您的文章，也可以看到您的整个站点。
        </div>
        <div class="leading-6 mb-2">
            您需要为此支付 Gas 费(预计: {{gas}})和社区捐赠(金额由您决定但不能为空，将全数用于支援社区运作)
        </div>
        <div class="leading-6 mb-2">
            您的钱包地址是：<span class="font-bold"> {{address}} </span>,当前的余额是: {{balance}} ETH <span
                class="font-bold">(测试网络:Goerli)</span>.
        </div>
        <div class="form-control flex flex-col items-stretch justify-center w-100 px-24 py-4">
            <label class="input-group input-group-sm flex  w-auto">
                <span>捐赠金额：</span>
                <input v-model="value" type="text" placeholder="Type here"
                    class="input flex-1 input-bordered input-sm" />
                <span>ETH</span>
            </label>
            <label class="input-group input-group-sm  w-auto mt-2">
                <span>投放时长：</span>
                <input v-model="duration" type="text" placeholder="Type here"
                    class="input flex-1 input-bordered input-sm" />
                <span>小时</span>
            </label>
            <label class="input-group input-group-sm  w-auto mt-2">
                <span>钱包密码：</span>
                <input v-model="passwd" type="password" placeholder="Type here"
                    class="input flex-1 input-bordered input-sm" />
            </label>
        </div>
        <div class="flex-1 flex items-center justify-center text-red-600 font-bold">{{ error }}</div>
        <div class="border-t flex p-2">
            <button @click="closeWin" class="btn btn-ghost btn-sm mr-4">Close</button>
            <div class="flex-1"></div>
            <button @click="fairRequest" :disabled="!validated" class="btn btn-ghost btn-sm mr-4">Run</button>
        </div>

    </div>
</template>
<script>
import { mapState, } from 'pinia';
import { useFairStore } from '../stores/fair';
import { XCircleIcon } from '@heroicons/vue/24/outline'

export default {
    components: {
        XCircleIcon
    },
    data() {
        return {
            value: 0.01,
            duration: 24,
            passwd: '',
            isLoading: false,
            error: ''
        }
    },
    methods: {
        closeWin() {
            api.send('ipcCloseWin')
        },
        fairRequest() {
            this.isLoading = true
            api.send('ipcFairRequest', {
                passwd: this.passwd,
                value: this.value,
                duration: this.duration
            })
        }
    },
    computed: {
        validated() {
            return this.value && parseFloat(this.value) > 0 && this.duration && parseInt(this.duration) > 0 && parseFloat(this.value) < parseFloat(this.balance) && this.passwd && !this.isLoading
        },
        ...mapState(useFairStore, ['title', 'address', 'balance', 'gas', 'planet', 'error'])
    }
}
</script>