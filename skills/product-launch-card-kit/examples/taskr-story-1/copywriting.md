# Taskr Story 1 Copywriting

## Title Options

1. AI 写的 Markdown，为什么你不想读？
2. 我做了个给编码 Agent 用的项目管理 Skill
3. 别再让 AI 的任务计划散在聊天里了
4. Markdown 给 Agent，Board 给人
5. 一个更适合个人开发者的 Agent 项目管理方式

Recommended: `AI 写的 Markdown，为什么你不想读？`

## Body

最近看到大家在讨论：Agent 的输出是不是不该只停留在 Markdown？

我挺有共鸣的。

Markdown 很适合让 Agent 写，也适合进 Git、看 diff、被下一轮会话继续读取。

但问题是：当需求、计划、验收标准、验证记录越来越长，人真的不想读。

所以我做了一个小工具：Taskr。

它的思路很简单：

让 Agent 继续写 Markdown，
但让用户看到 HTML 界面。

Taskr 是一个 repo-local 的任务管理 Skill。
它会把需求、计划、验收、验证记录写进 `.taskr/tasks/*.md`，这些文件可以跟代码一起放在仓库里。

然后再渲染成 Table / Board 视图，让你能快速看到：

任务现在是什么状态
验收标准完成了多少
验证命令跑过没有
有没有 commit 证据
哪些任务还在 pending confirmation

它不是 Jira / Linear / Trello 的替代品。
更准确地说，它适合个人开发者、开源维护者，以及经常使用 Claude Code / Codex / Cursor / OpenCode 这类编码 Agent 的人。

一句话总结：

Markdown 给 Agent，Board 给人。

项目地址：
https://github.com/xerrors/taskr

欢迎 Star，也欢迎提建议。

## Tags

```text
#AI编程 #ClaudeCode #Codex #Cursor #OpenCode #开源项目 #独立开发者 #效率工具 #项目管理 #Markdown #GitHub #程序员工具 #VibeCoding #AI工具 #个人开发者
```

