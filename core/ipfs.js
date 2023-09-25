const util = require("node:util");
const execFile = util.promisify(require("node:child_process").execFile);
const { spawn } = require("node:child_process");
const log = require("./log")("ipfs");
const { getPortRange } = require("./utils");
const { observable } = require("mobx");
const S = require("./setting");
const URLUtils = require("./Helper/URLUtils");

class IPFS {
  publicGateways = [
    "https://ipfs.io",
    "https://dweb.link",
    "https://cloudflare-ipfs.com",
    "https://gateway.pinata.cloud",
    "https://ipfs.fleek.co",
    "https://cf-ipfs.com",
  ];
  constructor() {
    this.state = observable({
      isBootstrapping: true,
      online: false,
      peers: 0,
    });
  }
  preferredGateway() {
    const index = S.get(S.settingsPublicGatewayIndex, 0);
    return this.publicGateways[index];
  }
  async init() {
    await this.IPFSRepoInit();
    await this.launchDaemon();
    await this.onlineStatusCheck();
  }
  async shutdown() {
    await this.shutdownDaemon();
  }
  async IPFSCommand() {
    const { stdout, stderr, error } = await execFile(
      this.IPFSExecutablePath,
      [...arguments],
      {
        env: {
          IPFS_PATH: this.IPFSRepositoryPath,
        },
      }
    );
    log.info({ arguments, stdout, stderr, error }, "ipfs command");
    return { stdout, stderr, error };
  }
  async generateKey(name) {
    log.info({ name }, "Generating IPFS keypair");
    try {
      const { error, stdout, stderr } = await this.IPFSCommand(
        "key",
        "gen",
        name
      );
      if (!error) {
        const ipns = `${stdout}`.trim();
        log.info({ ipns }, "Generated IPFS keypair");
        return ipns;
      } else {
        log.error({ error, stdout, stderr }, "Failed to generate IPFS keypair");
      }
    } catch (ex) {
      log.info(
        ex,
        "Failed to generate IPFS keypair: error when running IPFS process"
      );
    }
  }
  async onlineStatusCheck() {
    this.onlineCheckTimer = setInterval(async () => {
      await this.updateOnlineStatus();
      if (!this.state.online && !this.state.isBootstrapping) {
        await this.launchDaemon();
      }
    }, 30000);
  }
  async launchDaemon() {
    log.info("Launching daemon");
    try {
      await this.shutdownDaemon();
    } catch (ex) {}
    const daemon = spawn(
      this.IPFSExecutablePath,
      [
        "daemon",
        "--migrate",
        "--enable-namesys-pubsub",
        "--enable-pubsub-experiment",
      ],
      {
        env: {
          IPFS_PATH: this.IPFSRepositoryPath,
        },
      }
    );
    daemon.stdout.on("data", async (data) => {
      log.info({ stdout: `${data}` }, "ipfs daemon output");
      const lines = `${data}`;
      if (lines.indexOf("Daemon is ready") >= 0) {
        await this.updateOnlineStatus();
      }
    });
  }
  async getFileCIDv0(path) {
    log.info({ path }, "Checking file CIDv0");
    const { stdout } = await this.IPFSCommand(
      "add",
      path,
      "--quieter",
      "--cid-version=0",
      "--pin"
    );
    const cid = `${stdout}`.trim();
    log.info({ cid, path }, "File CIDv0");
  }
  async pin(cid) {
    log.info({ cid }, "Pinning");
    await this.api("pin/add", { arg: cid }, { timeout: 120 });
  }
  async resolveIPNSorDNSLink(name) {
    log.info({ name }, "Resolving IPNS or DNSLink");
    const resolved = await this.api("name/resolve", { arg: name });
    const cidWithPrefix = resolved.path;
    if (cidWithPrefix.startsWith("/ipfs/")) {
      return cidWithPrefix.substring("/ipfs/".length);
    } else {
      log.error(
        { name, resolved },
        "Failed to resolve IPNS or DNSLink: unknown result from API call"
      );
    }
  }
  async updateOnlineStatus() {
    log.info("Updating online status");
    let online = false,
      peers = 0;
    const url = `http://127.0.0.1:${this.APIPort}/webui`;
    const rsp = await fetch(url, {
      headers: {
        pragma: "no-cache",
        "cache-control": "no-cache",
      },
    });
    if (rsp.status == 200) {
      online = true;
    }
    if (online) {
      const swarmPeers = await this.api("swarm/peers");
      peers = swarmPeers.Peers.length;
    }
    log.info({ online, peers }, "Daemon state");
    if (online) {
      this.state.isBootstrapping = false;
    }
    this.state.online = online;
    this.state.peers = peers;
  }
  async api(path, body, options = {}) {
    const url = `http://127.0.0.1:${this.APIPort}/api/v0/${path}`;
    const fetchOption = {
      method: "POST",
      headers: {
        cache: "no-cache",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : "",
    };
    if (options.timeout) {
      fetchOption.signal = AbortSignal.timeout(options.timeout * 1000);
    }
    const rsp = await fetch(url, fetchOption);
    const json = await rsp.json();
    log.info({ path, body, json }, "IPFS API Request");
    return json;
  }
  async shutdownDaemon() {
    await this.IPFSCommand("shutdown");
  }
  async IPFSRepoInit() {
    const ext = "bin";
    const version = "0.15";
    const arch = "amd64";
    this.IPFSExecutablePath = require("path").join(
      __dirname,
      "go-ipfs-executables",
      `ipfs-${arch}-${version}.${ext}`
    );
    if (!require("fs").existsSync(this.IPFSExecutablePath)) {
      throw new Error("ipfs executable error");
    }
    const defaultRoot = require("path").join(URLUtils.documentsPath, "ipfs");
    this.IPFSRepositoryPath = require("./setting").get("ipfsroot", defaultRoot);
    if (!require("fs").existsSync(defaultRoot)) {
      log.info(
        { ipfsroot: this.IPFSRepositoryPath },
        "Initializing IPFS config"
      );
      require("fs").mkdirSync(this.IPFSRepositoryPath, { recursive: true });
      await this.IPFSInit();
    }

    this.swarmPort = await getPortRange(4001, 4011);
    log.info({ port: this.swarmPort }, "Scouting open ports");
    await this.updateSwarmPort(this.swarmPort);

    this.APIPort = await getPortRange(5981, 5991);
    await this.updateAPIPort(this.APIPort);

    this.gatewayPort = await getPortRange(18181, 18191);
    await this.updateGatewayPort(this.gatewayPort);

    const peers = [
      {
        ID: "12D3KooWBJY6ZVV8Tk8UDDFMEqWoxn89Xc8wnpm8uBFSR3ijDkui",
        Addrs: [
          "/ip4/167.71.172.216/tcp/4001",
          "/ip6/2604:a880:800:10::826:1/tcp/4001",
        ],
      },
      {
        ID: "QmcFf2FH3CEgTNHeMRGhN7HNHU1EXAxoEk6EFuSyXCsvRE",
        Addrs: ["/dnsaddr/node-1.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcFmLd5ySfk2WZuJ1mfSWLDjdmHZq7rSAua4GoeSQfs1z",
        Addrs: ["/dnsaddr/node-2.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfFmzSDVbwexQ9Au2pt5YEXHK5xajwgaU6PpkbLWerMa",
        Addrs: ["/dnsaddr/node-3.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfJeB3Js1FG7T8YaZATEiaHqNKVdQfybYYkbT1knUswx",
        Addrs: ["/dnsaddr/node-4.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfVvzK4tMdFmpJjEKDUoqRgP4W9FnmJoziYX5GXJJ8eZ",
        Addrs: ["/dnsaddr/node-5.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfZD3VKrUxyP9BbyUnZDpbqDnT7cQ4WjPP8TRLXaoE7G",
        Addrs: ["/dnsaddr/node-6.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfZP2LuW4jxviTeG8fi28qjnZScACb8PEgHAc17ZEri3",
        Addrs: ["/dnsaddr/node-7.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP",
        Addrs: ["/dnsaddr/node-8.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "Qmcfr2FC7pFzJbTSDfYaSy1J8Uuy8ccGLeLyqJCKJvTHMi",
        Addrs: ["/dnsaddr/node-9.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfR3V5YAtHBzxVACWCzXTt26SyEkxdwhGJ6875A8BuWx",
        Addrs: ["/dnsaddr/node-10.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "Qmcfuo1TM9uUiJp6dTbm915Rf1aTqm3a3dnmCdDQLHgvL5",
        Addrs: ["/dnsaddr/node-11.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmcfV2sg9zaq7UUHVCGuSvT2M2rnLBAPsiE79vVyK3Cuev",
        Addrs: ["/dnsaddr/node-12.ingress.cloudflare-ipfs.com"],
      },
      {
        ID: "QmUEMvxS2e7iDrereVYc5SWPauXPyNwxcy9BXZrC1QTcHE",
        Addrs: ["/dns/cluster0.fsn.dwebops.pub"],
      },
      {
        ID: "QmNSYxZAiJHeLdkBg38roksAR9So7Y5eojks1yjEcUtZ7i",
        Addrs: ["/dns/cluster1.fsn.dwebops.pub"],
      },
      {
        ID: "QmUd6zHcbkbcs7SMxwLs48qZVX3vpcM8errYS7xEczwRMA",
        Addrs: ["/dns/cluster2.fsn.dwebops.pub"],
      },
      {
        ID: "QmbVWZQhCGrS7DhgLqWbgvdmKN7JueKCREVanfnVpgyq8x",
        Addrs: ["/dns/cluster3.fsn.dwebops.pub"],
      },
      {
        ID: "QmdnXwLrC8p1ueiq2Qya8joNvk3TVVDAut7PrikmZwubtR",
        Addrs: ["/dns/cluster4.fsn.dwebops.pub"],
      },
      {
        ID: "12D3KooWCRscMgHgEo3ojm8ovzheydpvTEqsDtq7Vby38cMHrYjt",
        Addrs: ["/dns4/nft-storage-am6.nft.dwebops.net/tcp/18402"],
      },
      {
        ID: "12D3KooWQtpvNvUYFzAo1cRYkydgk15JrMSHp6B6oujqgYSnvsVm",
        Addrs: ["/dns4/nft-storage-dc13.nft.dwebops.net/tcp/18402"],
      },
      {
        ID: "12D3KooWQcgCwNCTYkyLXXQSZuL5ry1TzpM8PRe9dKddfsk1BxXZ",
        Addrs: ["/dns4/nft-storage-sv15.nft.dwebops.net/tcp/18402"],
      },
    ];
    log.info('"Setting peers"');
    await this.setPeers(peers);

    const swarmConnMgr = {
      GracePeriod: "20s",
      HighWater: 240,
      LowWater: 120,
      Type: "basic",
    };
    await this.setSwarmConnMgr(swarmConnMgr);

    const accessControlAllowOrigin = ["https://webui.ipfs.io"];
    await this.setAccessControlAllowOrigin(accessControlAllowOrigin);

    const accessControlAllowMethods = ["PUT", "POST"];
    await this.setAccessControlAllowMethods(accessControlAllowMethods);
  }
  async IPFSInit() {
    await this.IPFSCommand("init");
  }
  async updateSwarmPort(port) {
    await this.IPFSCommand(
      "config",
      "Addresses.Swarm",
      `["/ip4/0.0.0.0/tcp/${port}", "/ip6/::/tcp/${port}", "/ip4/0.0.0.0/udp/${port}/quic", "/ip6/::/udp/${port}/quic"]`,
      "--json"
    );
  }
  async updateAPIPort(port) {
    await this.IPFSCommand(
      "config",
      "Addresses.API",
      `/ip4/127.0.0.1/tcp/${port}`
    );
  }
  async updateGatewayPort(port) {
    await this.IPFSCommand(
      "config",
      "Addresses.Gateway",
      `/ip4/127.0.0.1/tcp/${port}`
    );
  }
  async setPeers(peers) {
    await this.IPFSCommand(
      "config",
      "Peering.Peers",
      JSON.stringify(peers),
      "--json"
    );
  }
  async setSwarmConnMgr(connMgr) {
    await this.IPFSCommand(
      "config",
      "Swarm.ConnMgr",
      JSON.stringify(connMgr),
      "--json"
    );
  }

  async setAccessControlAllowOrigin(json) {
    await this.IPFSCommand(
      "config",
      "API.HTTPHeaders.Access-Control-Allow-Origin",
      JSON.stringify(json),
      "--json"
    );
  }

  async setAccessControlAllowMethods(json) {
    await this.IPFSCommand(
      "config",
      "API.HTTPHeaders.Access-Control-Allow-Methods",
      JSON.stringify(json),
      "--json"
    );
  }
  async addDirectory(path) {
    log.info({ path }, "Adding directory to IPFS");
    const { stdout } = await this.IPFSCommand(
      "add",
      "-r",
      path,
      "--cid-version=1",
      "--quieter"
    );
    const cid = `${stdout}`.trim();
    return cid;
  }
}

module.exports = new IPFS();
