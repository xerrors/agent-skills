---
name: yuxi-manage
description: 管理 xerrors/Yuxi GitHub 项目的开发工作与报告。在 Yuxi 项目内工作、快速实现 feature、开始或完成 Yuxi 开发任务、更新 Yuxi GitHub Project，或询问 Yuxi Star、PR、CI、评审、路线图或仓库近期活动时使用此 skill。
---

# Yuxi 管理

使用此 skill 回答与 `xerrors/Yuxi` GitHub 仓库及其维护者 GitHub Project 相关的运营问题。该 skill 包含五个核心领域：

- Star 跟踪：获取实时 Star 数量、总结增长情况并生成每日趋势图。
- PR 跟踪：检查当前 PR 或开放 PR，只报告高信号的评审、检查、近期活动、新鲜度和下一步行动信息。
- 路线图更新：更新维护者专用 GitHub Project 路线图中匹配的条目；只有用户明确要求创建时才添加条目。
- 开发项目管理：开始、规划或完成 Yuxi 开发工作时，持续更新匹配的现有 GitHub Project 条目，记录任务、设计方案、状态、完成日期、测试结果和截图。
- Feature 快速实现：根据用户需求或 GitHub Project 任务，从贡献指南、任务检索、功能分支、实现和真实 E2E 测试一路推进到 Draft PR，并执行仅限此流程的非 `xerrors` 提交身份门禁。

除非用户要求使用其他语言，否则默认输出中文。将“current”“latest”“today”“now”“recent”“当前”“最新”“今天”和“动态”等词视为必须读取实时 GitHub 数据，而不是依赖记忆。

## 默认值

- 默认仓库：`xerrors/Yuxi`。
- 默认路线图 Project 所有者：`xerrors`。
- 默认路线图 Project 编号：`2`。
- 默认路线图 Project URL：`https://github.com/users/xerrors/projects/2`。
- 默认路线图文档路径：`docs/develop-guides/roadmap.md`。
- 默认开发 Project：同一个维护者 GitHub Project，除非用户提供了其他 Project URL 或编号。
- 默认时区：北京时间 / CST / UTC+8。
- PR 工作优先使用已认证的 `gh` 命令，因为它包含私有身份验证状态、当前分支上下文、评审数据和检查数据。
- 当 `gh` 不可用或使用 Star 脚本时，GitHub API 调用使用 `curl` 配合 `http://127.0.0.1:7890` 作为代理回退方案。
- 如果用户提供了其他仓库、PR URL 或 PR 编号，遵循用户明确给出的目标，而不是默认值。

## GitHub Project 创建边界

- 检查 Project，或要求规划、开始、跟踪、更新、同步、完成、报告工作，只授权读取和更新相匹配的现有资源。
- 如果请求的 GitHub Project 不存在，报告未找到。除非用户明确要求创建，否则绝不要新建 Project。
- 如果 Project 存在但没有匹配条目，报告缺少该条目并跳过 Project 更新。除非用户明确要求创建或添加，否则绝不要创建草稿条目、Project 条目或仓库 issue。
- 创建权限只适用于请求中明确指定的资源。例如，要求添加路线图条目只允许创建该条目，不允许新建 Project 或仓库 issue。

## Feature 快速实现

当用户说“feature 快速实现”“快速实现这个功能”“按 Project 里的任务开发”，或给出 Yuxi 功能需求 / GitHub 任务名称并要求开发时，使用本流程。本节的非 `xerrors` 身份限制只适用于 Feature 快速实现，不改变其他 Yuxi 管理流程。

### 1. 按本地贡献说明确认任务

开始前完整读取当前 Yuxi 工作树中的 `AGENTS.md`、`ARCHITECTURE.md`、`CONTRIBUTING.md`、`docs/develop-guides/contributing.md`、`docs/develop-guides/testing-guidelines.md` 和 `.github/PULL_REQUEST_TEMPLATE.md`。以工作树内的最新规则为准，不凭记忆复述远端旧版本。

- 无论用户直接描述需求，还是只给出 GitHub Project 任务名称、Issue 编号或近似标题，都先查询维护者 Project，并检查相关 Issue、PR、验收标准、讨论和分配状态。
- Project 任务必须确认已经分配给当前贡献者。没有匹配条目时报告未找到；除非用户明确要求，否则不要创建 Project 条目或 Issue。
- 开发前写出最小验收标准和简短设计：目标、非目标、实现方式、影响范围、测试计划与风险。改动较大时，按 `AGENTS.md` 在 `docs/vibe` 创建包含日期、需求细节、验收标准、目标和 checklist 的文档。
- 找到匹配 Project 条目后，将状态更新为进行中并记录设计；不要提前标记完成。

