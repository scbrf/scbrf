const webdriver = require("selenium-webdriver");
const { By, locateWith } = webdriver;
const robot = require("robotjs");
const driver = new webdriver.Builder()
  .usingServer("http://localhost:9515")
  .withCapabilities({
    build: "MultipleWindowsInSelenium",
    "goog:chromeOptions": {
      binary: "/Applications/scarborough.app/Contents/MacOS/scarborough",
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

  async moveMouseAndClick(delta) {
    const pos = robot.getMousePos();
    robot.moveMouse(pos.x + delta.x, pos.y + delta.y);
    await this.sleep(0.5);
    robot.mouseClick();
  }

  async clickCtxMenu(delta) {
    await this.moveMouseAndClick(delta);
  }

  async winExits(name) {
    const s1 = await driver.getAllWindowHandles();
    for (let s of s1) {
      await driver.switchTo().window(s);
      const url = await driver.getCurrentUrl();
      if (url.endsWith(name)) return true;
    }
    return false;
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
        console.log("winclose meet error, skip", ex);
        await this.sleep(1);
      }
    }
    throw new Error(`wait win ${name} timeout`);
  }

  async followLivid() {
    await this.switchTo("/root");
    const addIcon = await driver.findElement(
      locateWith(By.css(".h-4")).toRightOf(By.css(".bg-green-500"))
    );
    await addIcon.click();
    await this.sleep(0.3);
    await this.clickCtxMenu({ x: 50, y: 45 });
    await this.sleep(0.3);
    await this.switchTo("/planet/follow");
    const textarea = await driver.findElement(By.css("textarea"));
    await textarea.sendKeys("olivida.eth");
    const followBtn = await driver.findElement(
      locateWith(By.css("button")).toRightOf(By.css("button"))
    );
    await followBtn.click();
    await this.winClose("/planet/follow", 300);

    const webview = await this.switchTo("/loading");
    await this.switchTo("/root");
    const livid = await driver.findElement(By.css("span.ml-2"));
    await livid.click();

    await driver.switchTo().window(webview);
    const url = await driver.getCurrentUrl();
    if (url.endsWith("/loading")) {
      throw new Error("webview should load livid's first post");
    }
  }

  async createPlanet() {
    await this.switchTo("/root");
    const addIcon = await driver.findElement(
      locateWith(By.css(".h-4")).toRightOf(By.css(".bg-green-500"))
    );
    await addIcon.click();
    await this.sleep(0.3);
    await this.clickCtxMenu({ x: 50, y: 15 });
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
    await this.switchTo("/topbar");
    await this.sleep(0.3);
    const newArticle = await driver.findElement(By.css(".e2e-new"));
    await newArticle.click();
    await this.sleep(0.3);
    await this.testArticleEditor();
  }

  async testArticleEditor() {
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

  async start() {
    await this.cleanUp();
    await this.waitIpfs();
    // await this.followLivid();
    await this.createPlanet();
    await this.sleep();
  }

  async cleanUp() {
    require("fs").rmSync("/Users/wwq/Library/Application Support/scarborough", {
      force: true,
      recursive: true,
    });
  }
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
    driver.quit();
  });
