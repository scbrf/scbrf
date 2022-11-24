<template>
    <div v-if="(!planet || isLoading) && !error" class="h-screen w-screen flex flex-col items-center justify-center">
        <XCircleIcon @click="closeWin" class="absolute right-4 top-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
        </XCircleIcon>
        <progress class="progress w-56 mb-4"></progress>
        <div>Loading, may take a few minutes depend on your network...</div>
    </div>
    <div v-else class="h-screen w-screen flex flex-col p-4">
        <div class="text-lg text-center font-bold my-2">FansOnly 订阅</div>
        <div class="leading-6 mb-2 font-bold">
            你确定要订阅 {{ planet }} 以阅读粉丝限定的内容吗？
        </div>
        <div class="leading-6 mb-2">
            站点 {{ planet }} 当前设置的订阅价格为每天{{ price }} ETH, 预计需要 Gas 费: {{ gas }} ETH
        </div>
        <div class="leading-6 mb-2">
            您的钱包地址是：<span class="font-bold"> {{ address }} </span>,当前的余额是: {{ balance }} ETH <span
                class="font-bold">(测试网络:Goerli)</span>.
        </div>
        <div class="flex-1 form-control flex flex-col items-stretch justify-center w-100 px-24 py-4">
            <label class="input-group input-group-sm flex  w-auto">
                <span>订阅时长：</span>
                <input v-model="value" type="text" placeholder="Type here"
                    class="input flex-1 input-bordered input-sm" />
                <span>天</span>
            </label>
            <label class="input-group input-group-sm  w-auto mt-2">
                <span>钱包密码：</span>
                <input v-model="passwd" type="password" placeholder="Type here"
                    class="input flex-1 input-bordered input-sm" />
            </label>
        </div>
        <div class="flex items-center w-100 justify-center text-red-600 font-bold">{{
                error.substring(0, 100)
        }}</div>
        <div class="border-t flex p-2">
            <button @click="closeWin" class="btn btn-ghost btn-sm mr-4">Close</button>
            <div class="flex-1"></div>
            <button @click="registerPlanetRequest" :disabled="!validated" class="btn btn-ghost btn-sm mr-4">Run</button>
        </div>

    </div>
</template>
<script>
import { mapState, mapWritableState } from 'pinia';
import { useOnlyfansStore } from '../../stores/register_onlyfans';
import { XCircleIcon } from '@heroicons/vue/24/outline'

export default {
    components: {
        XCircleIcon
    },
    data() {
        return {
            value: 30,
            passwd: '',
            isLoading: false,
        }
    },
    watch: {
        error() {
            if (this.error) {
                this.isLoading = false;
            }
        }
    },
    methods: {
        closeWin() {
            api.send('ipcCloseWin')
        },
        registerPlanetRequest() {
            this.isLoading = true
            api.send('ipcOnlyfansSubscribePlanetRequest', {
                passwd: this.passwd,
                days: this.value,
                pubkey: this.pubkey,
                price: this.price
            })
        }
    },
    computed: {
        validated() {
            this.error = ''
            if ((parseFloat(this.value * this.price) >= parseFloat(this.balance))) {
                this.error = '余额不足';
            }
            return this.value &&
                (parseFloat(this.value) > 0) &&
                this.passwd &&
                !this.isLoading
        },
        ...mapState(useOnlyfansStore, ['address', 'balance', 'gas', 'planet', 'price', 'pubkey']),
        ...mapWritableState(useOnlyfansStore, ['error'])
    }
}
</script>