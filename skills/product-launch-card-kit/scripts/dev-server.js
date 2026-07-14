#!/usr/bin/env node
/*
 * Zero-dependency dev server for the product launch card workbench.
 *
 * What it does:
 *   - Serves any directory passed as the first argument (default: cwd).
 *   - Exposes POST /api/upload so the click-to-replace image picker can
 *     persist a replacement image into ./assets/ and rewrite the matching
 *     src="..." attribute in every HTML file under the project root.
 *   - Exposes GET /api/health and GET /api/assets for the picker to probe
 *     persistence support and list known asset files.
 *
 * Usage:
 *   node scripts/dev-server.js [project-dir] [--port 8765] [--host 127.0.0.1]
 *
 * No npm install required. Only Node.js built-ins.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

function parseArgs(argv) {
  const args = { _: [], port: 8765, host: "127.0.0.1" };
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--port") { args.port = Number(argv[++i]); }
    else if (item === "--host") { args.host = String(argv[++i]); }
    else if (item.startsWith("--")) { args[item.slice(2)] = true; }
    else { args._.push(item); }
  }
  return args;
}

const args = parseArgs(process.argv);
const PROJECT_ROOT = path.resolve(args._[0] || ".");
const PORT = args.port;
const HOST = args.host;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

function mimeOf(p) { return MIME[path.extname(p).toLowerCase()] || "application/octet-stream"; }

// Discover the HTML entry to serve when a client hits "/" or asks for export.
// Priority:
//   1. <root>/index.html (preserves the classic dev-server convention)
//   2. The only `*-cards.html` in the root (SKILL.md default delivery name)
//   3. A unique `<root>/*.html` if exactly one remains
//   4. Otherwise the lexicographically first `*.html`
// Returns null when no HTML file is present.
function discoverDefaultEntry(root) {
  const entries = fs.readdirSync(root)
    .filter(function (f) { return !f.startsWith("."); })
    .filter(function (f) { return f.toLowerCase().endsWith(".html"); })
    .sort();
  if (entries.length === 0) return null;

  const basename = (function () {
    if (entries.indexOf("index.html") !== -1) return "index.html";
    const cardsFiles = entries.filter(function (f) { return /-cards\.html$/i.test(f); });
    if (cardsFiles.length === 1) return cardsFiles[0];
    if (cardsFiles.length > 1) {
      // Among multiple `-cards.html` candidates, pick the shortest story-id
      // (closest to `<story-id>-cards.html` from SKILL.md).
      return cardsFiles.slice().sort(function (a, b) { return a.length - b.length; })[0];
    }
    if (entries.length === 1) return entries[0];
    return entries[0];
  })();

  const file = path.join(root, basename);
  const webPath = "/" + basename;
  // Derive story-id from `<story-id>-cards.html`; for index.html or other
  // names fall back to the directory leaf so the export prefix stays stable.
  const storyIdMatch = /^(.*)-cards$/i.exec(path.basename(file, ".html"));
  const storyId = storyIdMatch ? storyIdMatch[1] : path.basename(root);
  return {
    file: file,
    webPath: webPath,
    basename: basename,
    storyId: storyId,
    prefix: storyId + "-release-card",
  };
}

let cachedEntry = null;
try {
  cachedEntry = discoverDefaultEntry(PROJECT_ROOT);
} catch (e) {
  console.warn("[entry] discovery failed: " + (e.message || e));
}

function safeJoin(root, relative) {
  if (!relative) return null;
  const cleaned = relative.replace(/^\/+/, "");
  const resolved = path.resolve(root, cleaned);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

function readJsonBody(req, limit) {
  if (limit === undefined) limit = 25 * 1024 * 1024;
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) { reject(new Error("payload too large")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (!text) return resolve({});
      try { resolve(JSON.parse(text)); }
      catch (e) { reject(new Error("invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({ "Cache-Control": "no-store" }, headers || {}));
  res.end(body);
}

function sendJson(res, code, obj) {
  send(res, code, JSON.stringify(obj), { "Content-Type": "application/json; charset=utf-8" });
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function listHtmlFiles(root) {
  try {
    return fs.readdirSync(root)
      .filter((f) => f.toLowerCase().endsWith(".html"))
      .map((f) => path.join(root, f));
  } catch (_) { return []; }
}

function rewriteHtmlSrc(originalSrc, newSrc) {
  let touched = 0;
  let replacements = 0;
  for (const file of listHtmlFiles(PROJECT_ROOT)) {
    const text = fs.readFileSync(file, "utf8");
    if (!text.includes(originalSrc)) continue;
    const pattern = new RegExp(`(\\ssrc=["'])${escapeRegex(originalSrc)}(["'])`, "g");
    const updated = text.replace(pattern, function (_m, pre, post) { return pre + newSrc + post; });
    if (updated !== text) {
      fs.writeFileSync(file, updated, "utf8");
      touched += 1;
      replacements += (text.match(pattern) || []).length;
    }
  }
  return { touched: touched, replacements: replacements };
}

function buildReplacementName(originalSrc, ext) {
  const base = (originalSrc.split("/").pop() || "image").replace(/\.[^.]+$/, "") || "image";
  const safe = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48) || "image";
  return "replaced-" + Date.now() + "-" + safe + ext;
}

function handleUpload(req, res) {
  return readJsonBody(req).then(function (body) {
    const originalSrc = String(body.originalSrc || "").trim();
    const imageData = String(body.imageData || "").trim();
    if (!originalSrc) return sendJson(res, 400, { error: "originalSrc is required" });
    if (!imageData) return sendJson(res, 400, { error: "imageData is required" });

    const m = /^data:([^;]+);base64,(.+)$/i.exec(imageData);
    if (!m) return sendJson(res, 400, { error: "imageData must be a base64 data URL" });
    const mime = m[1].toLowerCase();
    const ext = ({ "image/png": ".png", "image/jpeg": ".jpg", "image/jpg": ".jpg",
                   "image/gif": ".gif", "image/webp": ".webp" })[mime];
    if (!ext) return sendJson(res, 400, { error: "unsupported mime: " + mime });

    const filename = buildReplacementName(originalSrc, ext);
    const assetsDir = path.join(PROJECT_ROOT, "assets");
    const target = path.join(assetsDir, filename);
    fs.mkdirSync(assetsDir, { recursive: true });
    const buf = Buffer.from(m[2], "base64");
    fs.writeFileSync(target, buf);

    const newSrc = "assets/" + filename;
    const info = rewriteHtmlSrc(originalSrc, newSrc);

    return sendJson(res, 200, {
      ok: true,
      originalSrc: originalSrc,
      src: newSrc,
      file: target,
      bytes: buf.length,
      htmlFilesTouched: info.touched,
      htmlReplacements: info.replacements
    });
  }).catch(function (err) { return sendJson(res, 400, { error: String(err.message || err) }); });
}

function handleAssets(res) {
  const dir = path.join(PROJECT_ROOT, "assets");
  try {
    if (!fs.existsSync(dir)) return sendJson(res, 200, { assets: [] });
    const items = fs.readdirSync(dir)
      .filter(function (f) { return !f.startsWith("."); })
      .map(function (name) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        return { name: name, size: st.size, mtime: st.mtimeMs, src: "assets/" + name };
      })
      .sort(function (a, b) { return b.mtime - a.mtime; });
    return sendJson(res, 200, { assets: items });
  } catch (e) {
    return sendJson(res, 500, { error: String(e.message || e) });
  }
}

function handleStatic(req, res, pathname) {
  if (pathname === "/") {
    if (!cachedEntry) {
      return send(res, 404, "No HTML entry found in project root: " + PROJECT_ROOT);
    }
    res.writeHead(302, {
      Location: cachedEntry.webPath,
      "Cache-Control": "no-store",
    });
    return res.end();
  }
  const file = safeJoin(PROJECT_ROOT, pathname);
  if (!file) return send(res, 403, "Forbidden");
  fs.stat(file, function (err, stat) {
    if (err || !stat.isFile()) return send(res, 404, "Not found");
    fs.readFile(file, function (err2, buf) {
      if (err2) return send(res, 500, "Read error");
      send(res, 200, buf, { "Content-Type": mimeOf(file), "Content-Length": buf.length });
    });
  });
}

const server = http.createServer(function (req, res) {
  const parsed = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsed.pathname);

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (pathname === "/api/export" && req.method === "POST") {
    if (!cachedEntry) {
      return sendJson(res, 400, { error: "No HTML entry found in project root: " + PROJECT_ROOT });
    }
    const { spawnSync } = require("child_process");
    const scriptPath = path.join(__dirname, "export-cards.js");
    let cardCount = 11;
    try {
      const htmlContent = fs.readFileSync(cachedEntry.file, "utf8");
      const matches = htmlContent.match(/<article\s+[^>]*data-layout=/g) || [];
      if (matches.length > 0) cardCount = matches.length;
    } catch (_) {}
    const result = spawnSync("node", [
      scriptPath,
      "--html", cachedEntry.file,
      "--out", path.join(PROJECT_ROOT, "previews"),
      "--prefix", cachedEntry.prefix,
      "--cards", String(cardCount)
    ]);
    if (result.status === 0) {
      return sendJson(res, 200, { ok: true, cardsExported: cardCount });
    } else {
      const errMsg = result.stderr ? result.stderr.toString() : (result.stdout ? result.stdout.toString() : "Unknown error");
      console.error("Export process failed:", errMsg);
      return sendJson(res, 500, { error: "Export failed", details: errMsg });
    }
  }

  if (pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, projectRoot: PROJECT_ROOT, pid: process.pid });
  }
  if (pathname === "/api/assets" && req.method === "GET") {
    return handleAssets(res);
  }
  if (pathname === "/api/upload" && req.method === "POST") {
    return handleUpload(req, res);
  }
  return handleStatic(req, res, pathname);
});

server.listen(PORT, HOST, function () {
  const entryLine = cachedEntry ? "  Entry        : " + cachedEntry.basename : "  Entry        : (none — drop an .html into the project root)";
  const openUrl = cachedEntry
    ? "http://" + HOST + ":" + PORT + cachedEntry.webPath
    : "http://" + HOST + ":" + PORT + "/";
  console.log("");
  console.log("Product launch card dev server");
  console.log("  Project root : " + PROJECT_ROOT);
  console.log(entryLine);
  console.log("  Local URL    : " + openUrl);
  console.log("  Open in browser; click any card image to replace it.");
  console.log("  Replacements are written to ./assets/ and saved into HTML src attrs.");
  console.log("  Press Ctrl-C to stop.");
  console.log("");
});

process.on("SIGINT", function () { console.log("\nshutting down"); server.close(function () { process.exit(0); }); });
