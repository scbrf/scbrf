const webdriver = require("selenium-webdriver");
const { By, locateWith, Key } = webdriver;
const robot = require("robotjs");
const driver = new webdriver.Builder()
  .usingServer("http://localhost:9515")
  .withCapabilities({
    build: "MultipleWindowsInSelenium",
    "goog:chromeOptions": {
      binary: require("path").join(
        __dirname,
        "..",
        "main",
        "out",
        "scarborough-darwin-x64",
        "scarborough.app",
        "Contents",
        "MacOS",
        "scarborough"
      ),
    },
  })
  .forBrowser("chrome")
  .build();

class Test {
  async switchTo(name, prefix = false) {
    const s1 = await driver.getAllWindowHandles();
    for (let s of s1) {
      await driver.switchTo().window(s);
      const url = await driver.getCurrentUrl();
      if (prefix) {
        if (url.startsWith(name)) return s;
      } else {
        if (url.endsWith(name)) return s;
      }
    }
    throw new Error("window not found: " + name);
  }

  async sleep(s) {
    return new Promise((resolve) => setTimeout(resolve, s * 1000));
  }

  async testEl(by) {
    try {
      await driver.findElement(by);
    } catch (ex) {
      return false;
    }
    return true;
  }

  async waitIpfs() {
    await this.switchTo("/root");
    for (let i = 0; i < 30; i++) {
      if (await this.testEl(By.css(".bg-green-500"))) {
        return;
      }
      await this.sleep(1);
    }
    throw new Error("ipfs timeout in 30 secs");
  }

  async listWindow() {
    const s1 = await driver.getAllWindowHandles();
    for (let s of s1) {
      await driver.switchTo().window(s);
      const url = await driver.getCurrentUrl();
      console.log(s, url);
    }
  }

  async clickCtxMenu(idx) {
    for (let i = 0; i < idx; i++) {
      robot.keyTap("down");
    }
    robot.keyTap("enter");
  }

  async winExits(name) {
    const s1 = await driver.getAllWindowHandles();
    for (let s of s1) {
      await driver.switchTo().window(s);
      const url = await driver.getCurrentUrl();
      if (url.endsWith(name)) {
        return true;
      }
    }
    return false;
  }

  async e2eClose(name, timeout) {
    for (let i = 0; i < timeout; i++) {
      try {
        let found = false;
        const s1 = await driver.getAllWindowHandles();
        for (let s of s1) {
          await driver.switchTo().window(s);
          const url = await driver.getCurrentUrl();
          if (url.endsWith(name)) {
            found = true;
            const closed = await driver.executeScript(
              "return window.e2e_show === false"
            );
            if (closed) return true;
            else break;
          }
        }
        if (!found) {
          throw new Error("target not found:" + name);
        }
        await this.sleep(1);
      } catch (ex) {
        console.log("winclose meet error, skip", ex);
        await this.sleep(1);
      }
    }
    throw new Error(`wait win ${name} timeout`);
  }

  async winClose(name, timeout) {
    for (let i = 0; i < timeout; i++) {
      try {
        const exist = await this.winExits(name);
        if (exist) {
          await this.sleep(1);
        } else {
          return;
        }
      } catch (ex) {
        await this.sleep(1);
      }
    }
    throw new Error(`wait win ${name} timeout`);
  }

  async followBasic() {
    const webview = await this.switchTo("/empty");
    await this.switchTo("/root");
    const addIcon = await driver.findElement(
      locateWith(By.css(".h-4")).toRightOf(By.css(".bg-green-500"))
    );
    await addIcon.click();
    await this.sleep(0.3);
    await this.clickCtxMenu(2);
    await this.sleep(0.3);
    await this.switchTo("/planet/follow");
    const textarea = await driver.findElement(By.css("textarea"));
    await textarea.sendKeys("olivida.eth");
    const followBtn = await driver.findElement(
      locateWith(By.css("button")).toRightOf(By.css("button"))
    );
    await followBtn.click();
    await this.winClose("/planet/follow", 300);

    await this.switchTo("/root");
    const livid = await driver.findElement(By.css("span.ml-2"));
    await livid.click();

    await driver.switchTo().window(webview);
    const url = await driver.getCurrentUrl();
    if (url.endsWith("/empty")) {
      throw new Error("webview should load livid's first post");
    }
  }