### 2. 使用 Fork 和正确的任务分支

先保护工作树中的现有改动，并检查远端关系：

```bash
git status --short --branch
git remote -v
```

- `origin` 必须是当前贡献者自己的 Fork；`upstream` 必须是 `xerrors/Yuxi`。不要自动改写远端配置。
- 禁止把开发分支直接推送到 `upstream`。
- 按贡献说明同步官方 `main`：`git fetch upstream`、`git switch main`、`git merge --ff-only upstream/main`、`git push origin main`。如果工作树不干净、本地 `main` 有独立修改或同步不能快进，停止并保护现有工作，不要覆盖或删除。
- 从同步后的 `main` 创建独立分支。新功能使用 `feat/<topic>`，不是 `feature/<topic>`；其他类型使用贡献说明规定的 `fix/`、`docs/`、`refactor/`、`test/` 或 `chore/`。

```bash
git switch -c feat/<task-slug>
```

### 3. 实现与测试

- 只实现验收标准直接需要的内容，不混入无关重构、格式化或“顺手优化”。修改不熟悉的模块前先用 `ARCHITECTURE.md` 理解边界，再通过代码搜索定位实现。
- 在 Docker Compose 环境中开发和调试。按改动范围执行“检查 → 测试 → Lint”，先跑相关最小测试集，再扩大回归范围。
- Feature 快速实现必须完成一条真实 E2E 用户链路，验证最终业务结果和副作用；不得用 mock、组件测试或单纯的 HTTP `200` 代替。
- 保存实际执行的命令、环境和结果。至少提供一份测试日志或结果截图；UI 修改必须提供最终界面和关键交互截图，适合对比时附修改前 / 修改后截图。
- 截图、日志、测试、文档和回复不得泄露 `.env`、账号、密码、Token、仓库 Secrets 或用户数据。
- E2E 未实际运行或失败时，明确记录阻塞，不得宣称完成，也不得进入提交和 PR 阶段。

### 4. Human Review 门禁

实现和测试完成后，先向用户展示以下审阅材料并停止，等待明确的 Human Review：

- 完整变更范围和关键 diff。
- 详细设计说明与必要取舍。
- 测试命令、真实结果、E2E 场景以及日志或截图。
- 未验证内容、风险、敏感信息检查和文档影响。

本项目不允许 Agent 将未经 Human Review 的代码直接提交 PR。用户必须明确确认已经人工阅读全部改动、检查任务范围和安全风险，并认可测试结果。不要虚构 Review 次数或日志。没有这项确认时，不 commit、不 push、不创建 Draft PR。

这不是对 Agent 创建 PR 的永久禁止。维护者或任务用户授权 Agent 交付 Draft PR 后，只要 Human Review 和身份门禁都已通过，Agent 可以亲自执行 commit、push 和 `gh pr create`，不必再要求人类代为操作，也不必重复请求一次“是否创建 PR”的确认。允许 Agent 创建 PR 不等于允许跳过 Human Review，也不等于允许使用 `xerrors` 身份。

### 5. Feature 快速实现专用身份门禁

Human Review 通过后，在 commit 前检查 commit 身份、GitHub 账号和 Fork：

```bash
gh api user --jq .login
git config --get user.name
git config --get user.email
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
git remote get-url origin
git remote get-url upstream
```

- 如果 GitHub 登录账号、commit author / committer 或 `origin` Fork 所有者是 `xerrors` / 张文杰，停止在 commit 之前，不提交、不推送、不创建 PR。
- 只有用户在当前 Feature 快速实现任务中明确授权使用 `xerrors` / 张文杰身份，才允许越过身份限制；旧授权、仓库默认值或模糊的“继续”不算。
- 不要擅自修改 Git 身份、切换账号、改写 remote 或伪造作者。请用户切换到允许的贡献者账号并配置其 Fork，然后重新检查。
- 创建 PR 前再次检查 `gh` 登录账号和 PR head 仓库，确保来源是获准贡献者的 Fork。

### 6. Commit、Push 和 Draft PR

Human Review 与身份门禁都通过后：

