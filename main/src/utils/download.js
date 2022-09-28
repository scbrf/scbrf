const { shell } = require('electron') // deconstructing assignment
const log = require('./log')('download')

module.exports = async (url, local, option = {}) => {
  log.info('need download assets', { url, local })
  if (url.startsWith('file://')) {
    require('fs').cpSync(url.substring('file://'.length), local)
    shell.showItemInFolder(local)
    return
  }
  const rsp = await require('axios').get(url, { responseType: 'stream' })
  const writer = require('fs').createWriteStream(local)
  rsp.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  if (option.open) {
    shell.showItemInFolder(local)
  }
}
