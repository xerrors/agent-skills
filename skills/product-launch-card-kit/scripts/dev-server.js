#!/usr/bin/env node
const path = require("path");
const {spawnSync} = require("child_process");

const framework = path.resolve(__dirname, "../resources/framework/server.js");
const project = process.argv[2] && !process.argv[2].startsWith("--") ? path.resolve(process.argv[2]) : process.cwd();
const forwarded = process.argv.slice(project === process.cwd() ? 2 : 3);
const result = spawnSync(process.execPath, [framework, project, ...forwarded], {stdio: "inherit"});
process.exit(result.status || 0);
