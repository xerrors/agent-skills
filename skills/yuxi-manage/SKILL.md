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
- 调研任务：新增 Project Item 或用户明确要求调研时，逐项完成深入调研，将报告、日期、单一组合标签（含 `已调研` 和 1–5 星可行性）回写到 GitHub。
- Feature 快速实现：根据用户需求或 GitHub Project 任务，从贡献指南、任务检索、功能分支、实现和真实 E2E 测试一路推进到 Draft PR，并执行仅限此流程的非 `xerrors` 提交身份门禁。

除非用户要求使用其他语言，否则默认输出中文。将“current”“latest”“today”“now”“recent”“当前”“最新”“今天”和“动态”等词视为必须读取实时 GitHub 数据，而不是依赖记忆。

## 默认值

- 默认仓库：`xerrors/Yuxi`。
- 默认贡献者 Fork：`Yuchuan925/Yuxi`（本地 `origin`）。
- 默认 PR 创建目标仓库：`Yuchuan925/Yuxi`，目标分支为 `main`。用户只说“创建 PR”或“开 PR”而未明确指定目标仓库、目标 owner 或“主仓库”时，按此默认值执行。
- 如果用户明确指定 `xerrors/Yuxi`、主仓库或其他目标仓库，严格使用用户指定的 PR 目标，不套用上述默认值。
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
- 用户明确要求“新增/创建/添加任务”，或明确提出调研、可行性分析、方案评估时，如果没有匹配条目，必须自动创建一个 Project 草稿 Item 并执行“调研任务”流程；这项授权不包含自动创建仓库 Issue。
- 创建权限只适用于请求中明确指定的资源。例如，要求添加路线图条目只允许创建该条目，不允许新建 Project 或仓库 issue。

## 调研任务

以下任一情况都触发调研任务流程：用户要求新增、创建或添加任务；用户明确要求调研、可行性分析或方案评估；或本流程即将新建任何 Project Item（包括明确授权新增的路线图条目）。每个任务都必须单独调研，不得用泛化结论代替逐项分析。

### 1. 创建或匹配 Project Item

- 先获取实时 Project、字段、条目，以及关联的 Issue、PR 和讨论，按标题、Issue/PR 编号和近似范围去重。
- 没有匹配条目时，创建 Project 草稿 Item，初始标题使用原始任务标题，正文标记 `调研状态：进行中`；不要为了获得标签而自动创建仓库 Issue。
- 有匹配条目时直接更新该条目，不创建重复项。普通“开始开发”且未明确新增或调研时，继续遵守“不匹配则跳过创建”的边界。

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
gh project view 2 --owner xerrors --format json
gh project field-list 2 --owner xerrors --format json
gh project item-list 2 --owner xerrors --format json --limit 100
gh project item-create 2 --owner xerrors --title "<原始任务标题>" --body "调研状态：进行中" --format json
```

### 2. 深入调研与报告内容

- 至少检查 Yuxi 当前代码、架构和贡献说明、相关 Issue/PR/Project 讨论、近期提交与依赖约束；需要外部资料时优先使用官方或一手来源，并记录 URL、访问日期和适用版本。
- 报告必须基于证据，明确区分事实、推断和待验证假设；不能只写“可行/不可行”或复述任务标题。
- 报告至少包含：问题与目标、范围与非目标、现状证据、候选方案及取舍、实现路径与受影响区域、依赖/成本/工作量、风险与未知项、验证计划、结论和资料来源。
- 给出 1–5 星可行性评级：`🌟` 表示当前约束下难以落地，`🌟🌟` 表示高风险，`🌟🌟🌟` 表示有条件可行，`🌟🌟🌟🌟` 表示可行且风险可控，`🌟🌟🌟🌟🌟` 表示证据充分、低风险且适合推进。报告中同时写明数值，例如 `可行性：🌟🌟🌟🌟（4/5）`。

建议使用以下结构，并将完整内容写回 GitHub：

```markdown
## 调研报告
- 调研日期：YYYY-MM-DD CST
- 调研范围：...
- 结论：可行 / 有条件可行 / 暂不可行
- 可行性：🌟🌟🌟🌟（4/5）

