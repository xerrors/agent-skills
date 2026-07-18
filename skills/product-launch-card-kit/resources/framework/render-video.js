#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const {spawnSync} = require("child_process");
const {captureAnimationFrames} = require("./capture-animation-frames");

function projectArg() {
  const index = process.argv.indexOf("--project");
  return path.resolve(index === -1 ? "." : process.argv[index + 1]);
}

function run(command, args) {
  const result = spawnSync(command, args, {encoding: "utf8"});
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "");
    process.exit(result.status || 1);
  }
}

async function main() {
  const root = projectArg();
  const config = JSON.parse(fs.readFileSync(path.join(root, "launch.config.json"), "utf8"));
  const video = config.video || {};
  const cards = config.cards || {};
  const count = Number(cards.count);
  const seconds = Number(video.secondsPerCard || 4);
  const fps = Number(video.fps || 30);
  const totalDuration = count * seconds;
  const output = path.join(root, video.output || `video/${config.storyId}.mp4`);
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "launch-video-"));

  fs.mkdirSync(path.dirname(output), {recursive: true});

  try {
    const captured = await captureAnimationFrames({root, config, tempDirectory});
    const args = ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", captured.concatFile];
    const audio = video.audio ? path.join(root, video.audio) : "";
    const hasAudio = Boolean(audio && fs.existsSync(audio));
    const filters = [`[0:v]fps=${fps},format=yuv420p[video]`];

    if (hasAudio) {
      const volume = Number(video.volume ?? 0.2);
      const fade = Math.max(0, Number(video.fadeSeconds ?? 1));
      args.push("-stream_loop", "-1", "-i", audio);
      filters.push(`[1:a]volume=${volume},afade=t=in:st=0:d=${fade},afade=t=out:st=${Math.max(0, totalDuration - fade)}:d=${fade}[audio]`);
    }

    args.push("-filter_complex", filters.join(";"), "-map", "[video]");
    if (hasAudio) args.push("-map", "[audio]", "-c:a", "aac", "-b:a", "192k");
    args.push("-c:v", "libx264", "-preset", "slow", "-crf", "18", "-t", String(totalDuration), "-movflags", "+faststart", output);
    run("ffmpeg", args);

    console.log(JSON.stringify({
      ok: true,
      output,
      duration: totalDuration,
      fps,
      cards: count,
      animation: {
        source: config.animation?.stylesheet || "theme/animate.css",
        captureFps: captured.captureFps,
        animationSeconds: captured.animationSeconds,
        frames: captured.frameCount
      },
      audio: hasAudio ? video.audio : null
    }));
  } finally {
    fs.rmSync(tempDirectory, {recursive: true, force: true});
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
