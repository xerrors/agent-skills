const fs = require("fs");
const os = require("os");
const path = require("path");
const {spawn} = require("child_process");
const {pathToFileURL} = require("url");

class CdpPipe {
  constructor(process) {
    this.process = process;
    this.writer = process.stdio[3];
    this.reader = process.stdio[4];
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.buffer = Buffer.alloc(0);

    this.reader.on("data", (chunk) => this.handleData(chunk));
    this.reader.on("error", (error) => this.rejectAll(error));
    process.on("exit", (code) => {
      if (code && this.pending.size) this.rejectAll(new Error(`Chrome 提前退出：${code}`));
    });
  }

  handleData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    let separator = this.buffer.indexOf(0);
    while (separator !== -1) {
      const payload = this.buffer.subarray(0, separator).toString("utf8");
      this.buffer = this.buffer.subarray(separator + 1);
      if (payload) this.handleMessage(JSON.parse(payload));
      separator = this.buffer.indexOf(0);
    }
  }

  handleMessage(message) {
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      else pending.resolve(message.result || {});
      return;
    }
    const handlers = this.listeners.get(message.method) || [];
    for (const handler of handlers) handler(message);
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const message = {id, method, params};
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, {resolve, reject});
      this.writer.write(JSON.stringify(message) + "\0");
    });
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) || [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
    return () => this.listeners.set(method, handlers.filter((item) => item !== handler));
  }

  waitFor(method, sessionId, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error(`等待 Chrome 事件超时：${method}`));
      }, timeoutMs);
      const off = this.on(method, (message) => {
        if (sessionId && message.sessionId !== sessionId) return;
        clearTimeout(timer);
        off();
        resolve(message.params || {});
      });
    });
  }

  rejectAll(error) {
    for (const {reject} of this.pending.values()) reject(error);
    this.pending.clear();
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function captureAnimationFrames({root, config, tempDirectory}) {
  const chrome = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!fs.existsSync(chrome)) throw new Error(`找不到 Chrome：${chrome}`);

  const cards = config.cards || {};
  const video = config.video || {};
  const animation = config.animation || {};
  const width = Number(cards.width || 1080);
  const height = Number(cards.height || 1440);
  const count = Number(cards.count);
  const secondsPerCard = Number(video.secondsPerCard || 4);
  const captureFps = Math.max(8, Math.min(30, Number(animation.captureFps || 20)));
  const animationSeconds = Math.max(0.4, Math.min(secondsPerCard, Number(animation.videoSeconds || 1.5)));
  const entry = path.join(root, config.entry);
  const frameDirectory = path.join(tempDirectory, "frames");
  const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "launch-chrome-"));
  fs.mkdirSync(frameDirectory, {recursive: true});

  const chromeProcess = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--force-device-scale-factor=1",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-pipe",
    `--user-data-dir=${profileDirectory}`,
    "about:blank"
  ], {stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"]});

  let chromeErrors = "";
  chromeProcess.stderr.on("data", (chunk) => { chromeErrors += chunk.toString("utf8"); });
  const cdp = new CdpPipe(chromeProcess);
  const concatLines = [];
  let frameNumber = 0;
  let lastFrame = "";

  try {
    await cdp.send("Browser.getVersion");
    const {targetId} = await cdp.send("Target.createTarget", {url: "about:blank"});
    const {sessionId} = await cdp.send("Target.attachToTarget", {targetId, flatten: true});
    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("Animation.enable", {}, sessionId);
    await cdp.send("Animation.setPlaybackRate", {playbackRate: 0}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: height
    }, sessionId);

    const animationIds = new Set();
    cdp.on("Animation.animationStarted", (message) => {
      if (message.sessionId === sessionId && message.params?.animation?.id) animationIds.add(message.params.animation.id);
    });
    cdp.on("Animation.animationCanceled", (message) => {
      if (message.sessionId === sessionId && message.params?.id) animationIds.delete(message.params.id);
    });

    const stepSeconds = 1 / captureFps;
    const movingFrames = Math.ceil(animationSeconds * captureFps);

    for (let card = 1; card <= count; card += 1) {
      animationIds.clear();
      const loaded = cdp.waitFor("Page.loadEventFired", sessionId, 15000);
      const url = `${pathToFileURL(entry).href}?export=1&video=1&card=${card}`;
      await cdp.send("Page.navigate", {url}, sessionId);
      await loaded;
      await cdp.send("Runtime.evaluate", {
        expression: `Promise.all([document.fonts.ready, ...Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => { image.addEventListener('load', resolve, {once:true}); image.addEventListener('error', resolve, {once:true}); }))])`,
        awaitPromise: true,
        returnByValue: true
      }, sessionId);
      await wait(80);

      for (let frame = 0; frame < movingFrames; frame += 1) {
        const currentTime = frame * stepSeconds * 1000;
        const ids = Array.from(animationIds);
        if (ids.length) await cdp.send("Animation.seekAnimations", {animations: ids, currentTime}, sessionId);
        await cdp.send("Runtime.evaluate", {
          expression: "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
          awaitPromise: true
        }, sessionId);
        const screenshot = await cdp.send("Page.captureScreenshot", {format: "png", fromSurface: true, captureBeyondViewport: false}, sessionId);
        const framePath = path.join(frameDirectory, `frame-${String(++frameNumber).padStart(6, "0")}.png`);
        fs.writeFileSync(framePath, Buffer.from(screenshot.data, "base64"));
        concatLines.push(`file '${framePath.replace(/'/g, "'\\''")}'`);
        concatLines.push(`duration ${stepSeconds.toFixed(6)}`);
        lastFrame = framePath;
      }

      const ids = Array.from(animationIds);
      if (ids.length) await cdp.send("Animation.seekAnimations", {animations: ids, currentTime: animationSeconds * 1000}, sessionId);
      await cdp.send("Runtime.evaluate", {
        expression: "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
        awaitPromise: true
      }, sessionId);
      const finalScreenshot = await cdp.send("Page.captureScreenshot", {format: "png", fromSurface: true, captureBeyondViewport: false}, sessionId);
      const finalPath = path.join(frameDirectory, `frame-${String(++frameNumber).padStart(6, "0")}.png`);
      fs.writeFileSync(finalPath, Buffer.from(finalScreenshot.data, "base64"));
      concatLines.push(`file '${finalPath.replace(/'/g, "'\\''")}'`);
      concatLines.push(`duration ${Math.max(0.001, secondsPerCard - movingFrames * stepSeconds).toFixed(6)}`);
      lastFrame = finalPath;
      console.log(`捕获动画卡片 ${card}/${count}`);
    }

    if (lastFrame) concatLines.push(`file '${lastFrame.replace(/'/g, "'\\''")}'`);
    const concatFile = path.join(tempDirectory, "animation-frames.txt");
    fs.writeFileSync(concatFile, concatLines.join("\n") + "\n", "utf8");
    return {concatFile, frameCount: frameNumber, captureFps, animationSeconds};
  } catch (error) {
    if (chromeErrors.trim()) error.message += `\n${chromeErrors.trim()}`;
    throw error;
  } finally {
    try { await cdp.send("Browser.close"); } catch (_) { chromeProcess.kill("SIGTERM"); }
    fs.rmSync(profileDirectory, {recursive: true, force: true});
  }
}

module.exports = {captureAnimationFrames};
