const axios = require("axios").default;
require('electron')
require('fs')
jest.mock('electron');
jest.mock('axios')
const ipfs = require('../utils/ipfs')
const wallet = require('../utils/wallet')

jest.mock('./utils/ipfs')
jest.mock('./utils/wallet')

// we will neven write local filesystem during unittest
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    writeFileSync: () => {},
    mkdirSync: () => {}
}));


const planet = require('./planet')

beforeEach(() => {
    jest.resetAllMocks()
})

test('follow .eth succ', async () => {
    wallet.resolveENS.mockResolvedValueOnce('testipns')
    wallet.resolveAvatar.mockResolvedValueOnce('nouse')
    ipfs.resolveIPNSorDNSLink.mockResolvedValue('test')
    axios.post.mockResolvedValueOnce({
        data: {
            "errno": 0,
            "errmsg": "",
            "data": {
                "account": "yygqg.bit",
                "records": [
                    {
                        "key": "dweb.ipns",
                        "label": "main",
                        "value": "k51qzi5uqu5dhwplb6cjq09qrlcyafzpdd36vlzzrih8b5tn5x8kc2prjohhzt",
                        "ttl": "300"
                    }
                ]
            }
        }
    })
    axios.get.mockResolvedValueOnce({
        data: {
            "about": "欢迎在小宇宙，网易云音乐，喜马拉雅或者苹果的 Podcast 搜索关注我的播客“四十不惑”，后续的更新也会同步在 Planet 。\n欢迎在 Planet follow 我： yygqg.eth",
            "articles": [
                {
                    "attachments": ["第41期 我在传统纸媒当记者三十年.mp3"],
                    "audioFilename": "第41期 我在传统纸媒当记者三十年.mp3",
                    "content": "这里是播客《四十不惑》第41期。\n\n本期嘉宾龙哥在传统媒体，XX报社做记者超过三十年，本期有幸请龙哥跟大家分享一些自己的感悟，期间主要涉及的问题有：\n\n1. 传统纸媒的生存状态\n2. 纸媒记者的成就感与自我实现\n3. 新媒体与纸媒的合作和挑战\n4. 纸媒记者的收入待遇\n5. 纸媒记者就业情况分析\n6. 未来的一些展望\n\n\n四十不惑现已登陆小宇宙、网易云音乐、喜马拉雅、苹果Podcast，微信公众号：又一个强哥，以及 Planet：yygqg.eth，欢迎在各平台收听，评论，转发，一键三连，感谢！",
                    "created": 685019649.40590096,
                    "hasAudio": true,
                    "hasVideo": false,
                    "id": "3AC7C27C-5750-4ED8-82B4-6497AF738625",
                    "link": "\/3AC7C27C-5750-4ED8-82B4-6497AF738625\/",
                    "title": "第41期 我在传统纸媒当记者三十年"
                }
            ],
            "created": 676172757.31802595,
            "id": "27EDB033-9B52-4445-A457-E5D9D88061AA",
            "ipns": "k51qzi5uqu5dhwplb6cjq09qrlcyafzpdd36vlzzrih8b5tn5x8kc2prjohhzt",
            "name": "又一个强哥",
            "plausibleAPIServer": "plausible.io",
            "plausibleDomain": "yygqg.eth.limo",
            "plausibleEnabled": true,
            "updated": 685019649.42446303
        }
    })

    const result = await planet.FollowingPlanet.follow('yygqg.eth', () => {})
    expect(result.planetType).toBe('.ens')
})

test('follow .bit succ', async () => {
    ipfs.resolveIPNSorDNSLink.mockResolvedValue('test')
    axios.post.mockResolvedValueOnce({
        data: {
            "errno": 0,
            "errmsg": "",
            "data": {
                "account": "yygqg.bit",
                "records": [
                    {
                        "key": "dweb.ipns",
                        "label": "main",
                        "value": "k51qzi5uqu5dhwplb6cjq09qrlcyafzpdd36vlzzrih8b5tn5x8kc2prjohhzt",
                        "ttl": "300"
                    }
                ]
            }
        }
    })
    axios.get.mockResolvedValueOnce({
        data: {
            "about": "欢迎在小宇宙，网易云音乐，喜马拉雅或者苹果的 Podcast 搜索关注我的播客“四十不惑”，后续的更新也会同步在 Planet 。\n欢迎在 Planet follow 我： yygqg.eth",
            "articles": [
                {
                    "attachments": ["第41期 我在传统纸媒当记者三十年.mp3"],
                    "audioFilename": "第41期 我在传统纸媒当记者三十年.mp3",
                    "content": "这里是播客《四十不惑》第41期。\n\n本期嘉宾龙哥在传统媒体，XX报社做记者超过三十年，本期有幸请龙哥跟大家分享一些自己的感悟，期间主要涉及的问题有：\n\n1. 传统纸媒的生存状态\n2. 纸媒记者的成就感与自我实现\n3. 新媒体与纸媒的合作和挑战\n4. 纸媒记者的收入待遇\n5. 纸媒记者就业情况分析\n6. 未来的一些展望\n\n\n四十不惑现已登陆小宇宙、网易云音乐、喜马拉雅、苹果Podcast，微信公众号：又一个强哥，以及 Planet：yygqg.eth，欢迎在各平台收听，评论，转发，一键三连，感谢！",
                    "created": 685019649.40590096,
                    "hasAudio": true,
                    "hasVideo": false,
                    "id": "3AC7C27C-5750-4ED8-82B4-6497AF738625",
                    "link": "\/3AC7C27C-5750-4ED8-82B4-6497AF738625\/",
                    "title": "第41期 我在传统纸媒当记者三十年"
                }
            ],
            "created": 676172757.31802595,
            "id": "27EDB033-9B52-4445-A457-E5D9D88061AA",
            "ipns": "k51qzi5uqu5dhwplb6cjq09qrlcyafzpdd36vlzzrih8b5tn5x8kc2prjohhzt",
            "name": "又一个强哥",
            "plausibleAPIServer": "plausible.io",
            "plausibleDomain": "yygqg.eth.limo",
            "plausibleEnabled": true,
            "updated": 685019649.42446303
        }
    })

    const result = await planet.FollowingPlanet.follow('yygqg.bit', () => {})
    expect(result.planetType).toBe('.bit')
});

test('follow .bit indexer error', async () => {
    let error
    const cb = (msg) => error = msg
    axios.post.mockResolvedValueOnce({
        data: {
            errno: 1000,
            errmsg: 'fake'
        }
    })
    await planet.FollowingPlanet.follow('yygqg.bit', cb)
    expect(error).toBe('.bit indexer error:fake')
});
