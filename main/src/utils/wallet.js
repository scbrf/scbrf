const { app, ipcMain, BrowserWindow } = require('electron')
const { ethers } = require('ethers')
const md5 = require('md5')
const evt = require('../utils/events')
const log = require('../utils/log')('wallet')

const ENS_NETWORK = 'homestead'
const CONTRACT_NETWORK = 'goerli'
const FairContractAddr = '0x41A9C5c31C7DA41078705Bf0cf2abD099Ffb8B7B'
const OnlyfansContractAddr = '0x667bE3111c878C0cC1a980a4acb556B79D0fF612'

class Wallet {
  init() {
    evt.bindIpcMainTable(this, [[evt.ipcCreateWallet, this.createWallet]])
    this.walletDir = require('path').join(app.__root__, 'wallet')
    this.walletPath = require('path').join(this.walletDir, 'wallet.json')
    if (require('fs').existsSync(this.walletPath)) {
      this.needUnlock = true
    } else {
      this.needCreate = true
    }
    ipcMain.handle('wallet/address', () => {
      return this.wallet.address
    })
    ipcMain.handle('ipc/eth_requestAccounts', () => {
      return [this.wallet.address]
    })
    ipcMain.handle('ipc/personal_sign', async (_, param) => {
      const msg = param[0]
      return await this.wallet.signMessage(msg)
    })
    ipcMain.handle('unlockWallet', async (event, passwd) => {
      try {
        this.wallet = ethers.Wallet.fromEncryptedJsonSync(
          require('fs').readFileSync(this.walletPath).toString(),
          passwd
        )
        this.passwdSign = md5(passwd)
        const win = BrowserWindow.fromWebContents(event.sender)
        win.closable = true
        win.close()
        this.initContract()
      } catch (ex) {
        return ex.message
      }
    })
  }

  //return a 32bytes buffer
  async ipfsPkFromId(id) {
    const uuidBuffer = require('uuid-buffer')
    const b = uuidBuffer.toBuffer(id)
    const idbuffer = Buffer.concat([b, b])
    const walletpk = Buffer.from(this.wallet.privateKey.substring(2), 'hex')
    const seed = Buffer.alloc(32)
    for (let i = 0; i < 32; i++) {
      seed[i] = (idbuffer[i] + walletpk[i]) % 256
    }
    const ed = require('@noble/ed25519')
    const pk = await ed.getPublicKey(seed)
    return pk
  }

  async ipnsFromId(id) {
    const ed = require('@noble/ed25519')
    const pk = await this.ipfsPkFromId(id)
    const publickey = await ed.getPublicKey(pk)
    const { binary_to_base58 } = require('base58-js')
    const ipnsbytes = Buffer.concat([Buffer.from('002408011220', 'hex'), publickey])
    return binary_to_base58(ipnsbytes)
  }

  async publicKeyFromId(id) {
    const pk = await this.ipfsPkFromId(id)
    const publickey = await ed.getPublicKey(pk)
    return Buffer.from(publickey).toString('hex')
  }

  async createWallet(event, passwd) {
    const win = BrowserWindow.fromWebContents(event.sender)
    this.wallet = ethers.Wallet.createRandom()
    if (!require('fs').existsSync(this.walletDir)) {
      require('fs').mkdirSync(this.walletDir, { recursive: true })
    }
    this.passwdSign = md5(passwd)
    this.initContract()
    require('fs').writeFileSync(this.walletPath, await this.wallet.encrypt(passwd))
    win.closable = true
    win.close()
  }

  initContract() {
    this.donateContract = new ethers.Contract(
      FairContractAddr,
      [
        'event ContentAdded(string ipns, string uuid, uint256 duration, uint256 pos)',
        'event ContentRemoved(string ipns, string uuid)',
        'event ContentTimePaused(string ipns, string uuid, uint256 duration)',
        'event ContentTimeRecovery(string ipns, string uuid, uint256 duration, uint256 pos)',
        'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
        'function DurationLimit() view returns (uint256)',
        'function owner() view returns (address)',
        'function renounceOwnership()',
        'function transferOwnership(address newOwner)',
        'function hot50() view returns (tuple(string ipns, string uuid, uint256 value, uint256 when, uint256 duration)[50], uint256)',
        'function setLimit(uint256 v)',
        'function donate(string ipns, string uuid, uint256 duration) payable',
      ],
      new ethers.Wallet(this.wallet.privateKey, this.provider(CONTRACT_NETWORK))
    )
    this.onlyfansContract = new ethers.Contract(
      OnlyfansContractAddr,
      [
        'event FanAdded(bytes32 indexed ipns, address indexed fan, uint256 expire)',
        'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
        'event PlanetRegistered(bytes32 indexed ipns, address indexed owner, uint256 price)',
        'function owner() view returns (address)',
        'function rate() view returns (uint256)',
        'function renounceOwnership()',
        'function transferOwnership(address newOwner)',
        'function planet(bytes32 ipns) view returns (uint256, address, bytes)',
        'function planetFans(bytes32 ipns, bool senderOnly) view returns (tuple(bytes pubkey, uint256 expire)[])',
        'function setRate(uint256 value)',
        'function registerPlanet(bytes32 ipns, bytes signature, address owner, uint256 price)',
        'function subscribe(bytes32 ipns, uint256 duration, bytes pubkey) payable',
      ],
      new ethers.Wallet(this.wallet.privateKey, this.provider(CONTRACT_NETWORK))
    )
  }