### 问题与目标
### 现状与证据
### 方案比较与推荐
### 实现路径、成本与依赖
### 风险、未知项与验证计划
### 资料来源
```

### 3. 回写 GitHub、日期和标签

- 调研完成后，把 `## 调研报告` 追加或合并到 Project Item 正文；保留原始需求、来源和已有有价值的记录，不要无提示覆盖用户内容。关联 Issue 或 PR 时，也将报告同步到其正文。
- 只有完整报告和可行性评级写回成功后，才按北京时间将标题中已有的 `[MM-DD]` 日期前缀替换为当天日期，并设置为精确格式 `[MM-DD]标题`。调研未完成或资料不足时，不得伪造完成日期。
- 标签按当前 GitHub 任务约束作为单一字段维护：先读取原有标签，在原标签上更新，不创建第二个标签。保留原有业务标签，并把调研状态和可行性追加到同一个值中，例如 `知识库 · 已调研 · 可行性🌟🌟🌟🌟`；多个标签一律使用带空格的 ` · ` 分隔。已有的 `已调研` 或旧可行性片段要原地替换，不能重复追加。

```bash
# 读取原标签后，在原标签字段上写回一个组合值；不要新增独立 label。
# 例如：知识库  ->  知识库 · 已调研 · 可行性🌟🌟🌟
gh project item-edit --id <item-id> --title "[MM-DD]<标题>" --body "<报告>\n\n标签：知识库 · 已调研 · 可行性🌟🌟🌟" --format json
```

- `gh project item-edit` 当前只能直接编辑 Draft Item 的标题和正文，不能假定 Draft Item 存在可写的 Issue labels 字段。对 Draft Item，必须在正文保留单一组合值 `标签：原标签 · 已调研 · 可行性🌟...`；如果实时 Project 暴露了可编辑的 Labels 字段，也只写入这一项组合值。不要仅为添加标签而创建 Issue。
- 如果 GitHub 不接受包含 emoji 的标签值，只替换可行性片段为 `可行性-1` 到 `可行性-5`，例如 `知识库 · 已调研 · 可行性-3`，并在报告和 Item 正文中同时保留对应的 `🌟🌟🌟` 说明；仍然只维护一个组合标签。
- 汇报时给出 Project Item URL、调研报告位置、最终标题、实际组合标签和可行性评级。若调研被阻塞，写明缺失证据和下一步，不添加 `已调研` 标签。

## Feature 快速实现

当用户说“feature 快速实现”“快速实现这个功能”“按 Project 里的任务开发”，或给出 Yuxi 功能需求 / GitHub 任务名称并要求开发时，使用本流程。本节的非 `xerrors` 身份限制只适用于 Feature 快速实现，不改变其他 Yuxi 管理流程。

### 1. 按本地贡献说明确认任务

开始前完整读取当前 Yuxi 工作树中的 `AGENTS.md`、`ARCHITECTURE.md`、`CONTRIBUTING.md`、`docs/develop-guides/contributing.md`、`docs/develop-guides/testing-guidelines.md` 和 `.github/PULL_REQUEST_TEMPLATE.md`。以工作树内的最新规则为准，不凭记忆复述远端旧版本。

- 无论用户直接描述需求，还是只给出 GitHub Project 任务名称、Issue 编号或近似标题，都先查询维护者 Project，并检查相关 Issue、PR、验收标准、讨论和分配状态。
- Project 任务必须确认已经分配给当前贡献者。没有匹配条目时报告未找到；除非用户明确要求创建、请求新增任务，或命中“调研任务”自动创建规则，否则不要创建 Project 条目或 Issue。新建 Item 可以先完成调研，但实际开发仍需通过分配检查。
- 开发前写出最小验收标准和简短设计：目标、非目标、实现方式、影响范围、测试计划与风险。改动较大时，按 `AGENTS.md` 在 `docs/vibe` 创建包含日期、需求细节、验收标准、目标和 checklist 的文档。
- 找到匹配 Project 条目后，将状态更新为进行中并记录设计；不要提前标记完成。

### 2. 使用 Fork 和正确的任务分支

先保护工作树中的现有改动，并检查远端关系：

```bash
git status --short --branch
git remote -v
```

- 在默认的 Yuchuan925 工作区中，`origin` 必须指向 `Yuchuan925/Yuxi`，`upstream` 必须指向 `xerrors/Yuxi`。其他贡献者执行时，`origin` 可以是其本人 Fork，但不得自动改写远端配置。
- 禁止把开发分支直接推送到 `upstream`。
- 拉取或使用最新 `main` 前，必须让 `Yuchuan925/Yuxi:main` 和 `xerrors/Yuxi:main` 保持同步。不要使用不带远端名的 `git pull`，以免只拉取 Fork：

