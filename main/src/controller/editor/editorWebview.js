const { BrowserView, ipcMain } = require('electron')
const marked = require('marked')
const log = require('../../utils/log')('editorwebview')
const rt = require('../../models/runtime')
const evt = require('../../utils/events')

class EditorTopbar {
  constructor() {
    evt.bindIpcMainTable(this, [[evt.ipcDraftSave, this.tryUpdateWebView]])
  }

  tryUpdateWebView(_, p) {
    if (p === this._draft) {
      return
    }
    this._draft = p
    this.updateWebview()
  }

  createView() {
    this.view = new BrowserView({
      webPreferences: {
        preload: require('path').join(__dirname, '..', '..', '..', 'preload.js'),
      },
    })
  }
  async runJS(func) {
    const code =
      '(' +
      func +
      `)(${[...arguments]
        .slice(1)
        .map((s) => JSON.stringify(s))
        .join(',')})`
    return await this.view.webContents.executeJavaScript(code)
  }

  // 一个小小的串行队列
  async updateWebview() {
    if (this.busy) {
      return
    }

    this.busy = true
    const MAX_CONTINIE_LOOP = 5
    for (let i = 0; i < MAX_CONTINIE_LOOP; i++) {
      let currentCnt = this._draft
      try {
        const result = await this.updateWebviewReal(currentCnt)
        if (result) {
          log.info('update succ !', result)
        } else {
          log.info('update fail !', result)
        }
        if (currentCnt == this._draft) {
          break
        } // 连续5次更新都没有追上，键盘敲的太快了也，那就算了，等下次敲键盘吧
      } catch (ex) {
        log.error('error update webview', ex.toString())
      }
    }
    this.busy = false
  }

  async updateWebviewReal(p) {
    const draft = JSON.parse(p)
    const html = marked.parse(draft.content)
    return await this.runJS((html) => {
      const div = document.createElement('div')
      div.innerHTML = html
      let idx = 0
      let nouseNodes = []
      let newNodes = []
      let firstDiffNodeIdx = null
      const now = new Date().getTime()
      for (let i = 0; i < div.childNodes.length; i++) {
        // 如果当前节点一样，直接跳过去处理下一个节点
        if (document.body.childNodes[idx] && document.body.childNodes[idx].outerHTML === div.childNodes[i].outerHTML) {
          idx++
          continue
        }
        if (firstDiffNodeIdx == null) {
          firstDiffNodeIdx = idx
        }

        // 如果不一样，去寻找下一个一样的节点
        const oldIdx = idx
        for (let target = idx + 1; target < document.body.childNodes.length; target++) {
          if (document.body.childNodes[target].outerHTML === div.childNodes[i].outerHTML) {
            // 如果找到了，就把前面的节点都删掉
            for (let nouse = idx; nouse < target; nouse++) {
              nouseNodes.push(document.body.childNodes[nouse])
            }
            idx = target + 1 // target will replace of div node i, so keep it
            break
          }
        }
        if (idx != oldIdx) {
          // 如果找到了新的位置
          continue
        }
        // 如果没找到，就将在当前位置插入一个新节点
        newNodes.push({ pos: idx, node: div.childNodes[i] })
      }
      // 最后再删除没用的节点
      for (let i = idx; i < document.body.childNodes.length; i++) {
        nouseNodes.push(document.body.childNodes[i])
      }
      // 按顺序执行修改操作
      for (let i = newNodes.length - 1; i >= 0; i--) {
        document.body.insertBefore(newNodes[i].node, document.body.childNodes[newNodes[i].pos])
      }
      for (let i = 0; i < nouseNodes.length; i++) {
        document.body.removeChild(nouseNodes[i])
      }
      if (firstDiffNodeIdx && firstDiffNodeIdx < document.body.childNodes.length) {
        document.body.childNodes[firstDiffNodeIdx].scrollIntoViewIfNeeded()
      }
      return true
    }, html)
  }

  init() {
    this.view.setBounds({ x: 600, y: 48, width: 600, height: 552 })
    this.view.setAutoResize({ width: true, height: true, horizontal: true })
    this.view.webContents.loadFile(rt.draft.previewPath)
  }
}

module.exports = new EditorTopbar()
