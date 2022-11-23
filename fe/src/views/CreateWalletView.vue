<template>
    <div class="p-4 w-screen h-screen drag flex flex-col">
        <div class="text-center p-4 border-b text-2xl font-bold antialiased">创建钱包</div>
        <div class="text-justify mt-1 p-2 leading-6">
            将会为您创建一个以太坊的数字钱包作为您的数字身份，您创建的所有站点将共享这一身份。这个身份是一串毫无意义的数字，您在Scarborough中发布内容，发表评论时，这串数字将会公开展示。这串数字不会关联您的任何个人信息。请<span
                class="font-bold">不要往这个数字钱包中转移数字货币</span>，除非您清楚知道自己在做什么。
        </div>
        <div class="text-justify pt-2 leading-6">
            在下面的文本框中输入一个密码，我们不会记录这个密码，忘记密码将丢失所有数据及资产。
        </div>
        <div class="flex-1"></div>
        <label class="input-group input-group-sm w-100 flex mt-2 nodrag">
            <input type="password" placeholder="请输入密码!" v-model="passwd1"
                class="input flex-1 input-sm input-bordered font-bold text-center" autofocus />
            <input type="password" placeholder="请重复输入!" v-model="passwd2"
                class="input flex-1 input-sm input-bordered font-bold text-center" />
        </label>
        <div class="flex-1"></div>
        <div class="flex justify-center m-2">
            <button class="btn btn-sm btn-outline nodrag" :disabled="!validate" @click="createWallet">创建钱包</button>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            passwd1: '',
            passwd2: '',
            disabled: false,
        }
    },
    computed: {
        validate() {
            return this.passwd1 && (this.passwd1 == this.passwd2) && !this.disabled
        }
    },
    methods: {
        createWallet() {
            this.disabled = true
            api.send('ipcCreateWallet', this.passwd1)
        }
    }
}
</script>