```bash
git status --short --branch
git remote get-url origin
git remote get-url upstream
git fetch --prune origin main
git fetch --prune upstream main
git switch main
git merge --ff-only upstream/main
git push origin main:main
git fetch --prune origin main
test "$(git rev-parse refs/remotes/origin/main)" = "$(git rev-parse refs/remotes/upstream/main)"
test "$(git rev-parse HEAD)" = "$(git rev-parse refs/remotes/upstream/main)"
```

  `upstream/main` 是 `xerrors/Yuxi:main` 的最新状态，`origin/main` 是 `Yuchuan925/Yuxi:main` 的同步目标；最后两个校验必须通过。若工作树不干净、本地 `main` 有独立修改、远端分支发生分叉、快进合并/推送失败或哈希校验不一致，立即停止并保护现有工作，不要 reset、rebase、覆盖或强制推送。
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

### 4. PR 标题与正文确认门禁

Agent 可以在任务范围和用户授权内完成 commit、push 和创建 PR，不因使用 Agent 而强制要求先完成 Human Review。实现和测试完成后，向用户展示以下审阅材料，再准备创建 PR：

- 完整变更范围和关键 diff。
- 详细设计说明与必要取舍。
- 测试命令、真实结果、E2E 场景以及日志或截图。
- 未验证内容、风险、敏感信息检查和文档影响。

即使用户要求“直接提交 PR”或已授权交付，Agent 在调用 PR 创建命令前仍必须先展示拟提交的 PR 标题和完整正文，等待用户明确确认。用户确认的是标题和正文，不替代测试、敏感信息检查、Fork/远程目标检查和 CI 结果记录；这些仍是 Agent 提交前的必做检查。没有明确确认时，不 commit、不 push、不创建 PR；不要虚构 Review 次数或日志。

“继续”“可以”之外的上下文不能被默认为确认，需能明确对应当前标题和正文。允许 Agent 创建 PR 不等于允许跳过上述确认门禁，也不等于允许使用 `xerrors` 身份。

### 5. Feature 快速实现专用身份门禁

实现和测试完成、PR 标题与正文确认门禁通过后，在 commit 前检查 commit 身份、GitHub 账号和 Fork：

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

身份门禁与 PR 标题/正文确认门禁都通过后：

- 只暂存当前任务文件，使用中文 Conventional Commit，例如 `feat: 增加知识图谱导入流程`。
- 将 `feat/<topic>` 推送到个人 Fork 的 `origin`，绝不推送到 `upstream`。
- 默认从 `<contributor>/Yuxi:feat/<topic>` 向 `Yuchuan925/Yuxi:main` 创建 Draft PR，必须使用 `--draft` 并验证 `isDraft=true`。只有用户明确指定 `xerrors/Yuxi`、主仓库或其他目标仓库时，才把 PR base 改为该目标。
- PR 标题直接表达目标，不加 `🤖`。正文严格填写仓库 PR 模板，并包含详细设计、影响范围、实际测试命令与结果、真实 E2E、日志或截图、未验证内容和关联 Issue / Project；不写 AI/Agent 贡献说明或人工 Review 次数。
- 创建命令执行前先向用户展示拟提交的 PR 标题和完整正文，等待明确确认。
- Draft PR 创建后不要自动转为 ready for review，不要由 Agent 直接回复 Review，也不要合并 PR。

```bash
git add <task-files>
git commit -m "feat: <中文功能摘要>"
git push -u origin feat/<task-slug>
gh pr create \
  --repo <pr-target-repo> \
  --base main \
  --head <contributor>:feat/<task-slug> \
  --title "<功能目标>" \
  --draft \
  --body-file <completed-pr-template>
gh pr view --repo <pr-target-repo> --json url,state,isDraft,title,author,headRepositoryOwner,headRefName,baseRefName
```

其中 `<pr-target-repo>` 默认为 `Yuchuan925/Yuxi`；如果用户明确要求向主仓库或 `xerrors/Yuxi` 创建 PR，则替换为用户指定的目标仓库。

