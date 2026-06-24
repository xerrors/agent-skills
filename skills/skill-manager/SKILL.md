---
name: skill-manager
description: Manage the local agent-skills repository and install its skills into agent tool directories. Use when the user asks to update, modify, create, configure, install, link, symlink, sync, commit, or push skills from ~/Documents/projects/agent-skills, especially commands like skill update, update this Skill, config skills, install skills for Codex, install skills for Claude Code, or ensure ~/.agents/skills, ~/.codex/skills, and ~/.claude/skills point at the repository.
---

# Skill Manager

## Overview

Use this skill to manage personal skills in the `agent-skills` GitHub repository
and to keep the same skills available to Agents, Codex, and Claude Code.

Default to Chinese responses unless the user asks for another language.

## Defaults

- Repository: `~/Documents/projects/agent-skills`.
- Skills source directory: `~/Documents/projects/agent-skills/skills`.
- Agent skills directory: `~/.agents/skills`.
- Codex skills directory: `${CODEX_HOME:-~/.codex}/skills`.
- Claude Code skills directory: `${CLAUDE_CONFIG_DIR:-~/.claude}/skills`.
- Expected GitHub account for permission checks: `xerrors`.
- GitHub proxy fallback: `http://127.0.0.1:7890`.

If the user gives a different repository, skill name, branch, or install
directory, follow the explicit target.

## Request Routing

- Use **Update** when the user asks to change a skill, add behavior to a skill,
  repair a skill, commit a skill change, or push skill updates.
- Use **Config** when the user asks to install skills, configure skills, create
  symlinks, check whether agent tools can see skills, or make Agents/Codex/Claude
  Code share the repository's skills.
- If the request includes both, do Update first, then Config.

## Update

Before editing a skill, synchronize the repository:

```bash
git -C ~/Documents/projects/agent-skills pull --ff-only
```

If the pull appears to hang or times out, retry once with the local proxy without
writing global Git config:

```bash
git -C ~/Documents/projects/agent-skills \
  -c http.proxy=http://127.0.0.1:7890 \
  -c https.proxy=http://127.0.0.1:7890 \
  pull --ff-only
```

If Git reports an authentication or permission error, inspect the GitHub CLI
account before continuing:

```bash
gh auth status
gh api user --jq .login
```

If the login is not `xerrors`, stop before any commit or push and tell the user
which account is active. Ask the user to switch or re-authenticate. For network
failures in `gh`, retry with:

```bash
HTTPS_PROXY=http://127.0.0.1:7890 gh auth status
HTTPS_PROXY=http://127.0.0.1:7890 gh api user --jq .login
```

When editing:

- Inspect the current worktree with `git status --short --branch` first.
- Preserve unrelated dirty or untracked files. Do not revert, overwrite, stage,
  or commit changes that are not part of the requested skill update.
- Read the target skill's existing `SKILL.md` and any directly referenced
  resources before editing.
- For a new skill, use the local skill creator workflow when available.
- Keep `SKILL.md` concise. Put only essential trigger information in the
  frontmatter `description` and put procedural details in the body.
- Update `agents/openai.yaml` if the skill's user-facing description or default
  prompt is stale.

After editing, validate the changed skill when the validator exists:

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-dir>
```

If that path does not exist, search for `quick_validate.py` under known Codex
skill directories and use the first matching validator.

Before committing or pushing:

- Show the user the changed files and a short summary.
- Ask for explicit confirmation to commit and push.
- Do not commit or push without that confirmation, even if the user originally
  asked for an update.
- After confirmation, stage only the relevant skill files and any intentional
  repository metadata updates.

Use a focused commit:

```bash
git -C ~/Documents/projects/agent-skills add <changed-skill-files>
git -C ~/Documents/projects/agent-skills commit -m "Update <skill-name> skill"
git -C ~/Documents/projects/agent-skills push
```

If push fails because of network timeout, retry once with the 7890 proxy using
per-command Git config. If push fails because of auth, re-check that `gh` is
logged in as `xerrors`.

## Config

Config ensures repository skills are visible in all supported local agent tool
skill directories.

First resolve the source skill or skills:

- If the user names a skill, use `~/Documents/projects/agent-skills/skills/<name>`.
- If no skill is named and the user says to install or configure "these skills",
  enumerate every directory under `~/Documents/projects/agent-skills/skills`
  that contains `SKILL.md`.
- Do not create links for directories that do not contain `SKILL.md`.

For each source skill, check these targets:

```text
~/.agents/skills/<skill-name>
${CODEX_HOME:-~/.codex}/skills/<skill-name>
${CLAUDE_CONFIG_DIR:-~/.claude}/skills/<skill-name>
```

Create missing parent directories with `mkdir -p`. For each target:

- If the target is absent, create a symlink.
- If the target is a symlink whose resolved path is the source skill directory,
  leave it unchanged.
- If the target is a symlink that resolves elsewhere, do not replace it without
  user confirmation. Report the existing target and the desired source.
- If the target is a real directory or file, do not overwrite it. Report the
  conflict and ask how to proceed.

Prefer direct links from `~/.agents/skills` and Codex to the repository source:

```bash
ln -s ~/Documents/projects/agent-skills/skills/<skill-name> ~/.agents/skills/<skill-name>
ln -s ~/Documents/projects/agent-skills/skills/<skill-name> "${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>"
```

For Claude Code, follow the local convention when `~/.agents/skills/<skill-name>`
already exists: link Claude Code to the Agents entry as long as the resolved path
still points at the repository source.

```bash
ln -s ../../.agents/skills/<skill-name> "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>"
```

If that relative link would not resolve correctly, create a direct symlink to the
repository source instead.

Verify links after creation:

```bash
ls -l ~/.agents/skills/<skill-name>
ls -l "${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>"
ls -l "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>"
realpath ~/.agents/skills/<skill-name>
realpath "${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>"
realpath "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>"
```

In the final response, report which links already existed, which were created,
and any conflicts that need user input.
