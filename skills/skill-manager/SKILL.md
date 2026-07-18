---
name: skill-manager
description: 管理本地 agent-skills 仓库，并将其中的 skill 安装到各 Agent 工具目录。当用户要求更新、修改、创建、配置、安装、链接、建立符号链接、同步、提交或推送 ~/Documents/projects/agent-skills 中的 skill 时使用，尤其适用于 skill update、update this Skill、config skills、install skills for Codex、install skills for Claude Code，或确保 ~/.agents/skills、~/.codex/skills 与 ~/.claude/skills 指向该仓库等请求。
---

# Skill 管理器

## 概述

使用此 skill 管理 `agent-skills` GitHub 仓库中的个人 skill，并让 Agents、Codex 和 Claude Code 能够使用同一套 skill。

除非用户要求使用其他语言，否则默认使用中文回复。

## 默认值

- 仓库：`~/Documents/projects/agent-skills`。
- Skill 源目录：`~/Documents/projects/agent-skills/skills`。
- Agent skill 目录：`~/.agents/skills`。
- Codex skill 目录：`${CODEX_HOME:-~/.codex}/skills`。
- Claude Code skill 目录：`${CLAUDE_CONFIG_DIR:-~/.claude}/skills`。
- 权限检查所期望的 GitHub 账号：`xerrors`。
- GitHub 代理回退地址：`http://127.0.0.1:7890`。

如果用户指定了其他仓库、skill 名称、分支或安装目录，遵循用户明确给出的目标。

## 请求路由

- 当用户要求更改 skill、为 skill 添加行为、修复 skill、提交 skill 更改或推送 skill 更新时，使用 **更新** 流程。
- 当用户要求安装 skill、配置 skill、创建符号链接、检查 Agent 工具能否发现 skill，或让 Agents/Codex/Claude Code 共享仓库中的 skill 时，使用 **配置** 流程。
- 如果请求同时包含两类操作，先执行更新，再执行配置。

## 更新

编辑 skill 前，先同步仓库：

```bash
git -C ~/Documents/projects/agent-skills pull --ff-only
```

如果拉取似乎卡住或超时，使用本地代理重试一次，但不要写入全局 Git 配置：

```bash
git -C ~/Documents/projects/agent-skills \
  -c http.proxy=http://127.0.0.1:7890 \
  -c https.proxy=http://127.0.0.1:7890 \
  pull --ff-only
```

如果 Git 报告身份验证或权限错误，在继续之前检查 GitHub CLI 账号：

```bash
gh auth status
gh api user --jq .login
```

如果登录账号不是 `xerrors`，在执行任何提交或推送前停止，并告诉用户当前使用的是哪个账号。请用户切换账号或重新认证。如果 `gh` 出现网络故障，使用以下命令重试：

```bash
HTTPS_PROXY=http://127.0.0.1:7890 gh auth status
HTTPS_PROXY=http://127.0.0.1:7890 gh api user --jq .login
```

编辑时：

- 先使用 `git status --short --branch` 检查当前工作树。
- 保留无关的未提交文件或未跟踪文件。不要还原、覆盖、暂存或提交不属于本次 skill 更新的更改。
- 编辑目标 skill 前，读取其现有 `SKILL.md` 以及其中直接引用的资源。
- 创建新 skill 时，在可用的情况下使用本地 skill creator 工作流。
- 保持 `SKILL.md` 简洁。frontmatter 的 `description` 中只放必要的触发信息，流程细节放在正文中。
- 如果 skill 面向用户的描述或默认提示已经过时，更新 `agents/openai.yaml`。

编辑完成后，如果存在验证器，则验证修改过的 skill：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-dir>
```

如果该路径不存在，在已知的 Codex skill 目录中搜索 `quick_validate.py`，并使用找到的第一个验证器。

提交或推送之前：

- 向用户展示修改过的文件及简短摘要。
- 请求用户明确确认是否提交并推送。
- 即使用户最初要求更新，也不要在未经确认的情况下提交或推送。
- 用户确认后，只暂存相关 skill 文件以及有意修改的仓库元数据。

使用聚焦的提交：

```bash
git -C ~/Documents/projects/agent-skills add <changed-skill-files>
git -C ~/Documents/projects/agent-skills commit -m "Update <skill-name> skill"
git -C ~/Documents/projects/agent-skills push
```

如果推送因网络超时失败，使用每条命令单独设置的 7890 代理重试一次。如果推送因身份验证失败，再次检查 `gh` 当前登录的是否为 `xerrors`。

## 配置

配置流程用于确保仓库中的 skill 能被所有受支持的本地 Agent 工具 skill 目录发现。

首先确定源 skill：

- 如果用户指定了某个 skill，使用 `~/Documents/projects/agent-skills/skills/<name>`。
- 如果用户没有指定 skill 名称，只要求安装或配置“这些 skill”，则枚举 `~/Documents/projects/agent-skills/skills` 下所有包含 `SKILL.md` 的目录。
- 不要为不包含 `SKILL.md` 的目录创建链接。

对每个源 skill，检查以下目标：

```text
~/.agents/skills/<skill-name>
${CODEX_HOME:-~/.codex}/skills/<skill-name>
${CLAUDE_CONFIG_DIR:-~/.claude}/skills/<skill-name>
```

使用 `mkdir -p` 创建缺失的父目录。对于每个目标：

- 如果目标不存在，创建符号链接。
- 如果目标是符号链接，且解析后的路径就是源 skill 目录，则保持不变。
- 如果目标是符号链接，但解析后指向其他位置，未经用户确认不要替换。报告现有目标和期望的源目录。
- 如果目标是真实目录或文件，不要覆盖。报告冲突并询问用户如何处理。

对于 `~/.agents/skills` 和 Codex，优先创建直接指向仓库源目录的链接：

```bash
ln -s ~/Documents/projects/agent-skills/skills/<skill-name> ~/.agents/skills/<skill-name>
ln -s ~/Documents/projects/agent-skills/skills/<skill-name> "${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>"
```

对于 Claude Code，如果 `~/.agents/skills/<skill-name>` 已存在，则遵循本地约定：只要解析后的路径仍指向仓库源目录，就让 Claude Code 链接到 Agents 目录中的入口。

```bash
ln -s ../../.agents/skills/<skill-name> "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>"
```

如果该相对链接无法正确解析，则改为创建直接指向仓库源目录的符号链接。

创建后验证链接：

```bash
ls -l ~/.agents/skills/<skill-name>
ls -l "${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>"
ls -l "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>"
realpath ~/.agents/skills/<skill-name>
realpath "${CODEX_HOME:-$HOME/.codex}/skills/<skill-name>"
realpath "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/<skill-name>"
```

在最终回复中，报告哪些链接原本已存在、哪些链接已创建，以及哪些冲突仍需用户处理。
