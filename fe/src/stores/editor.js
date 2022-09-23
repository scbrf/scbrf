import {defineStore} from 'pinia'

export const useEditorStore = defineStore('editor', {
    state: () => (
        {
            videoFilename: null,
            audioFilename: null,
            attachments: [],
            title: '',
            content: ''
        }
    )
})