  async markStarred() {
    await this.switchTo("/root");
    await this.expectElemNotExists(By.css("e2e-starred"));

    await this.switchTo("/articles");
    const post_2 = await driver.findElement(By.css(".e2e-post-1"));
    await driver.actions().contextClick(post_2).perform();
    await this.clickCtxMenu(2);

    await this.switchTo("/root");
    let starred = await driver.findElement(By.css(".e2e-starred"));
    const value = parseInt(await starred.getText());
    if (value !== 1) {
      throw new Error(`should be  remark as starred  ${value}`);
    }

    //reverse
    await this.switchTo("/articles");
    const post2 = await driver.findElement(By.css(".e2e-post-1"));
    await driver.actions().contextClick(post2).perform();
    await this.clickCtxMenu(2);

    await this.switchTo("/root");
    await this.expectElemNotExists(By.css("e2e-starred"));
  }

  async markRead() {
    await this.switchTo("/root");
    let unread = await driver.findElement(By.css(".e2e-unread"));
    let value1 = parseInt(await unread.getText());

    await this.switchTo("/articles");
    const post2 = await driver.findElement(By.css(".e2e-post-1"));
    await post2.click();

    await this.switchTo("/root");
    unread = await driver.findElement(By.css(".e2e-unread"));
    const value2 = parseInt(await unread.getText());
    if (value2 !== value1 - 1) {
      throw new Error(`should be auto mark readed ${value2} vs ${value1}`);
    }

    await this.switchTo("/articles");
    const post_2 = await driver.findElement(By.css(".e2e-post-1"));
    await driver.actions().contextClick(post_2).perform();
    await this.clickCtxMenu(1);

    await this.switchTo("/root");
    unread = await driver.findElement(By.css(".e2e-unread"));
    const value3 = parseInt(await unread.getText());
    if (value3 !== value1) {
      throw new Error(`should be  remark as unread  ${value3} vs ${value1}`);
    }

    await this.switchTo("/root");
    const planet = await driver.findElement(By.css(".e2e-fp-0"));
    await driver.actions().contextClick(planet).perform();
    await this.clickCtxMenu(3);
    unread = await driver.executeScript(
      "return document.querySelector('.e2e-unread')"
    );
    if (unread) {
      throw new Error("should be dispared when all readed");
    }

    await this.switchTo("/articles");
    await this.sleep(0.3);
    const greenPoint = await this.elemExists(By.css(".bg-green-500"));
    if (greenPoint) {
      throw new Error("articles should be all mark readed!");
    }
  }

  async elemExists(el) {
    try {
      return await driver.findElement(el);
    } catch (ex) {
      return false;
    }
  }

  async expectElemNotExists(el) {
    const ret = await this.elemExists(el);
    if (ret) {
      throw new Error("expect el not exists fail!");
    }
  }

  async unfollow() {
    await this.switchTo("/root");
    let planet = await driver.findElement(By.css(".e2e-fp-0"));
    await driver.actions().contextClick(planet).perform();
    await this.clickCtxMenu(4);
    await this.acceptAlert();
    await this.expectElemNotExists(By.css(".e2e-fp-0"));
    await this.expectElemNotExists(By.css(".e2e-post-0"));
  }

  async followLivid() {
    await this.followBasic();
    await this.markRead();
    await this.markStarred();
    await this.unfollow();
  }

  async createPlanet() {
    await this.switchTo("/root");
    const addIcon = await driver.findElement(
      locateWith(By.css(".h-4")).toRightOf(By.css(".bg-green-500"))
    );
    await addIcon.click();
    await this.sleep(0.3);
    await this.clickCtxMenu(1);
    await this.sleep(0.3);
    await this.switchTo("/planet/create");
    const title = await driver.findElement(By.css("input"));
    await title.sendKeys("hello Scarborough");
    const cnt = await driver.findElement(By.css("textarea"));
    await cnt.sendKeys("Clone of livid's Planet");
    const createBtn = await driver.findElement(
      locateWith(By.css("button")).toRightOf(By.css("button"))
    );
    await createBtn.click();
    await this.switchTo("/root");
    await this.sleep(0.3);
    const newPlanet = await driver.findElement(By.css("span.ml-2"));
    await newPlanet.click();
  }

