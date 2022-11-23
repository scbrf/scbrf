const { app, ipcMain, BrowserWindow } = require('electron')
const { ethers } = require('ethers')
const md5 = require('md5')
const evt = require('../utils/events')
const log = require('../utils/log')('wallet')

const ENS_NETWORK = 'homestead'
const CONTRACT_NETWORK = 'goerli'
const FairContractAddr = '0x5C1F5750764508B52025D7ea6a50beFc8EF7fdC1'
const OnlyfansContractAddr = '0x60f1400CEF89D076Dc3A27afe4613FA534eA4b9C'

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
        'event FanAdded(bytes32 ipns, address fan, uint256 expire)',
        'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
        'event PlanetAdded(bytes32 ipns, address owner, uint256 price)',
        'event PlanetModified(bytes32 ipns, address owner, uint256 price)',
        'function owner() view returns (address)',
        'function rate() view returns (uint256)',
        'function renounceOwnership()',
        'function transferOwnership(address newOwner)',
        'function myfans(bytes32 ipns) view returns (tuple(bytes pubkey, uint256 expire)[])',
        'function setRate(uint256 value)',
        'function registerPlanet(bytes32 ipns, bytes32 r, bytes32 s, address owner, uint256 price)',
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

  async donate(ipns, uuid, duration, value) {
    return await this.donateContract.donate(ipns, uuid, parseFloat(duration) * 3600, {
      value: ethers.utils.parseEther(`${value}`),
    })
  }

  async durationLimit() {
    return await this.donateContract.DurationLimit()
  }

  async fairHot50() {
    return await this.donateContract.hot50()
  }

  async myfans(ipns) {
    return await this.onlyfansContract.myfans(ipns)
  }
}

module.exports = new Wallet()
