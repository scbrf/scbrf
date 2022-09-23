import {defineStore} from 'pinia'

export const useArticlesStore = defineStore('articles', {
    state: () => (
        {title: '', articles: [], focus: ''}
    )
})