  async testEditorBasic() {
    await this.switchTo("/topbar");
    await this.sleep(0.3);
    const newArticle = await driver.findElement(By.css(".e2e-new"));
    await newArticle.click();
    await this.sleep(0.3);
    const editorWebview = await this.switchTo("file://", true);
    await this.switchTo("/editor/main");
    const title = await driver.findElement(By.css("input"));
    await title.sendKeys("hello from scarborough");
    const cnt = await driver.findElement(By.css("textarea"));
    await cnt.sendKeys("P1 \n\n**P2**");
    await driver.switchTo().window(editorWebview);
    await this.sleep(0.3);
    const strong = await driver.executeScript(
      'return document.body.querySelector("strong")'
    );
    if (!strong) throw new Error("markdown error!");
  }

  async testEditorPhotoAttach() {
    await this.switchTo("/editor/topbar");
    await driver.findElement(By.css(".e2e-photo")); //just make sure the btn is there
    const photo = require("path").join(__dirname, "attachments", "image.png");
    await driver.executeScript(`api.send('ipcDraftAddPhoto', ['${photo}'])`);

    await this.switchTo("/editor/main");
    const image = await driver.findElement(By.css("img"));
    await image.click();
    const webimg = await driver.executeScript(
      'return document.body.querySelector("img")'
    );
    if (!webimg) throw new Error("attach photo seems fail!");
    await this.switchTo("file://", true);
    await this.sleep(0.3);
    const img = await driver.executeScript(
      'return document.body.querySelector("img")'
    );
    if (!img) throw new Error("image render error!");
  }

  async testEditorAudioAttach() {
    await this.switchTo("/editor/topbar");
    await driver.findElement(By.css(".e2e-audio")); //just make sure the btn is there
    const audio = require("path").join(__dirname, "attachments", "audio.mp3");
    await driver.executeScript(`api.send('ipcDraftAddAudio', ['${audio}'])`);

    await this.switchTo("/editor/main");
    await driver.findElement(By.css("audio"));
  }

  async testEditorVideoAttach() {
    await this.switchTo("/editor/topbar");
    await driver.findElement(By.css(".e2e-video")); //just make sure the btn is there
    const video = require("path").join(__dirname, "attachments", "video.mp4");
    await driver.executeScript(`api.send('ipcDraftAddVideo', ['${video}'])`);

    await this.switchTo("/editor/main");
    await driver.findElement(By.css("video"));
  }

  async testPublish() {
    await this.switchTo("/editor/topbar");
    const pubbtn = await driver.findElement(By.css(".e2e-publish"));
    await pubbtn.click();

    await this.e2eClose("/editor/topbar", 10);

    await this.switchTo("/root");
    await this.sleep(0.3);
    await driver.findElement(By.css(".animate-spin"));
    await this.switchTo("index.html");
    await this.sleep(0.3);
    await driver.findElement(By.css("video"));
  }

  async testPlanetDraftKeep() {
    await this.switchTo("/topbar");
    await this.sleep(0.3);
    const newArticle = await driver.findElement(By.css(".e2e-new"));
    await newArticle.click();
    await this.sleep(0.3);
    await this.switchTo("/editor/main");
    const title = await driver.findElement(By.css("input"));
    const oldTitle = `new title ` + new Date() + " " + Math.random();
    const oldContent = `new cnt ` + new Date() + " " + Math.random();
    await title.sendKeys(oldTitle);
    const cnt = await driver.findElement(By.css("textarea"));
    await cnt.sendKeys(oldContent);
    await this.sleep(0.3);
    await driver.executeScript('api.send("ipcCloseWin")');
    await this.e2eClose("/editor/topbar", 10);
    await this.switchTo("/topbar");
    await this.sleep(0.3);
    const newArticle2 = await driver.findElement(By.css(".e2e-new"));
    await newArticle2.click();
    await this.sleep(0.3);
    await this.switchTo("/editor/main");
    await this.sleep(0.3);
    const tv = await driver.executeScript(
      'return document.querySelector("input").value'
    );
    const cv = await driver.executeScript(
      'return document.querySelector("textarea").value'
    );
    if (tv !== oldTitle) {
      console.log(`compare "${tv}","${oldTitle}"`);
      throw new Error("title should load from draft");
    }
    if (cv !== oldContent) {
      console.log(cv, oldContent);
      throw new Error("content should load from draft");
    }
    await driver.executeScript('api.send("ipcCloseWin")');
    await this.e2eClose("/editor/topbar", 10);
  }

