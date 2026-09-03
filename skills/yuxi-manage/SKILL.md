---
name: yuxi-manage
description: 管理 xerrors/Yuxi 的 xhome 项目、路线图、GitHub PR 创建与交付门禁，并报告 PR、CI、Star 和仓库动态。用户要求管理 Yuxi 项目或任务、维护路线图、创建/提交 PR、检查 PR 门禁或查询仓库状态时使用；不负责需求 spec、开发规划、功能实现、测试设计或代码审阅。
---

# Yuxi 管理

此 skill 是 `xerrors/Yuxi` 的项目与仓库交付管理层，只负责：

- xhome 项目和任务的查询、创建、字段更新、状态流转与来源关联。
- 路线图条目的维护，以及 xhome 与明确指定的 `roadmap.md` 之间的同步。
- 将已经准备好的代码变更交付为 PR，并执行提交、身份、远端、目标仓库、模板、测试证据和 CI 门禁。
- PR、CI、Star、Issue 和仓库近期活动的实时报告。

## 明确边界

此 skill 不承担开发过程管理，不执行或设计以下工作：

- 编写需求 spec、技术方案、开发计划、验收标准或 `docs/vibe` 文档。
- 实现功能、修复 bug、重构代码、选择架构或拆分开发步骤。
- 设计测试、安排 E2E、要求截图，或替开发者决定应运行哪些测试。
- 审阅代码、生成 review findings、回复 PR review、approve、request changes 或合并 PR。
- 自动调用、要求调用或依赖外部代码审阅 skill；代码审阅始终是独立工作流。
- 因为用户正在开发 Yuxi，就自动创建任务、写 spec、记录设计或持续同步开发过程。

如果一个请求同时包含开发和管理动作，只执行明确的项目管理或 PR 交付部分；开发部分交给当前项目适用的开发流程。创建 PR 时可以提交和推送已准备好的变更，但不得借机修改代码。

除非用户要求其他语言，否则默认输出中文。将“current”“latest”“today”“now”“recent”“当前”“最新”“今天”和“动态”等词视为必须读取实时数据。

## 默认值

- 主仓库：`xerrors/Yuxi`。
- 默认贡献者 Fork / PR 目标：`Yuchuan925/Yuxi`，base 为 `main`。
- 用户只说“创建 PR”或“开 PR”且未指定目标时，向 `Yuchuan925/Yuxi:main` 创建 Draft PR。
- 用户明确指定主仓库、`xerrors/Yuxi` 或其他仓库时，严格使用指定目标。
- 默认 xhome endpoint：`http://121.41.110.195`。
- 默认 xhome 项目：`Yuxi`；每次通过 `xhome projects list` 解析实际项目 ID，不硬编码。
- 默认公开路线图：`docs/develop-guides/roadmap.md`。
- 默认时区：北京时间 / CST / UTC+8。
- GitHub 操作优先使用已认证的 `gh`；Star 脚本或 `gh` 不可用时，可用 `curl` 和 `http://127.0.0.1:7890` 代理回退。

## xhome 项目管理

首次使用前若缺少 CLI，可安装：

```bash
npm install -g @xerrors/home
```

每次写入前确认 endpoint、身份和目标项目：

```bash
xhome config set endpoint http://121.41.110.195
xhome auth status
xhome projects list
xhome projects tasks list <xhome-project-id>
```

管理规则：

- 所有 Yuxi 项目任务统一通过 xhome 管理，不用其他任务系统代替。
- 找不到 `Yuxi` 项目时停止写入，不自动创建项目。
- 创建前按标题、Issue/PR 编号、来源 URL 和近似范围去重。
- 只有用户明确要求“新增/创建/添加任务”时才创建任务；查询、同步、更新或报告请求不隐含创建授权。
- 不因创建任务而自动调研、写 spec、评估技术可行性或创建 GitHub Issue。
- 用户提供的目标、优先级、状态、标签、来源和说明按原意写入；缺省优先级和可行性可用 `medium`，但不要伪造依据。
- xhome 状态只使用 `todo`、`doing`、`review`、`done`。`review` 表示已进入 PR/维护者处理阶段，不表示本 skill 执行代码审阅。
- 更新正文时保留原内容，只合并明确要求变更的字段和来源链接。

创建任务：

```bash
xhome projects tasks add <xhome-project-id> \
  -t "<任务标题>" \
  --status todo \
  --priority medium \
  --feasibility medium \
  --tags "<标签>" \
  --content-file <task-content.md>
```

