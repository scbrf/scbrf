<template>
    <div class="w-full h-screen nodrag flex flex-col p-2">
        <div class="text-center pb-2">{{ id ? 'Edit' : 'Create' }} Planet</div>
        <div class="flex-1 flex flex-col p-2">
            <label class="input-group input-group-sm w-100 flex">
                <span class="w-32">* Name:</span>
                <input type="text" placeholder="somehting cool!" v-model="name"
                    class="input flex-1 input-sm input-bordered" />
            </label>
            <label class="input-group input-group-sm w-100 flex mt-2">
                <span class="w-32">* Template:</span>
                <select class="select select-bordered select-sm flex-1" v-model="template">
                    <option value="gamedb">8-bit</option>
                    <option value="plain" selected>Plain</option>
                </select>
            </label>
            <label v-if="id" class="input-group input-group-sm w-100 flex mt-2">
                <span class="w-32">CBridge:
                    <QuestionMarkCircleIcon @click="gotocib" class="w-4 h-4 mx-2" />
                </span>
                <input type="text" placeholder="comments ipns bridge" v-model="commentsBridge"
                    class="input flex-1 input-sm input-bordered" />
            </label>
            <textarea v-if="!following" placeholder="About your new Planet, Markdown supported"
                class="textarea mt-2 textarea-bordered flex-1 dark:bg-slate-800 p-4" v-model="about"></textarea>

        </div>
        <div class="flex flex-row p-2">
            <button class="btn btn-sm btn-ghost" @click="doclose">Close</button>
            <div class="flex-1"></div>
            <button class="btn btn-sm btn-ghost" @click="doCreate" :disabled="!validate">{{ id ? 'Update'
                    : 'Create'
            }}</button>
        </div>
    </div>
</template>

<script>
import { mapState, mapWritableState } from 'pinia';
import { useEditPlanetStore } from '../stores/editplanet';
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'

export default {
    components: {
        QuestionMarkCircleIcon
    },
    computed: {
        validate() {
            return this.name && this.template;
        },
        ...mapState(useEditPlanetStore, ['id']),
        ...mapWritableState(useEditPlanetStore, ['name', 'about', 'commentsBridge', 'template'])
    },
    methods: {
        gotocib() {
            api.send('ipcOpenUrlExternal', 'https://cib.qiangge.life/')
        },
        doclose() {
            api.send('ipcCloseWin')
        },
        doCreate() {
            api.send('ipcCreatePlanet', { id: this.id, name: this.name, commentsBridge: this.commentsBridge, about: this.about, template: this.template })
        }
    }
}
</script>