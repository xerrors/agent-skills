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
  console.log(`写入 ${output}`);
}

console.log(JSON.stringify({ok: true, count, outputDirectory, prefix}));
