# Example: Taskr Story 1

This example captures the launch flow used for Taskr, a repo-local task protocol and board for coding agents.

## Product

Taskr is a Skill/tooling workflow where the agent writes task Markdown in the repository and the user reads a rendered Table/Board HTML interface.

## Final Story

Core line:

> Markdown 给 Agent，Board 给人。

The story started from a timely debate about whether agents should output HTML instead of Markdown. The final angle avoided taking a hard stance and instead separated the layers:

- Markdown is good as the agent-editable source of truth.
- HTML is good as the human-readable interface.
- Taskr is the Skill that connects the two.

## Deck Outline

1. `AI 写的 Markdown，为什么你不想读？`
2. The public discussion: maybe agent output should not always be Markdown.
3. Direct HTML output is not always right for project management.
4. Taskr: Markdown stays in the repo; the interface visualizes it.
5. Board view screenshot.
6. Detail view screenshots and workflow steps.
7. Who Taskr is for and not for.
8. Install commands, GitHub screenshot, project URL, and `欢迎 Star`.

## Visual Decisions

- Use 1080x1440 cards for Xiaohongshu.
- Make the deck feel like an editorial product story, not a marketing landing page.
- Use real screenshots whenever possible.
- Use light caption pills on dark screenshots.
- Remove outer card radius when the user wants clean screenshots.
- Put title, body, tags, and full publish copy inside the HTML workbench so the user can copy them directly.

## Copy Example

Recommended title:

```text
AI 写的 Markdown，为什么你不想读？
```

Short body summary:

```text
Markdown 很适合让 Agent 写，也适合进 Git、看 diff、被下一轮会话继续读取。
但当需求、计划、验收标准、验证记录越来越长，人真的不想读。

Taskr 的思路是：让 Agent 继续写 Markdown，但让用户看到 HTML 界面。

Markdown 给 Agent，Board 给人。
```

Tags:

```text
#AI编程 #ClaudeCode #Codex #Cursor #OpenCode #开源项目 #独立开发者 #效率工具 #项目管理 #Markdown #GitHub #程序员工具 #VibeCoding #AI工具 #个人开发者
```