  async testEditArticle() {
    await this.switchTo("/articles");
    await this.sleep(0.3);
    const firstpost = await driver.findElement(By.css(".e2e-post-0"));
    await driver.actions().contextClick(firstpost).perform();
    await this.clickCtxMenu(1);
    await this.sleep(0.3);
    await this.switchTo("/editor/main");
    await this.sleep(0.3);
    const tv = await driver.executeScript(
      'return document.querySelector("input").value'
    );
    const cv = await driver.executeScript(
      'return document.querySelector("textarea").value'
    );
    if (tv !== "hello from scarborough") {
      console.log(`compare "${tv}","hello from scarborough"`);
      throw new Error("title should load from post");
    }
    if (!cv.startsWith("P1 \n\n**P2**")) {
      console.log("cv now is", cv);
      throw new Error("content should load from post");
    }
    await driver.executeScript('api.send("ipcCloseWin")');
    await this.e2eClose("/editor/topbar", 10);
  }

  async acceptAlert() {
    robot.keyTap("enter");
  }

  async testDeleteArticle() {
    await this.switchTo("/articles");
    await this.sleep(0.3);
    const firstpost = await driver.findElement(By.css(".e2e-post-0"));
    await driver.actions().contextClick(firstpost).perform();
    await this.clickCtxMenu(2);
    await this.sleep(0.3);
    await this.acceptAlert();
    await this.sleep(1);
    const testpost = await driver.executeScript(
      'return document.querySelector(".e2e-post-0")'
    );
    if (testpost) {
      throw new Error("post should has been deleted!");
    }
  }

  async testArticleEditor() {
    await this.testEditorBasic();
    await this.testEditorPhotoAttach();
    await this.testEditorAudioAttach();
    await this.testEditorVideoAttach();
    await this.testPublish();
    await this.testPlanetDraftKeep();
    await this.testEditArticle();
    await this.testDeleteArticle();
  }

  async testSetAvatar() {
    await this.switchTo("/topbar");
    await this.sleep(0.3);
    const newArticle = await driver.findElement(By.css(".e2e-info"));
    await newArticle.click();
    await this.sleep(0.3);
    await this.switchTo("/planet/info");
    await this.sleep(0.3);
    const avatar = require("path").join(__dirname, "attachments", "avatar.jpg");
    await driver.executeScript(`api.send("ipcSetAvatar", ["${avatar}"])`);
    await this.sleep(0.5);
    await driver.findElement(By.css("img")); //just make sure it is there
    const ok = await driver.findElement(By.css("button"));
    await ok.click();
    await this.winClose("/planet/info", 5);
    await this.switchTo("/root");
    await this.sleep(0.3);
    await driver.findElement(By.css("img")); //just make sure it is there
  }

  async editPlanet() {
    await this.switchTo("/root");
    await this.sleep(0.3);
    const planet = await driver.findElement(By.css(".e2e-mp-0"));
    await driver.actions().contextClick(planet).perform();
    await this.clickCtxMenu(3);

    await this.switchTo("/planet/create");
    const titleDom = await driver.findElement(By.css(".text-center"));
    const title = await titleDom.getText();
    if (!title.startsWith("Edit")) {
      throw new Error("dialog should be in edit mode");
    }
    const input = await driver.findElement(By.css("input"));
    await input.sendKeys("new Title");
    const cnt = await driver.findElement(By.css("textarea"));
    await cnt.sendKeys("new cnt");
    const btn = await driver.findElement(
      locateWith(By.css("button")).toRightOf(By.css("button"))
    );
    await btn.click();
    await this.winClose("/planet/create", 10);

    await this.switchTo("/root");
    await this.sleep(0.3);
    const planet0 = await driver.findElement(By.css(".e2e-mp-0"));
    const text = await planet0.getText();
    if (!text.indexOf("new Title")) {
      throw new Error("should has new title!");
    }
  }

  async deletePlanet() {
    await this.switchTo("/root");
    await this.sleep(0.3);
    const planet = await driver.findElement(By.css(".e2e-mp-0"));
    await driver.actions().contextClick(planet).perform();
    await this.clickCtxMenu(4);
    await this.sleep(0.5);
    await this.acceptAlert();
    await this.expectElemNotExists(By.css(".e2e-mp-0"));
  }

  async start() {
    await this.waitIpfs();
    await this.createPlanet();
    await this.editPlanet();
    await this.testArticleEditor();
    await this.testSetAvatar();
    await this.deletePlanet();
    await this.followLivid();
  }
}

async function safeQuit() {
  await driver.executeScript('api.send("ipcAppQuit")');
}

new Test()
  .start()
  .then(async () => {
    console.log("run e2e succ");
  })
  .catch((r) => {
    console.log("run e2e fail", r);
  })
  .then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await safeQuit();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    driver.quit();
  });