- 只暂存当前任务文件，使用中文 Conventional Commit，例如 `feat: 增加知识图谱导入流程`。
- 将 `feat/<topic>` 推送到个人 Fork 的 `origin`，绝不推送到 `upstream`。
- 从 `<contributor>/Yuxi:feat/<topic>` 向 `xerrors/Yuxi:main` 创建 Draft PR，必须使用 `--draft` 并验证 `isDraft=true`。
- PR 标题直接表达目标，末尾添加 `🤖`。正文严格填写仓库 PR 模板，并包含详细设计、影响范围、实际测试命令与结果、真实 E2E、日志或截图、未验证内容和关联 Issue / Project。
- AI 贡献说明必须如实填写工具名称、实际 Human Review 次数、人工检查内容和 Review 日志；不得写成“没有人工干预”。
- Draft PR 创建后不要自动转为 ready for review，不要由 Agent 直接回复 Review，也不要合并 PR。

```bash
git add <task-files>
git commit -m "feat: <中文功能摘要>"
git push -u origin feat/<task-slug>
gh pr create \
  --repo xerrors/Yuxi \
  --base main \
  --head <contributor>:feat/<task-slug> \
  --title "<功能目标> 🤖" \
  --draft \
  --body-file <completed-pr-template>
gh pr view --repo xerrors/Yuxi --json url,state,isDraft,title,author,headRepositoryOwner,headRefName,baseRefName
```

创建 Draft PR 后，把链接、设计、测试结果和截图同步到匹配的 Project 条目，状态保持进行中。只有 PR 合并、必要测试通过且验收结果已记录后，才把任务标记完成。

## 开发项目管理

当 Agent 在 Yuxi 工作区中工作，或用户要求创建、规划、实现、跟踪、完成、验证或交付 Yuxi 开发任务时，使用开发项目管理。这也包括“帮我开发 Yuxi 的 X”“实现这个 Yuxi 功能”“修一下 Yuxi 的 bug”或“这个任务做完了”等隐式请求。

搜索或更新任务条目前，先获取实时 Project 上下文：

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
gh project view 2 --owner xerrors --format json
gh project field-list 2 --owner xerrors --format json
gh project item-list 2 --owner xerrors --format json --limit 100
```

开始任务时：

- 首先搜索具有相同标题、关联 issue/PR 或近似相同范围的现有 Project 条目。更新现有条目，不要创建重复条目。
- 如果不存在匹配条目，报告已跳过 Project 更新；如果可以，继续执行非 Project 工作。不要仅因为开发开始了就创建条目。
- 只有用户明确要求创建或添加任务条目时，才创建 GitHub Project 草稿条目：

```bash
gh project item-create 2 --owner xerrors --title "<task title>" --body "<task body>" --format json
```

- 对于现有条目或经明确授权创建的条目，在正文中包含问题、预期结果、请求来源，以及相关 issue、PR、文档、截图或本地设计笔记的链接。
- 如果有开发或设计方案，在主要实现开始前将其写入该条目。内容应具体：范围、方法、受影响区域、验证计划和已知风险。
- 如果 Project 有 Status 字段，解析字段 ID 和选项 ID 后，将匹配条目设为适当的进行中状态。

更新进行中的任务时：

- 将 Project 条目作为运营事实来源。把有意义的变化更新到正文中，不要只在聊天中零散记录计划/状态。
- PR 创建后添加其链接。只有当分支或 PR 链接有助于继续工作时才包含它们。
- 如果任务范围发生变化，更新设计方案并注明原因。

完成任务时：

- 如果找不到匹配的现有条目，报告完成元数据未写入 Project。不要事后补建条目。
- 如果 Project 有匹配的 Status 选项，将 Project 条目标记为 done/completed。通过 `gh project field-list` 解析字段 ID 和选项 ID，然后使用 `gh project item-edit`。
- 在 Project 条目正文中添加或更新完成章节，其中包括：按北京时间填写的 `完成日期：YYYY-MM-DD`、`测试结果：...`，以及简洁的实现摘要。
- 如果存在截图，在条目正文中附加或链接截图。优先使用持久的 GitHub issue/PR/comment/asset URL；如果只有本地截图，注明本地路径，并在上传到其他位置前询问用户。
- 测试缺失或失败时，不要将任务标记为完成。应改为在状态和正文中记录阻塞原因、缺少的验证以及下一步行动。

常用编辑模式：

```bash
# 编辑草稿条目的标题/正文。
gh project item-edit --id <item-id> --title "<title>" --body "<updated body>" --format json

