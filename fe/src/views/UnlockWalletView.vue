<template>
    <div class="p-4 w-screen h-screen drag flex flex-col">
        <div class="text-center p-4 border-b text-2xl font-bold antialiased">解锁钱包</div>
        <div class="flex-1"></div>
        <label class="input-group input-group-sm w-100 flex justify-center mt-2 nodrag">
            <input type="password" placeholder="请输入密码!" v-model="passwd"
                class="input input-sm input-bordered font-bold text-center" />
        </label>
        <div class="flex text-xs opacity-50 mt-4 text-center leading-6 justify-center">*
            如果忘记密码，您可以退出程序、删除密码文件，然后重新启动程序以创建新密码</div>
        <div class="flex-1"></div>
        <div class="flex justify-center m-2">
            <button class="btn btn-sm btn-outline nodrag" :disabled="!validate" @click="createWallet">解锁钱包</button>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            passwd: '',
            disabled: false,
        }
    },
    computed: {
        validate() {
            return this.passwd && !this.disabled
        }
    },
    methods: {
        createWallet() {
            this.disabled = true
            api.send('ipcUnlockWallet', this.passwd)
        }
    }
}
</script>