#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else { args[key] = next; index += 1; }
  }
  return args;
}

function replaceAll(source, values) {
  let result = source;
  for (const [key, value] of Object.entries(values)) result = result.split(`{{${key}}}`).join(String(value));
  return result;
}

const args = parseArgs(process.argv);
if (!args.out) {
  console.error("用法：node scripts/create-project.js --out /path/to/launch --theme product-showcase --story-id product-v1 --project-name 产品名 --version v1.0");
  process.exit(1);
}

const skillRoot = path.resolve(__dirname, "..");
const themeName = args.theme || "product-showcase";
const themeSource = path.join(skillRoot, "resources", "themes", themeName);
const frameworkSource = path.join(skillRoot, "resources", "framework");
const output = path.resolve(args.out);
const storyId = args["story-id"] || path.basename(output).replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
const projectName = args["project-name"] || "产品名称";
const version = args.version || "v1.0";
const prefix = args.prefix || `${storyId}-card`;

for (const required of ["DESIGN.md", `${themeName}.css`, `${themeName}-template.html`]) {
  if (!fs.existsSync(path.join(themeSource, required))) throw new Error(`主题缺少文件：${required}`);
}

if (fs.existsSync(output) && fs.readdirSync(output).filter((name) => !name.startsWith(".")).length && !args.force) {
  throw new Error(`输出目录不是空目录：${output}。需要覆盖时显式传入 --force。`);
}

fs.mkdirSync(output, {recursive: true});
for (const directory of ["framework", "theme", "assets/images", "assets/audios", "previews", "video"]) {
  fs.mkdirSync(path.join(output, directory), {recursive: true});
}

for (const name of fs.readdirSync(frameworkSource)) {
  if (name === "project-package.json" || name.startsWith(".")) continue;
  fs.cpSync(path.join(frameworkSource, name), path.join(output, "framework", name), {recursive: true, force: true});
}
fs.copyFileSync(path.join(frameworkSource, "project-package.json"), path.join(output, "package.json"));
fs.copyFileSync(path.join(themeSource, "DESIGN.md"), path.join(output, "theme", "DESIGN.md"));
fs.copyFileSync(path.join(themeSource, `${themeName}.css`), path.join(output, "theme", `${themeName}.css`));
for (const name of fs.readdirSync(themeSource)) {
  if (["DESIGN.md", `${themeName}.css`, `${themeName}-template.html`].includes(name) || name.startsWith(".")) continue;
  fs.cpSync(path.join(themeSource, name), path.join(output, "theme", name), {recursive: true, force: true});
}

const entry = `${storyId}-cards.html`;
const template = fs.readFileSync(path.join(themeSource, `${themeName}-template.html`), "utf8");
const renderedTemplate = replaceAll(template, {
  STORY_ID: storyId,
  PROJECT_NAME: projectName,
  VERSION: version,
  CARD_PREFIX: prefix
});
const cardCount = (renderedTemplate.match(/class=["'][^"']*\blaunch-card\b/g) || []).length;
if (!cardCount) throw new Error(`主题模板中没有找到 .launch-card：${themeName}`);
if (args.cards && Number(args.cards) !== cardCount) {
  throw new Error(`主题实际包含 ${cardCount} 张卡片，与 --cards ${args.cards} 不一致；请直接修改主题模板中的卡片数量。`);
}
fs.writeFileSync(path.join(output, entry), renderedTemplate, "utf8");

const config = {
  storyId,
  projectName,
  version,
  theme: themeName,
  entry,
  cards: {count: cardCount, width: 1080, height: 1440, prefix, outputDirectory: "previews"},
  video: {secondsPerCard: 4, fps: 30, audio: "", volume: 0.2, fadeSeconds: 1, output: `video/${storyId}.mp4`}
};
fs.writeFileSync(path.join(output, "launch.config.json"), JSON.stringify(config, null, 2) + "\n", "utf8");

console.log(`已创建：${output}`);
console.log(`主题：${themeName}`);
console.log(`启动：cd ${output} && npm run serve`);
