const { shell } = require('electron') // deconstructing assignment

module.exports = async (url, local, option = {}) => {
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