创建 Draft PR 后，把链接、设计、测试结果和截图同步到匹配的 Project 条目。若任务开始时位于 `Todo`，严格执行下文“Todo 模型任务进入 PR 审查”规则：状态改为 `In Progress`，标签改为 `待审查`，不得标记完成。只有 PR 合并、必要测试通过且验收结果已记录后，才把任务标记完成。

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
- 如果不存在匹配条目，普通开发启动仍报告已跳过 Project 更新；如果请求属于“新增任务”或“调研任务”触发器，必须创建草稿 Item 并先完成调研，不得跳过。
- 只有用户明确要求创建或添加任务条目，或命中“调研任务”自动创建规则时，才创建 GitHub Project 草稿条目：

```bash
gh project item-create 2 --owner xerrors --title "<task title>" --body "<task body>" --format json
```

- 对于现有条目或经明确授权创建的条目，在正文中包含问题、预期结果、请求来源，以及相关 issue、PR、文档、截图或本地设计笔记的链接。
- 如果有开发或设计方案，在主要实现开始前将其写入该条目。内容应具体：范围、方法、受影响区域、验证计划和已知风险。
- 如果 Project 有 Status 字段，解析字段 ID 和选项 ID 后，将匹配条目设为适当的进行中状态。

更新进行中的任务时：

- 将 Project 条目作为运营事实来源。把有意义的变化更新到正文中，不要只在聊天中零散记录计划/状态。
- 新建的路线图条目也属于新建 Project Item，必须在调研完成后回写报告、`[MM-DD]` 标题和包含 `已调研` 与可行性评级的单一组合标签。
- PR 创建后添加其链接。只有当分支或 PR 链接有助于继续工作时才包含它们。
- 如果任务范围发生变化，更新设计方案并注明原因。

### Todo 模型任务进入 PR 审查

当 Agent / 模型接手任务时，必须记住从实时 Project 读取到的初始 Status。若初始 Status 是 `Todo`，则该任务在创建或发现对应 PR 后进入审查阶段，以下规则优先于通用“完成任务”规则：

- 即使代码、测试、commit、push 和 PR 都已完成，也不得把 Project Status 直接改为 `Done`。把 Status 从 `Todo` 更新为 `In Progress`；如果已经是 `In Progress`，保持不变。
- 将 Project 的 `Tags` 单选字段更新为精确值 `待审查`，表示等待维护者审查。先通过 `gh project field-list` 解析实时字段 ID 和选项 ID，不按记忆硬编码。
- 如果实时 `Tags` 字段中没有 `待审查` 选项，不得擅自创建 Project 字段选项、改用 `已完成` 或其他近似标签，也不得因此标记 `Done`。保持 `In Progress`，在条目正文写明 `审查状态：待审查`，并向用户报告需要维护者在 Project 中配置 `待审查` 选项。
- 在条目正文新增或更新单一的 `## PR 与审查` 章节，至少包含 `PR：<完整 URL>` 和 `审查状态：待审查`；保留已有需求、设计、测试、截图和调研记录，不重复追加同一 PR 链接。
- PR 为 Draft、Open、已请求 Review 或 CI 已通过都仍属于审查阶段。只有 PR 已合并，并且必要测试与验收结果已记录，才允许进入下面的完成流程；PR 关闭但未合并时不得标记完成，应记录原因和下一步。

常用更新模式：

```bash
# Status: Todo -> In Progress
gh project item-edit --id <item-id> --project-id <project-id> \
  --field-id <status-field-id> --single-select-option-id <in-progress-option-id>

# Tags: -> 待审查（仅当实时字段中存在该选项）
gh project item-edit --id <item-id> --project-id <project-id> \
  --field-id <tags-field-id> --single-select-option-id <待审查-option-id>
```

完成任务时：

- 如果找不到匹配的现有条目，报告完成元数据未写入 Project。不要事后补建条目。
- 先检查是否命中“Todo 模型任务进入 PR 审查”规则。若对应 PR 尚未合并，停止完成转换，保持 `In Progress` 和 `待审查`，确保正文含 PR 链接。
- 不受上述审查门禁阻止、且完成条件全部满足时，如果 Project 有匹配的 Status 选项，将 Project 条目标记为 done/completed。通过 `gh project field-list` 解析字段 ID 和选项 ID，然后使用 `gh project item-edit`。
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