  provider(network) {
    return ethers.getDefaultProvider(network, {
      etherscan: 'EJBW93QCI6F38PIYI8ME2SDGCRD7QZR3JU',
      infura: 'a05d6642580e4e0eb70c4328c9eb5da7',
      alchemy: 'Q12yR30kCLhjOR2ovkX5y0xbi5y-z-D2',
      pocket: {
        applicationId: '63270c93708ade00392c7697',
        applicationSecretKey: '5abbe04d84dc71de4c6c26d7177ac7bd',
      },
    })
  }
  async resolveENS(ens) {
    log.info(`need resolve ${ens}`)
    const resolve = await this.provider(ENS_NETWORK).getResolver(ens)
    if (resolve) {
      const ipns = await resolve.getContentHash()
      log.info(`resolve content hash return ${ipns}`)
      return ipns
    } else {
      log.error('ens resolve fail!', ens)
    }
  }

  async resolveAvatar(ens) {
    log.info(`need resolve avatar for ${ens}`)
    const resolve = await this.provider(ENS_NETWORK).getResolver(ens)
    const avatar = await resolve.getAvatar()
    log.info(`resolve avatar return ${avatar}`)
    return avatar && avatar.url
  }

  async balance() {
    const bn = await this.provider(CONTRACT_NETWORK).getBalance(this.wallet.address)
    return ethers.utils.formatEther(bn)
  }

  async network() {
    return this.provider(CONTRACT_NETWORK).getNetwork()
  }

  async validatePasswd(passwd) {
    return md5(passwd) === this.passwdSign
  }

  async estimateGasForFair(ipns, uuid, duration, value) {
    const bn = await this.donateContract.estimateGas.donate(ipns, uuid, duration, {
      value: ethers.utils.parseEther(`${value}`),
    })
    return ethers.utils.formatEther(bn)
  }

  async estimateGasForSubscribeOnlyfans(ipns, price, days) {
    const bn = await this.onlyfansContract.estimateGas.subscribe(
      ipns,
      days,
      '0x' + this.wallet.publicKey.substring(4),
      {
        value: ethers.utils.parseEther(`${price * days}`),
      }
    )
    return ethers.utils.formatEther(bn)
  }

  async estimateGasForRegisterOnlyfans(ipns, signature, price) {
    const bn = await this.onlyfansContract.estimateGas.registerPlanet(
      ipns,
      signature,
      this.wallet.address,
      ethers.utils.parseEther(`${price}`)
    )
    return ethers.utils.formatEther(bn)
  }

  async donate(ipns, uuid, duration, value) {
    return await this.donateContract.donate(ipns, uuid, parseFloat(duration) * 3600, {
      value: ethers.utils.parseEther(`${value}`),
    })
  }

  async subscribePlanet(pubkey, price, days) {
    return await this.onlyfansContract.subscribe(pubkey, days, '0x' + this.wallet.publicKey.substring(4), {
      value: ethers.utils.parseEther(`${price * days}`),
    })
  }

  async registerPlanet(ipns, signature, price) {
    return await this.onlyfansContract.registerPlanet(
      ipns,
      signature,
      this.wallet.address,
      ethers.utils.parseEther(`${price}`)
    )
  }

  async onlyfansPlanetInfo(ipns) {
    const info = await this.onlyfansContract.planet(ipns)
    const price = parseFloat(ethers.utils.formatEther(info[0]))
    if (price > 0) {
      return info
    }
  }

  async durationLimit() {
    return await this.donateContract.DurationLimit()
  }

  async fairHot50() {
    return await this.donateContract.hot50()
  }

  static ipnsB582Hex(ipns) {
    const { base58_to_binary } = require('base58-js')
    const pubkey = base58_to_binary(ipns).slice(6)
    return '0x' + Buffer.from(pubkey).toString('hex')
  }

  async myfans(ipns) {
    if (ipns.startsWith('12D3')) {
      ipns = Wallet.ipnsB582Hex(ipns)
    }
    return await this.onlyfansContract.planetFans(ipns)
  }

  async listOnlyfansSubscribeEvents() {
    const filter1 = await this.onlyfansContract.filters.PlanetRegistered(null, this.wallet.address)
    const result1 = await this.onlyfansContract.queryFilter(filter1)
    const filter2 = await this.onlyfansContract.filters.FanAdded(null, this.wallet.address)
    const result2 = await this.onlyfansContract.queryFilter(filter2)
    return [
      ...result1.map((e) => ({
        type: 'register',
        ipns: e.args.ipns,
        price: ethers.utils.formatEther(e.args.price),
        block: e.blockNumber,
      })),
      ...result2.map((e) => ({
        type: 'subscrible',
        ipns: e.args.ipns,
        expire: e.args.expire.toNumber(),
        block: e.blockNumber,
      })),
    ]
  }
}

module.exports = new Wallet()