# 设置 Project 字段，例如 Status、Completion Date 或 Test Results。
gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --single-select-option-id <option-id>
gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --date "YYYY-MM-DD"
gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --text "<test results>"
```

如果缺少 GitHub Project scope，请用户运行：

```bash
gh auth refresh -h github.com --scopes read:project,project
```

## Star 跟踪

当用户询问 Yuxi Star、Star 增长、每日 Star 报告、GitHub 趋势图或 Hermes 风格图片报告时，使用 Star 跟踪。

运行内置脚本：

```bash
python3 <skill-dir>/scripts/yuxi_stars_report.py
```

脚本会打印文本摘要并写入 `/tmp/yuxi_stars_chart.png`。它还会输出 `IMAGE:/tmp/yuxi_stars_chart.png`，供自动化系统使用该图片标记。

需要图表样式规则、时间戳语义、Hermes 调度说明或 Stargazer 数据收集细节时，读取 `references/star-tracking.md`。

## PR 跟踪

当用户要求查看当前 PR、列出当前 PR、检查某个 PR 是否可以合并、总结 PR 动态或解释近期变更时，使用 PR 跟踪。

生成快速报告时，运行：

```bash
python3 <skill-dir>/scripts/yuxi_pr_report.py current
python3 <skill-dir>/scripts/yuxi_pr_report.py overview
python3 <skill-dir>/scripts/yuxi_pr_report.py pr --number <number>
```

该脚本使用 `gh` 并生成 Markdown 报告。可以安全地将报告直接粘贴到回复中。额外说明应短于报告本身。

如果手动操作，使用以下命令模式：

```bash
gh pr view --repo xerrors/Yuxi --json number,title,url,state,isDraft,headRefName,baseRefName,author,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,latestReviews,comments,commits,reviewRequests,updatedAt
gh pr list --repo xerrors/Yuxi --state open --limit 10 --json number,title,url,author,headRefName,baseRefName,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup,updatedAt
```

对于“current PR”，首先尝试从当前工作树查找与分支关联的 PR。如果当前分支没有 PR，明确说明，然后回退到开放 PR 概览。

对于“最新 PR 动态”，应包含：

- PR 身份：编号、标题、URL，以及 draft/open/closed 状态。
- 评审和检查：人类可读的评审决定与简洁的 CI 状态。列出失败的检查名称，但默认不要打印通过/等待中的数量。
- 近期活动：总共最多列出最新的三个 commit、review 或 comment。
- 新鲜度：使用北京时间表示的 `updatedAt`。
- 下一步行动：简短、具体的说明，例如“处理 requested changes”“修复失败检查”“等待评审”或“看起来可以合并”。

普通 PR 报告中省略作者、分支名、合并状态、原始可合并性、仓库名和报告生成时间，除非这些信息能解释阻塞原因，或用户明确要求。仅在 merge state 构成阻塞时提及，例如存在冲突、分支落后或合并队列被阻塞。

不要夸大合并就绪程度。如果缺少数据，应说明无法读取哪个信号，而不是猜测。

## 路线图更新

当用户要求更新、刷新、同步或维护 Yuxi 路线图时，使用路线图更新；这也包括添加用户自己的条目和从 issue 派生的条目。

解释规则：

- 如果用户说“update roadmap”“更新 roadmap”“同步路线图”或类似表达，但没有明确提到 `roadmap.md`，则更新 GitHub Project，而不是 Markdown 文件。
- 只有当用户明确要求更新 `roadmap.md` 文件、修改公开文档页面，或提供直接的 `roadmap.md` 路径时，才编辑 `docs/develop-guides/roadmap.md`。
- 如果用户同时要求 Project 和 `roadmap.md`，先更新 Project，再对文档做最小的匹配更改。

搜索或更新 Project 前，获取实时上下文：

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
gh project list --owner xerrors --format json --limit 30
gh project item-list 2 --owner xerrors --format json --limit 100
gh issue list --repo xerrors/Yuxi --state open --label roadmap --limit 100 --json number,title,labels,updatedAt,url
gh issue list --repo xerrors/Yuxi --state open --label feat --limit 100 --json number,title,labels,updatedAt,url
```

检查 Project 后：

- 当内容或字段需要变化时，更新匹配的现有路线图条目。
- 如果不存在匹配条目，在 `Skipped` 下列出它，并说明原因是没有找到现有条目。一般性的更新、刷新或同步路线图请求不授权创建条目。
- 只有当用户明确要求创建或添加路线图条目时，才创建 GitHub Project 草稿条目：

