const { execFile, spawn } = require('node:child_process')
const evt = require('./events')
const axios = require('axios').default
const log = require('../utils/log')('ipfs')

const OS = require('os').platform()
const EXE_FILE = OS === 'win32' ? 'ipfs.exe' : 'ipfs'

class IPFSDaemon {
  // 启动并监视IPFS Daemon
  static REPO_PATH = require('path').join(__dirname, '..', '..', '..', 'debugrepo')
  static EXE_PATH = require('path').join(__dirname, '..', '..', '..', 'ipfsbin', EXE_FILE)
  constructor() {
    evt.bindBusTable(this, [
      [evt.evAppInit, this.init],
      [evt.evAppQuit, this.ipfsShutdown],
    ])
  }
  async init() {
    this.isBootstrapping = true
    this.online = false
    this.runIPFSDaemon()
    this.monitorTimer = setInterval(async () => {
      await this.updateOnlineStatus()
      let onlineStatus = this.online
      let bootstrappingStatus = await this.isBootstrapping
      if (!onlineStatus && !bootstrappingStatus) {
        await this.launchDaemon()
      }
    }, 30000)
  }
  get gateway() {
    return `http://127.0.0.1:${this.gatewayPort}`
  }
  async runIPFSDaemon() {
    try {
      await this.ipfsShutdown()
    } catch (_) {}
    await this.ipfsLaunchDaemon()
  }
  async ipfsShutdown() {
    log.info('shutdown daemon called!')
    return this.runIPFSCmd('shutdown')
  }
  async importKey(name, path) {
    log.info(`import IPFS keypair from ${path}`)
    const rsp = await this.runIPFSCmd('key', 'import', name, path)
    return rsp.trim()
  }
  async generateKey(id) {
    log.info(`Generating IPFS keypair for ${id}`)
    const rsp = await this.runIPFSCmd('key', 'gen', id)
    return rsp.trim()
  }
  async resolveIPNSorDNSLink(ipns) {
    log.info('resolve ipns for', ipns)
    let result = await this.api('name/resolve', { arg: ipns })
    log.info('resolve ipns return', result)
    result = result.Path.trim()
    if (result.startsWith('/ipfs/')) {
      return result.substring('/ipfs/'.length)
    }
    log.error('resolve ipns return unknown', result)
  }
  //list all cid local pined
  async listPin() {
    const out = await this.runIPFSCmd('pin', 'ls', '-t', 'direct', '--encoding=json')
    const json = JSON.parse(out)
    return Object.keys(json.Keys)
  }
  async rmPin(cid) {
    if (!cid.trim()) return
    log.debug('remove pin recursive for', cid)
    const result = await this.runIPFSCmd('pin', 'rm', '-r', cid)
    log.debug('remove pin return', result)
  }
  async pin(cid, recursive = false) {
    log.info('pin cid', cid)
    try {
      const data = await this.api(
        'pin/add',
        {
          arg: cid,
          recursive,
        },
        { timeout: 120000 }
      )
      log.info('pin cid done', { path: cid, result: data })
      return data.Pins[0]
    } catch (ex) {
      log.error('pin error, this may not problem', ex.toString())
    }
  }
  async ipfsLaunchDaemon() {
    if (!require('fs').existsSync(IPFSDaemon.REPO_PATH)) {
      log.info('need init ipfs repo')
      await this.initIPFS()
    }
    const portfinder = require('portfinder')
    this.swarmPort = await portfinder.getPortPromise({
      port: 4001, // minimum port
      stopPort: 4011,
    })
    await this.updateSwarmPort(this.swarmPort)
    this.APIPort = await portfinder.getPortPromise({
      port: 5981, // minimum port
      stopPort: 5991,
    })
    await this.updateAPIPort(this.APIPort)
    this.gatewayPort = await portfinder.getPortPromise({
      port: 18181, // minimum port
      stopPort: 18191,
    })
    await this.updateGatewayPort(this.gatewayPort)
    log.info('setting peers')
    await this.setPeers([
      {
        ID: '12D3KooWBJY6ZVV8Tk8UDDFMEqWoxn89Xc8wnpm8uBFSR3ijDkui',
        Addrs: ['/ip4/167.71.172.216/tcp/4001', '/ip6/2604:a880:800:10::826:1/tcp/4001'],
      },
      {
        ID: 'QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP',
        Addrs: ['/ip6/2606:4700:60::6/tcp/4009', '/ip4/172.65.0.13/tcp/4009'],
      },
      {
        ID: 'QmUEMvxS2e7iDrereVYc5SWPauXPyNwxcy9BXZrC1QTcHE',
        Addrs: ['/dns/cluster0.fsn.dwebops.pub'],
      },
      {
        ID: 'QmNSYxZAiJHeLdkBg38roksAR9So7Y5eojks1yjEcUtZ7i',
        Addrs: ['/dns/cluster1.fsn.dwebops.pub'],
      },
      {
        ID: 'QmUd6zHcbkbcs7SMxwLs48qZVX3vpcM8errYS7xEczwRMA',
        Addrs: ['/dns/cluster2.fsn.dwebops.pub'],
      },
      {
        ID: 'QmbVWZQhCGrS7DhgLqWbgvdmKN7JueKCREVanfnVpgyq8x',
        Addrs: ['/dns/cluster3.fsn.dwebops.pub'],
      },
      {
        ID: 'QmdnXwLrC8p1ueiq2Qya8joNvk3TVVDAut7PrikmZwubtR',
        Addrs: ['/dns/cluster4.fsn.dwebops.pub'],
      },
      {
        ID: '12D3KooWCRscMgHgEo3ojm8ovzheydpvTEqsDtq7Vby38cMHrYjt',
        Addrs: ['/dns4/nft-storage-am6.nft.dwebops.net/tcp/18402'],
      },
      {
        ID: '12D3KooWQtpvNvUYFzAo1cRYkydgk15JrMSHp6B6oujqgYSnvsVm',
        Addrs: ['/dns4/nft-storage-dc13.nft.dwebops.net/tcp/18402'],
      },
      {
        ID: '12D3KooWQcgCwNCTYkyLXXQSZuL5ry1TzpM8PRe9dKddfsk1BxXZ',
        Addrs: ['/dns4/nft-storage-sv15.nft.dwebops.net/tcp/18402'],
      },
    ])
    await this.setSwarmConnMgr({ GracePeriod: '20s', HighWater: 240, LowWater: 120, Type: 'basic' })
    this.launchDaemon()
  }

