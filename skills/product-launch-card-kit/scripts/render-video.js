#!/usr/bin/env node
const path = require("path");
const {spawnSync} = require("child_process");

const framework = path.resolve(__dirname, "../resources/framework/render-video.js");
const projectIndex = process.argv.indexOf("--project");
const project = projectIndex === -1 ? process.cwd() : path.resolve(process.argv[projectIndex + 1]);
const result = spawnSync(process.execPath, [framework, "--project", project], {stdio: "inherit"});
process.exit(result.status || 0);