```bash
gh project item-create 2 --owner xerrors --title "<item title>" --body "<item body>" --format json
```

如果用户提供路线图条目，将其内容视为匹配和更新的权威依据。只有当请求明确要求添加或创建这些条目时才创建。对于从 issue 派生的条目，优先使用带有 `roadmap` 标签的开放 issue；当用户要求更广泛地从 issue 中提取时，也检查相关的 `feat` issue。除非用户明确选择，或 issue 已经带有路线图信号，否则不要把普通 bug 或 question issue 添加到路线图。

Project 条目规则：

- 当用户明确授权创建时，默认使用草稿条目，除非用户明确要求创建仓库 issue。
- 通过匹配现有 Project 条目标题、issue 编号和近似措辞来避免重复。
- 在已知来源时，在正文中包含 `来源：用户提供`、`来源：GitHub issue` 或 `来源：docs/develop-guides/roadmap.md`。
- 对从 issue 派生的条目，使用 `https://github.com/xerrors/Yuxi/issues/123` 添加 issue 链接。
- 在正文中保留有用分类，例如 `分类：知识库`、`分类：智能体`、`分类：Bugs`，或 `版本：v0.7.1` 等目标版本。
- 将 issue 标题改为简洁的路线图条目标题：去掉 `Feat:`、`Error:`、`Question:` 等前缀，只做足以符合路线图措辞的改写。
- 如果缺少 GitHub Project scope，请用户运行 `gh auth refresh -h github.com --scopes read:project,project`。

只有在明确编辑 `roadmap.md` 时，才使用以下文档规则：

- 修改前读取当前文档：

```bash
gh api repos/xerrors/Yuxi/contents/docs/develop-guides/roadmap.md --jq .content | base64 --decode
```

- 除非用户要求重组，否则保留现有章节和语气：`看板`、`知识库` / `智能体` / `其他` 等分组主题标题、`仅设想` 和 `Bugs`。
- 使用 `([#123](https://github.com/xerrors/Yuxi/issues/123))` 为 issue 派生条目添加来源链接。
- 同时匹配 issue 编号和近似标题以避免重复。
- 保留 `<Badge text="v0.7.1" />` 等现有徽章；只有当用户提供目标版本，或现有路线图上下文能明确判断目标时才添加徽章。
- 将 issue 标题改写为路线图风格的行动项：去掉 `Feat:`、`Error:`、`Question:` 等前缀，只做足以符合路线图措辞的改写。
- 对选入路线图的 bug issue，将其放在 `### Bugs` 下；对功能和体验工作，选择最接近的现有主题分组。
- 编辑后，展示修改过的文件和简洁摘要。如果用户要求提交或推送文档更改，先请求明确确认。

## 回复格式

对于 PR 状态请求，优先使用以下紧凑结构，并将普通报告控制在约 8–10 行：

```markdown
## PR 状态
- PR：#123 标题
- 状态：open / draft / closed
- 评审：approved / changes requested / review required / unknown
- 检查：passing / failing: <check names> / pending / unavailable
- 更新时间：YYYY-MM-DD HH:mm CST

## 最新活动
- commit/review/comment 行，总计最多 3 条

## 下一步行动
...
```

对于 Star 报告，包含文本摘要，并在可能时展示或链接生成的图表。

对于路线图更新，按以下格式总结：

```markdown
## 路线图更新
- Project：https://github.com/users/xerrors/projects/2
- 已添加：...
- 已更新：...
- 已跳过：...（适用时说明原因）
- 来源 issue：#123、#456
```

## 常见陷阱

- GitHub 数据变化很快。对于 latest/current/today 请求，始终重新查询。
- 不带 PR 编号的 `gh pr view` 依赖当前 Git 分支。如果 shell 不在 Yuxi 工作区中，使用带有 `--repo xerrors/Yuxi` 的 `pr list`，或明确指定 PR 编号。
- 匿名 GitHub API 调用有速率限制。尽可能优先使用 `gh`。
- Star 图表按北京时间的自然日边界计算，因此在 24:00 CST 之前，“今天”始终是不完整的一天。
- 没有找到匹配的 Project 或 Project 条目，不代表获得了创建权限。除非用户明确要求创建，否则报告未找到。
- 路线图 issue 的标签并不总是一致。如果用户要求纳入 issue，报告检查了哪些标签筛选器、跳过了哪些 issue，而不是静默猜测。
