#!/usr/bin/env node
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  console.error(`Usage:
node export-cards.js --html /abs/path/cards.html --out /abs/path/previews --prefix story-card --cards 8

Options:
  --html      Absolute or relative path to the HTML workbench.
  --out       Output directory for PNG files.
  --prefix    PNG filename prefix. Default: card
  --cards     Number of cards. Default: 8
  --width     Export width. Default: 1080
  --height    Export height. Default: 1440

Set CHROME_BIN when Chrome is not at the default macOS path.`);
  process.exit(1);
}

const args = parseArgs(process.argv);
if (!args.html || !args.out) usage();

const htmlPath = path.resolve(args.html);
const outDir = path.resolve(args.out);
const prefix = args.prefix || "card";
const cards = Number(args.cards || 8);
const width = Number(args.width || 1080);
const height = Number(args.height || 1440);
const chrome = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!fs.existsSync(htmlPath)) {
  console.error(`HTML file not found: ${htmlPath}`);
  process.exit(1);
}

if (!fs.existsSync(chrome)) {
  console.error(`Chrome binary not found: ${chrome}`);
  console.error("Set CHROME_BIN to your browser executable.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (let index = 1; index <= cards; index += 1) {
  const padded = String(index).padStart(2, "0");
  const output = path.join(outDir, `${prefix}-${padded}.png`);
  const url = `${pathToFileURL(htmlPath).href}?export=1&card=${index}`;
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--screenshot=${output}`,
    `--window-size=${width},${height}`,
    url,
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || "");
    process.stderr.write(result.stdout || "");
    console.error(`Failed to export card ${index}`);
    process.exit(result.status || 1);
  }

  console.log(`Wrote ${output}`);
}
