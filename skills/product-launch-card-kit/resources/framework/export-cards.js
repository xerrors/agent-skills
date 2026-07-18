#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");
const {pathToFileURL} = require("url");

function projectArg() {
  const index = process.argv.indexOf("--project");
  return path.resolve(index === -1 ? "." : process.argv[index + 1]);
}

const root = projectArg();
const config = JSON.parse(fs.readFileSync(path.join(root, "launch.config.json"), "utf8"));
const html = path.join(root, config.entry);
const outputDirectory = path.join(root, config.cards.outputDirectory || "previews");
const width = Number(config.cards.width || 1080);
const height = Number(config.cards.height || 1440);
const count = Number(config.cards.count);
const prefix = config.cards.prefix || `${config.storyId}-card`;
const chrome = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outputs = [];

function timestamp(date = new Date()) {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "-",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ];
  return parts.join("");
}

if (!fs.existsSync(chrome)) throw new Error(`找不到 Chrome：${chrome}`);
fs.mkdirSync(outputDirectory, {recursive: true});

for (let card = 1; card <= count; card += 1) {
  const padded = String(card).padStart(2, "0");
  const output = path.join(outputDirectory, `${prefix}-${padded}.png`);
  const url = `${pathToFileURL(html).href}?export=1&card=${card}`;
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--run-all-compositor-stages-before-draw",
    `--window-size=${width},${height}`,
    `--screenshot=${output}`,
    url
  ], {encoding: "utf8"});
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "");
    process.exit(result.status || 1);
  }
  outputs.push(output);
  console.log(`写入 ${output}`);
}

const archiveDirectory = path.join(outputDirectory, "archives");
fs.mkdirSync(archiveDirectory, {recursive: true});
const archiveName = `${prefix}-${timestamp()}.zip`;
const archive = path.join(archiveDirectory, archiveName);
const zip = spawnSync("zip", ["-j", "-q", archive, ...outputs], {encoding: "utf8"});
if (zip.status !== 0) {
  process.stderr.write(zip.stderr || zip.stdout || "找不到 zip 命令或压缩失败\n");
  process.exit(zip.status || 1);
}

const archiveRelative = path.relative(root, archive).split(path.sep).join("/");
console.log(`压缩 ${archive}`);
console.log(JSON.stringify({ok: true, count, outputDirectory, prefix, archive: archiveRelative, archiveName}));
