import {defineStore} from 'pinia'

export const useIPFSStore = defineStore('ipfs', {
    state: () => (
        {
            online: false,
            peers: 0,
            planets: [],
            following: [],
            focus: '',
            numbers: {}
        }
    )
})
