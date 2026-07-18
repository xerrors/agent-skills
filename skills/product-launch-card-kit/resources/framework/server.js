#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");

function parseArgs(argv) {
  const args = {_: [], host: "127.0.0.1", port: 8765};
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--host") args.host = argv[++index];
    else if (value === "--port") args.port = Number(argv[++index]);
    else if (value.startsWith("--")) args[value.slice(2)] = true;
    else args._.push(value);
  }
  return args;
}

const args = parseArgs(process.argv);
const projectRoot = path.resolve(args._[0] || ".");
const configPath = path.join(projectRoot, "launch.config.json");

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

function safeJoin(root, requestPath) {
  const target = path.resolve(root, String(requestPath || "").replace(/^\/+/, ""));
  return target === root || target.startsWith(root + path.sep) ? target : null;
}

function readJson(req, limit = 50 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("请求体过大"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch (_) { reject(new Error("JSON 格式无效")); }
    });
    req.on("error", reject);
  });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {"Cache-Control": "no-store", ...headers});
  res.end(body);
}

function json(res, status, value) {
  send(res, status, JSON.stringify(value), {"Content-Type": "application/json; charset=utf-8"});
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".md": "text/plain; charset=utf-8"
};

function extensionForMime(mime, kind) {
  const tables = {
    image: {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif"},
    audio: {"audio/mpeg": ".mp3", "audio/mp3": ".mp3", "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/mp4": ".m4a", "audio/ogg": ".ogg"}
  };
  return tables[kind] && tables[kind][mime.toLowerCase()];
}

function safeName(name, fallback) {
  return String(name || fallback)
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || fallback;
}

function rewriteImageSource(originalSrc, nextSrc) {
  if (!originalSrc) return 0;
  let replacements = 0;
  for (const filename of fs.readdirSync(projectRoot).filter((file) => file.endsWith(".html"))) {
    const target = path.join(projectRoot, filename);
    const source = fs.readFileSync(target, "utf8");
    const updated = source.split(originalSrc).join(nextSrc);
    if (updated !== source) {
      fs.writeFileSync(target, updated, "utf8");
      replacements += 1;
    }
  }
  return replacements;
}

async function handleUpload(req, res, kind) {
  try {
    const body = await readJson(req);
    const match = /^data:([^;]+);base64,(.+)$/i.exec(String(body.dataUrl || ""));
    if (!match) return json(res, 400, {error: "缺少 base64 data URL"});
    const extension = extensionForMime(match[1], kind);
    if (!extension) return json(res, 400, {error: `不支持的 ${kind} 类型：${match[1]}`});

    const directory = kind === "image" ? "images" : "audios";
    const basename = safeName(body.fileName, kind);
    const filename = `${basename}-${Date.now()}${extension}`;
    const assetDirectory = path.join(projectRoot, "assets", directory);
    fs.mkdirSync(assetDirectory, {recursive: true});
    const target = path.join(assetDirectory, filename);
    fs.writeFileSync(target, Buffer.from(match[2], "base64"));
    const src = `assets/${directory}/${filename}`;

    let htmlFilesTouched = 0;
    if (kind === "image") htmlFilesTouched = rewriteImageSource(String(body.originalSrc || ""), src);
    if (kind === "audio") {
      const config = readConfig();
      config.video = config.video || {};
      config.video.audio = src;
      writeConfig(config);
    }

    return json(res, 200, {ok: true, kind, src, file: target, bytes: fs.statSync(target).size, htmlFilesTouched});
  } catch (error) {
    return json(res, 400, {error: error.message || String(error)});
  }
}

function listAssets(kind) {
  const directories = kind ? [kind === "audio" ? "audios" : "images"] : ["images", "audios"];
  const items = [];
  for (const directory of directories) {
    const target = path.join(projectRoot, "assets", directory);
    if (!fs.existsSync(target)) continue;
    for (const name of fs.readdirSync(target).filter((item) => !item.startsWith("."))) {
      const file = path.join(target, name);
      const stat = fs.statSync(file);
      if (stat.isFile()) items.push({kind: directory === "audios" ? "audio" : "image", name, bytes: stat.size, src: `assets/${directory}/${name}`});
    }
  }
  return items;
}

function runFrameworkScript(script, res) {
  const result = spawnSync(process.execPath, [path.join(projectRoot, "framework", script), "--project", projectRoot], {encoding: "utf8"});
  if (result.status !== 0) return json(res, 500, {error: `${script} 执行失败`, details: result.stderr || result.stdout});
  const lines = String(result.stdout || "").trim().split("\n");
  let payload = {ok: true, output: lines.at(-1)};
  try { payload = JSON.parse(lines.at(-1)); } catch (_) {}
  return json(res, 200, payload);
}

function serveStatic(res, requestPath) {
  const config = readConfig();
  const relative = requestPath === "/" ? config.entry : decodeURIComponent(requestPath).replace(/^\/+/, "");
  const file = safeJoin(projectRoot, relative);
  if (!file) return send(res, 403, "Forbidden");
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return send(res, 404, "Not found");
    fs.readFile(file, (readError, data) => {
      if (readError) return send(res, 500, "Read error");
      send(res, 200, data, {"Content-Type": mimeTypes[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": data.length});
    });
  });
}

if (!fs.existsSync(configPath)) {
  console.error(`缺少配置文件：${configPath}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET" && requestUrl.pathname === "/api/health") return json(res, 200, {ok: true, projectRoot, config: readConfig()});
  if (req.method === "GET" && requestUrl.pathname === "/api/config") return json(res, 200, readConfig());
  if (req.method === "GET" && requestUrl.pathname === "/api/assets") return json(res, 200, {assets: listAssets(requestUrl.searchParams.get("kind"))});
  if (req.method === "POST" && requestUrl.pathname === "/api/upload/image") return handleUpload(req, res, "image");
  if (req.method === "POST" && requestUrl.pathname === "/api/upload/audio") return handleUpload(req, res, "audio");
  if (req.method === "POST" && requestUrl.pathname === "/api/export/png") return runFrameworkScript("export-cards.js", res);
  if (req.method === "POST" && requestUrl.pathname === "/api/export/video") return runFrameworkScript("render-video.js", res);
  return serveStatic(res, requestUrl.pathname);
});

server.listen(args.port, args.host, () => {
  const config = readConfig();
  console.log(`发布素材工作台：http://${args.host}:${args.port}/${config.entry}`);
  console.log(`项目目录：${projectRoot}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