更新任务：

```bash
xhome projects tasks update <task-id> <field-options>
xhome projects tasks content <task-id> --content-file <updated-content.md>
xhome projects tasks status <task-id> <todo|doing|review|done>
```

不要根据代码是否开始、测试是否完成等开发阶段事件自行流转任务。例外是成功创建 PR 后，可将匹配任务更新为 `review` 并关联 PR；这属于交付状态同步。

## 路线图管理

当用户要求更新、刷新、同步或维护 Yuxi 路线图时：

- 未明确提到 `roadmap.md` 时，默认维护 xhome `Yuxi` 项目的路线图任务。
- 只有明确要求修改公开文档或提供 `roadmap.md` 路径时，才编辑 `docs/develop-guides/roadmap.md`。
- 同时要求两者时，先更新 xhome，再对文档做最小匹配修改。

读取实时上下文：

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
xhome auth status
xhome projects list
xhome projects tasks list <xhome-project-id>
gh issue list --repo xerrors/Yuxi --state open --label roadmap --limit 100 --json number,title,labels,updatedAt,url
gh issue list --repo xerrors/Yuxi --state open --label feat --limit 100 --json number,title,labels,updatedAt,url
```

路线图规则：

- 更新匹配的现有任务；没有匹配项时列入 `Skipped`。
- 只有用户明确要求添加或创建路线图条目时，才创建 xhome 任务。
- 优先使用带 `roadmap` 标签的 Issue；仅在用户要求扩大范围时检查相关 `feat` Issue。
- 正文记录 `来源：用户提供`、`来源：GitHub Issue` 或 `来源：docs/develop-guides/roadmap.md`，并保留 Issue URL、分类和目标版本等已知信息。
- 去掉 `Feat:`、`Error:`、`Question:` 等前缀，只做必要的标题清理。
- 不自动生成调研报告、日期前缀、设计方案或可行性结论。

明确编辑 `roadmap.md` 时，先读取当前文档，保留既有章节、语气、徽章和分组，只做用户要求的最小变更：

```bash
gh api repos/xerrors/Yuxi/contents/docs/develop-guides/roadmap.md --jq .content | base64 --decode
```

Issue 派生条目使用 `([#123](https://github.com/xerrors/Yuxi/issues/123))` 关联来源。用户若要求提交或推送文档改动，先展示改动文件和摘要并等待明确确认。

## PR 创建与交付门禁

当用户要求为已经准备好的 Yuxi 变更创建、提交或更新 PR 时使用。本流程只包装已有变更，不负责开发、测试设计或代码审阅。

### 1. 定位交付范围

```bash
git status --short --branch
git remote -v
git branch --show-current
gh api user --jq .login
```

- 保护已有工作树，不 reset、rebase、强制推送或改写无关文件。
- 不在 `main` 上直接交付；head 必须是独立任务分支。
- 默认工作区中 `origin` 应指向贡献者 Fork，`upstream` 应指向 `xerrors/Yuxi`。禁止把 head 分支推送到 `upstream`。
- 只暂存用户指定或能明确归属于当前交付的文件；范围不清时先展示候选文件并请求确认。
- 若变更仍需实现、修复或补测试，停止 PR 创建并报告缺口，不在本 skill 内处理。

### 2. PR 前门禁

创建 PR 前逐项验证：

- 目标门禁：明确 base 仓库、base 分支、head owner 和 head 分支。
- 身份门禁：`gh` 登录账号、Git author/committer 和 `origin` owner 必须属于获准贡献者；不得把 `xerrors` / 张文杰作为默认贡献者身份。
- 变更门禁：检查 staged/committed 文件范围，不包含无关修改、密钥、Token、`.env` 或用户数据。
- 模板门禁：读取并填写仓库当前 `.github/PULL_REQUEST_TEMPLATE.md`；若本地缺失，从目标仓库读取。
- 证据门禁：只记录开发者实际提供或现有日志中能验证的测试结果。测试缺失或失败时如实写入，不自行设计或宣称已完成测试。
- 分支门禁：确认 head 已提交且可推送到贡献者 Fork；不得推送到 `upstream`。
- 重复门禁：检查同一 head 是否已有 PR；存在时更新或返回现有 PR，不重复创建。

对于默认目标 `Yuchuan925/Yuxi:main`，门禁通过后可直接 commit、push 并创建 Draft PR。若当前 `gh` 不是 `Yuchuan925`，只允许切换到本机已经认证的 `Yuchuan925` 账号；记录原账号，完成后恢复并验证。切换失败时停止，不修改凭据、Git 身份或 remote。

对于 `xerrors/Yuxi:main`、其他目标仓库，或用户明确要求先确认时，必须先展示：

- 精确的目标仓库/base/head。
- 将提交的文件范围和 commit 信息。
- 拟用 PR 标题与完整正文。
- 已知测试证据、CI 情况和未验证项。

等待用户明确确认当前材料后，才能 commit、push 或创建 PR。该确认是发布授权，不是代码审阅，也不调用外部代码审阅 skill。

### 3. Commit、Push、Draft PR

- 只提交已确认范围，使用中文 Conventional Commit。
- 只把 head 分支推送到贡献者 Fork 的 `origin`。
- 默认创建 Draft PR；除非用户明确要求，否则不转为 ready、不回复 review、不 approve、不合并。
- 标题直接表达目标，不加 `🤖` 或 AI/Agent 贡献说明。
- 正文忠实填写模板，包含变更摘要、已有测试证据、风险/未验证项和关联 Issue；缺失信息标为未验证。

```bash
git add <confirmed-files>
git commit -m "<type>: <中文摘要>"
git push -u origin <head-branch>
gh pr create \
  --repo <target-repo> \
  --base <base-branch> \
  --head <contributor>:<head-branch> \
  --title "<PR 标题>" \
  --draft \
  --body-file <completed-pr-template>
gh pr view --repo <target-repo> --json url,state,isDraft,title,author,headRepositoryOwner,headRefName,baseRefName,statusCheckRollup
```

创建成功后，把完整 PR URL 合并到匹配的 xhome 任务正文，将状态设为 `review`，保留已有业务标签，并添加不重复的 `待审查` 标签。只有用户明确要求且 PR 已合并时，才把任务更新为 `done`。

## PR 与门禁状态报告

快速报告：

```bash
python3 <skill-dir>/scripts/yuxi_pr_report.py current
python3 <skill-dir>/scripts/yuxi_pr_report.py overview
python3 <skill-dir>/scripts/yuxi_pr_report.py pr --number <number>
```

手动读取：

```bash
gh pr view --repo xerrors/Yuxi --json number,title,url,state,isDraft,mergeStateStatus,reviewDecision,statusCheckRollup,latestReviews,comments,commits,updatedAt
gh pr list --repo xerrors/Yuxi --state open --limit 10 --json number,title,url,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup,updatedAt
```

对于“current PR”，先查当前分支关联 PR；没有时说明并回退到开放 PR 概览。报告包含 PR 身份、状态、人类审批信号、CI、最多三条近期活动、北京时间更新时间和下一步门禁行动。读取审批结论只用于报告和门禁判断，不执行代码审阅。

普通报告省略作者、分支、原始 mergeable 和仓库名，除非这些信息解释阻塞。数据缺失时明确写不可用，不猜测“可合并”。

## Star 跟踪

```bash
python3 <skill-dir>/scripts/yuxi_stars_report.py
```

脚本打印北京时间摘要并写入 `/tmp/yuxi_stars_chart.png`。图表、时间戳、调度和 API 细节见 [Star 跟踪参考](references/star-tracking.md)。

## 回复格式

PR / 门禁状态使用紧凑结构：

```markdown
## PR 状态
- PR：#123 标题
- 状态：open / draft / closed
- 审批：approved / changes requested / review required / unknown
- CI：passing / failing: <check names> / pending / unavailable
- 更新时间：YYYY-MM-DD HH:mm CST

## 下一步门禁
...
```

项目或路线图更新应列出 xhome 项目与任务 ID、已添加、已更新、已跳过和来源链接。PR 创建结果应列出 URL、目标、head、Draft 状态、已通过/未通过门禁，以及关联的 xhome 状态更新。

## 常见陷阱

- 实时请求必须重新查询 GitHub/xhome。
- 不带 PR 编号的 `gh pr view` 依赖当前分支；不在 Yuxi 工作区时显式使用 `--repo`。
- 没有匹配项目或任务不代表获得创建权限。
- 路线图 Issue 标签不一致时，报告筛选器和跳过项，不静默猜测。
- PR 创建授权不等于开发、代码审阅或合并授权。
- 不要为了满足门禁而伪造测试、CI、审批或身份信息。
