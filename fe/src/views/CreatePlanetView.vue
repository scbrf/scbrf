<template>
    <div class="w-full h-screen nodrag flex flex-col p-2">
        <div class="text-center border-b-2 pb-2">Create Planet</div>
        <div class="flex-1 flex flex-col p-2">
            <div class="flex flex-row p-1">
                <div class="w-16 mr-1">Name:</div>
                <input class="flex-1" v-model="name" />
            </div>
            <div class="flex flex-row flex-1 p-1">
                <div class="w-16 mr-2">About:</div>
                <textarea class="flex-1" v-model="about"></textarea>
            </div>
            <div class="flex flex-row p-1">
                <div class="w-16 mr-2">Template:</div>
                <select class="flex-1" v-model="template">
                    <option>8-bit</option>
                    <option selected>Plain</option>
                </select>
            </div>
        </div>
        <div class="flex flex-row border-t-2 p-2">
            <button @click="doclose">Close</button>
            <div class="flex-1"></div>
            <button @click="doCreate" :disabled="!validate">Create</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            name: '',
            about: '',
            template: 'Plain'
        }
    },
    computed: {
        validate() {
            return this.name && this.template;
        }
    },
    methods: {
        doclose() {
            api.send('ipcCloseWin')
        },
        doCreate() {
            api.send('ipcCreatePlanet', { name: this.name, about: this.about, template: this.template })
        }
    }
}
</script>