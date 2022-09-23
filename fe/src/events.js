import {useIPFSStore} from './stores/ipfs'
import {useArticlesStore} from './stores/articles'
import {useTopbarStore} from './stores/topbar'
import {useEditorStore} from './stores/editor'

export default function () {
    const ipfs = useIPFSStore()
    const articles = useArticlesStore()
    const topbar = useTopbarStore()
    const editor = useEditorStore()
    api.recieve('ipfsOnlineState', (p) => {
        console.log('ipfsOnlineState', p[0])
        ipfs.$patch(p[0]);
    })
    api.recieve('myplanets', (p) => {
        ipfs.planets = p[0];
    })
    api.recieve('following', (p) => {
        ipfs.following = p[0]
    })
    api.recieve('articles', (p) => {
        articles.$patch(p[0])
    })
    api.recieve('topbar', (p) => {
        topbar.$patch(p[0])
    })
    api.recieve('updateVideo', (p) => {
        editor.videoFilename = p[0]
    })
    api.recieve('updateAudio', (p) => {
        editor.audioFilename = p[0]
    })
    api.recieve('updateAttachments', p => {
        editor.attachments = p[0]
    })
    api.recieve('editor/update', p => {
        editor.$patch(p[0])
    })
}
