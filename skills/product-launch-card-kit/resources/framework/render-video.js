#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const {spawnSync} = require("child_process");

function projectArg() {
  const index = process.argv.indexOf("--project");
  return path.resolve(index === -1 ? "." : process.argv[index + 1]);
}

function escapeConcat(file) {
  return file.replace(/'/g, "'\\''");
}

function run(command, args) {
  const result = spawnSync(command, args, {encoding: "utf8"});
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "");
    process.exit(result.status || 1);
  }
}

const root = projectArg();
const config = JSON.parse(fs.readFileSync(path.join(root, "launch.config.json"), "utf8"));
const video = config.video || {};
const cards = config.cards || {};
const count = Number(cards.count);
const seconds = Number(video.secondsPerCard || 4);
const fps = Number(video.fps || 30);
const totalDuration = count * seconds;
const prefix = cards.prefix || `${config.storyId}-card`;
const previewDirectory = path.join(root, cards.outputDirectory || "previews");
const output = path.join(root, video.output || `video/${config.storyId}.mp4`);
const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "launch-video-"));
const concatFile = path.join(tempDirectory, "cards.txt");
const lines = [];

for (let card = 1; card <= count; card += 1) {
  const image = path.join(previewDirectory, `${prefix}-${String(card).padStart(2, "0")}.png`);
  if (!fs.existsSync(image)) throw new Error(`缺少卡片 PNG：${image}`);
  lines.push(`file '${escapeConcat(image)}'`);
  lines.push(`duration ${seconds}`);
  if (card === count) lines.push(`file '${escapeConcat(image)}'`);
}
fs.writeFileSync(concatFile, lines.join("\n") + "\n", "utf8");
fs.mkdirSync(path.dirname(output), {recursive: true});

const args = ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", concatFile];
const audio = video.audio ? path.join(root, video.audio) : "";
if (audio && fs.existsSync(audio)) {
  const volume = Number(video.volume ?? 0.2);
  const fade = Math.max(0, Number(video.fadeSeconds ?? 1));
  args.push("-stream_loop", "-1", "-i", audio);
  args.push("-filter_complex", `[1:a]volume=${volume},afade=t=in:st=0:d=${fade},afade=t=out:st=${Math.max(0, totalDuration - fade)}:d=${fade}[audio]`);
  args.push("-map", "0:v:0", "-map", "[audio]", "-c:a", "aac", "-b:a", "192k");
}
args.push("-vf", `fps=${fps},format=yuv420p`, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-t", String(totalDuration), "-movflags", "+faststart", output);
run("ffmpeg", args);
fs.rmSync(tempDirectory, {recursive: true, force: true});

console.log(JSON.stringify({ok: true, output, duration: totalDuration, fps, cards: count, audio: audio && fs.existsSync(audio) ? video.audio : null}));
