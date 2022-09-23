import { defineStore } from 'pinia'

export const useTopbarStore = defineStore('topbar', {
  state: () => ({
    planet: {},
    article: {}
  })
})
