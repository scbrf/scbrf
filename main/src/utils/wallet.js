const { app, ipcMain, BrowserWindow } = require('electron')
const { ethers } = require('ethers')
const evt = require('../utils/events')
const log = require('../utils/log')('wallet')

class Wallet {
  init() {
    evt.bindIpcMainTable(this, [
      [evt.ipcCreateWallet, this.createWallet],
      [evt.ipcUnlockWallet, this.unlockWallet],
    ])
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
    // this.wallet = ethers.Wallet.createRandom()
  }
  async unlockWallet(event, passwd) {
    const win = BrowserWindow.fromWebContents(event.sender)
    this.wallet = ethers.Wallet.fromEncryptedJsonSync(require('fs').readFileSync(this.walletPath).toString(), passwd)
    win.closable = true
    win.close()
  }
  async createWallet(event, passwd) {
    const win = BrowserWindow.fromWebContents(event.sender)
    this.wallet = ethers.Wallet.createRandom()
    if (!require('fs').existsSync(this.walletDir)) {
      require('fs').mkdirSync(this.walletDir, { recursive: true })
    }
    require('fs').writeFileSync(this.walletPath, await this.wallet.encrypt(passwd))
    win.closable = true
    win.close()
  }
  get provider() {
    const network = 'homestead'
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
    const resolve = await this.provider.getResolver(ens)
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
    const resolve = await this.provider.getResolver(ens)
    const avatar = await resolve.getAvatar()
    log.info(`resolve avatar return ${avatar}`)
    return avatar && avatar.url
  }
}

module.exports = new Wallet()