  async updateOnlineStatus() {
    log.debug('update online status')
    let url = `http://127.0.0.1:${this.APIPort}/webui`
    const rsp = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    if (rsp.status === 200) {
      this.online = true
    } else {
      this.online = false
    }

    let peers = 0
    if (this.online) {
      let data = await this.api('swarm/peers')
      peers = data.Peers.length
    }

    if (this.online) {
      this.isBootstrapping = false
      this.peers = peers
    }

    require('../models/runtime').set({
      ipfsOnline: this.online,
      ipfsPeers: this.peers,
    })
  }

  async api(path, args, options) {
    log.debug('api request to ipfs with', { path, args })
    let url = `http://127.0.0.1:${this.APIPort}/api/v0/${path}`
    if (args) {
      url += '?' + require('querystring').encode(args)
    }
    log.debug('api with request with url', url)
    const rsp = await axios.post(url, null, options)
    return rsp.data
  }

  async launchDaemon() {
    this.daemon = spawn(IPFSDaemon.EXE_PATH, [
      'daemon',
      '--migrate',
      '--enable-namesys-pubsub',
      '--enable-pubsub-experiment',
    ])
    this.daemon.stdout.on('data', (data) => {
      log.info(`daemon: ${data}`)
      if (`${data}`.indexOf('Daemon is ready')) {
        this.updateOnlineStatus()
        evt.emit(evt.evIpfsDaemonReady)
      }
    })
    this.daemon.stderr.on('data', (data) => {
      log.error(`stderr: ${data}`)
    })

    this.daemon.on('close', (code) => {
      log.info(`child process exited with code ${code}`)
    })
  }
  async setSwarmConnMgr(cfg) {
    return this.runIPFSCmd('config', 'Swarm.ConnMgr', JSON.stringify(cfg), '--json')
  }
  async setPeers(peers) {
    return this.runIPFSCmd('config', 'Peering.Peers', JSON.stringify(peers), '--json')
  }
  async updateGatewayPort(port) {
    return this.runIPFSCmd('config', 'Addresses.Gateway', `/ip4/0.0.0.0/tcp/${port}`)
  }

  async updateAPIPort(port) {
    return this.runIPFSCmd('config', 'Addresses.API', `/ip4/127.0.0.1/tcp/${port}`)
  }
  async updateSwarmPort(port) {
    return this.runIPFSCmd(
      'config',
      'Addresses.Swarm',
      JSON.stringify([
        `/ip4/0.0.0.0/tcp/${port}`,
        `/ip6/::/tcp/${port}`,
        `/ip4/0.0.0.0/udp/${port}/quic`,
        `/ip6/::/udp/${port}/quic`,
      ]),
      '--json'
    )
  }
  async initIPFS() {
    return this.runIPFSCmd('init')
  }
  async addDirectory(dir) {
    return this.runIPFSCmd('add', '-r', dir, '--cid-version=1', '--quieter')
  }
  async publish(key, cid) {
    log.info('publish ipns record ...', { key, cid })
    const rsp = await this.api(
      'name/publish',
      {
        arg: cid,
        'allow-offline': '1',
        key: key,
        quieter: '1',
        lifetime: '7200h',
      },
      { timeout: 600000 }
    )
    log.info('done', rsp)
    return rsp.Name
  }
  async runIPFSCmd(...args) {
    process.env.IPFS_PATH = IPFSDaemon.REPO_PATH
    return new Promise((resolve, reject) => {
      execFile(IPFSDaemon.EXE_PATH, args, (error, stdout, stderr) => {
        if (error) {
          reject(error)
          return
        }
        resolve(stdout.trim())
      })
    })
  }
}
module.exports = new IPFSDaemon()
