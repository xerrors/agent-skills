---
name: yuxi-manage
description: Manage development work and reporting for the xerrors/Yuxi GitHub project. Use this skill whenever working inside the Yuxi project, starting or finishing a Yuxi development task, updating the Yuxi GitHub Project, or asking about Yuxi stars, PRs, CI, reviews, roadmap, or recent repository activity.
---

# Yuxi Manage

Use this skill to answer operational questions about the `xerrors/Yuxi` GitHub
repository and its maintainer GitHub Project. The skill has four core areas:

- Star tracking: fetch real-time star counts, summarize growth, and generate
  the daily trend chart.
- PR tracking: inspect the current PR or open PRs and report only high-signal
  review, check, recent activity, freshness, and next-action information.
- Roadmap updates: update matching items in the maintainer-only GitHub Project
  roadmap, and add items only when the user explicitly requests creation.
- Development project management: when starting, planning, or completing Yuxi
  development work, keep a matching existing GitHub Project item current with
  the task, design plan, status, completion date, test results, and screenshots.

Default to Chinese output unless the user asks for another language. Treat words
like "current", "latest", "today", "now", "recent", "当前", "最新", "今天",
and "动态" as requiring live GitHub data, not memory.

## Defaults

- Default repository: `xerrors/Yuxi`.
- Default roadmap Project owner: `xerrors`.
- Default roadmap Project number: `2`.
- Default roadmap Project URL: `https://github.com/users/xerrors/projects/2`.
- Default roadmap document path: `docs/develop-guides/roadmap.md`.
- Default development project: the same maintainer GitHub Project unless the
  user provides a different Project URL or number.
- Default timezone: Beijing time / CST / UTC+8.
- Prefer authenticated `gh` commands for PR work because they include private
  auth state, current-branch context, review data, and check data.
- Use `curl` with `http://127.0.0.1:7890` as the proxy fallback for GitHub API
  calls when `gh` is unavailable or when the star script is used.
- If the user provides another repo, PR URL, or PR number, follow that explicit
  target instead of the default.

## GitHub Project Creation Boundary

- Inspecting a Project or asking to plan, start, track, update, sync, finish, or
  report work authorizes reading and updating matching existing resources only.
- If the requested GitHub Project does not exist, report that it was not found.
  Never create a new Project unless the user explicitly asks to create one.
- If the Project exists but no matching item exists, report the missing item and
  skip the Project update. Never create a draft item, Project item, or repository
  issue unless the user explicitly asks to create or add that item.
- Creation permission is specific to the requested resource. For example, a
  request to add a roadmap item permits creating that item, not a new Project or
  a repository issue.

## Development Project Management

Use development project management whenever the agent is working in a Yuxi
checkout or the user asks to create, plan, implement, track, finish, verify, or
ship a Yuxi development task. This includes implicit requests such as "帮我开发
Yuxi 的 X", "实现这个 Yuxi 功能", "修一下 Yuxi 的 bug", or "这个任务做完了".

Before searching for or updating task items, gather live Project context:

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
gh project view 2 --owner xerrors --format json
gh project field-list 2 --owner xerrors --format json
gh project item-list 2 --owner xerrors --format json --limit 100
```

When starting a task:

- First search existing Project items for the same title, linked issue/PR, or
  near-identical scope. Update the existing item instead of creating a duplicate.
- If no matching item exists, report that the Project update was skipped and
  continue the non-Project work when possible. Do not create an item merely
  because development is starting.
- Only when the user explicitly asks to create or add a task item, create a
  GitHub Project draft item:

```bash
gh project item-create 2 --owner xerrors --title "<task title>" --body "<task body>" --format json
```

- For an existing or explicitly created item, include the problem, intended
  outcome, source request, and links to related issues, PRs, docs, screenshots,
  or local design notes in the body.
- If there is a development or design plan, write it into that item before major
  implementation begins. Keep it concrete: scope, approach, affected areas,
  verification plan, and known risks.
- If the Project has a Status field, set the matching item to the appropriate
  in-progress state after resolving field and option IDs.

When updating an active task:

- Keep the Project item as the source of operational truth. Add meaningful
  changes to the body instead of scattering plan/status only in chat.
- Link the PR once one exists. Include branch or PR links only when they help
  continue the work.
- If the task changes scope, update the design plan and note the reason.

When completing a task:

- If no matching existing item can be found, report that completion metadata was
  not written to the Project. Do not create an item retroactively.
- Mark the Project item as done/completed if the Project has a matching Status
  option. Resolve field and option IDs from `gh project field-list`, then use
  `gh project item-edit`.
- Add or update a completion section in the Project item body with:
  `完成日期：YYYY-MM-DD` using Beijing date, `测试结果：...`, and a concise
  implementation summary.
- If screenshots exist, attach or link them in the item body. Prefer durable
  GitHub issue/PR/comment/asset URLs; if only local screenshots exist, mention
  the local path and ask before uploading elsewhere.
- Do not mark a task complete when tests are missing or failing. Instead update
  status and body with the blocker, missing verification, and next action.

Useful edit patterns:

```bash
# Edit a draft item's title/body.
gh project item-edit --id <item-id> --title "<title>" --body "<updated body>" --format json

# Set a Project field such as Status, Completion Date, or Test Results.
gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --single-select-option-id <option-id>
gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --date "YYYY-MM-DD"
gh project item-edit --id <item-id> --project-id <project-id> --field-id <field-id> --text "<test results>"
```

If GitHub Project scopes are missing, ask the user to run:

```bash
gh auth refresh -h github.com --scopes read:project,project
```

## Star Tracking

Use star tracking when the user asks about Yuxi stars, star growth, a daily star
report, GitHub trend chart, or the Hermes-style image report.

Run the bundled script:

```bash
python3 <skill-dir>/scripts/yuxi_stars_report.py
```

The script prints a text summary and writes `/tmp/yuxi_stars_chart.png`. It also
prints `IMAGE:/tmp/yuxi_stars_chart.png` for automation systems that consume the
image marker.

Read `references/star-tracking.md` when you need chart styling rules, timestamp
semantics, Hermes scheduling notes, or the details of how stargazer data is
collected.

## PR Tracking

Use PR tracking when the user asks to view the current PR, list current PRs,
inspect whether a PR is ready to merge, summarize PR dynamics, or explain what
changed recently.

For quick reports, run:

```bash
python3 <skill-dir>/scripts/yuxi_pr_report.py current
python3 <skill-dir>/scripts/yuxi_pr_report.py overview
python3 <skill-dir>/scripts/yuxi_pr_report.py pr --number <number>
```

The script uses `gh` and produces a Markdown report. It is safe to paste the
report directly into the response. Keep any extra commentary shorter than the
report itself.

If working manually, use these command patterns:

```bash
gh pr view --repo xerrors/Yuxi --json number,title,url,state,isDraft,headRefName,baseRefName,author,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,latestReviews,comments,commits,reviewRequests,updatedAt
gh pr list --repo xerrors/Yuxi --state open --limit 10 --json number,title,url,author,headRefName,baseRefName,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup,updatedAt
```

For "current PR", first try the branch-associated PR from the current working
tree. If no branch PR exists, clearly say so and fall back to the open PR
overview.

For "latest PR dynamics", include:

- PR identity: number, title, URL, and draft/open/closed state.
- Review and checks: human-readable review decision and concise CI state. Name
  failing checks, but do not print pass/pending counts by default.
- Recent activity: at most three newest commits, reviews, or comments total.
- Freshness: `updatedAt` in Beijing time.
- Next action: a short, concrete statement such as "address requested changes",
  "fix failing check", "waiting for review", or "looks merge-ready".

Omit author, branch names, merge state, raw mergeability, repo name, and report
generation time from ordinary PR reports unless they explain a blocker or the
user explicitly asks for that detail. Mention merge state only when it is
blocking, such as conflicts, behind branch, or blocked merge queue state.

Do not overstate merge readiness. If data is missing, say which signal could not
be read instead of guessing.

## Roadmap Updates

Use roadmap updates when the user asks to update, refresh, sync, or maintain the
Yuxi roadmap, including requests to add the user's own items and items derived
from issues.

Interpretation rule:

- If the user says "update roadmap", "更新 roadmap", "同步路线图", or similar
  without explicitly naming `roadmap.md`, update the GitHub Project, not the
  Markdown file.
- Edit `docs/develop-guides/roadmap.md` only when the user explicitly says to
  update that file, asks to change the public docs page, or provides a direct
  `roadmap.md` path.
- If both Project and `roadmap.md` are requested, update the Project first, then
  make the smallest matching document change.

Before searching or updating the Project, gather live context:

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
gh project list --owner xerrors --format json --limit 30
gh project item-list 2 --owner xerrors --format json --limit 100
gh issue list --repo xerrors/Yuxi --state open --label roadmap --limit 100 --json number,title,labels,updatedAt,url
gh issue list --repo xerrors/Yuxi --state open --label feat --limit 100 --json number,title,labels,updatedAt,url
```

After inspecting the Project:

- Update matching existing roadmap items when their content or fields need to
  change.
- If no matching item exists, include it under `Skipped` with the reason that no
  existing item was found. A general request to update, refresh, or sync the
  roadmap does not authorize creation.
- Only when the user explicitly asks to create or add the roadmap item, create a
  GitHub Project draft item:

```bash
gh project item-create 2 --owner xerrors --title "<item title>" --body "<item body>" --format json
```

If the user provides roadmap items, treat their content as authoritative for
matching and updates. Create them only when the request explicitly asks to add
or create those items. For issue-derived items, prefer open issues labeled
`roadmap`; also inspect relevant `feat` issues when the user asks to pull from
issues more broadly. Do not add ordinary bug or question issues to the roadmap
unless the user explicitly selects them or the issue already has a roadmap
signal.

Project item rules:

- When creation is explicitly authorized, use draft items unless the user
  explicitly asks to create repository issues.
- Avoid duplicates by matching existing Project item titles, issue numbers, and
  near-identical wording.
- Include `来源：用户提供`, `来源：GitHub issue`, or
  `来源：docs/develop-guides/roadmap.md` in the body when known.
- Add issue links for issue-derived items using
  `https://github.com/xerrors/Yuxi/issues/123`.
- Preserve useful classification in the body, such as `分类：知识库`,
  `分类：智能体`, `分类：Bugs`, or target versions like `版本：v0.7.1`.
- Convert issue titles into concise roadmap item titles by removing prefixes
  like `Feat:`, `Error:`, and `Question:` and rewriting only enough to fit the
  roadmap's wording.
- If GitHub Project scopes are missing, ask the user to run
  `gh auth refresh -h github.com --scopes read:project,project`.

Only when explicitly editing `roadmap.md`, use these document rules:

- Read the current document before changing it:

```bash
gh api repos/xerrors/Yuxi/contents/docs/develop-guides/roadmap.md --jq .content | base64 --decode
```

- Keep the existing sections and tone unless the user asks to reorganize them:
  `看板`, grouped topic headings such as `知识库` / `智能体` / `其他`, `仅设想`,
  and `Bugs`.
- Add source links for issue-derived items using
  `([#123](https://github.com/xerrors/Yuxi/issues/123))`.
- Avoid duplicates by matching both issue number and near-identical titles.
- Preserve existing badges such as `<Badge text="v0.7.1" />`; add badges only
  when the user provides a target version or the existing roadmap context makes
  the target unambiguous.
- Convert issue titles into roadmap-style action items by removing prefixes like
  `Feat:`, `Error:`, and `Question:` and rewriting only enough to fit the
  roadmap's wording.
- For bug issues selected for the roadmap, place them under `### Bugs`; for
  feature and experience work, choose the closest existing topic group.
- After editing, show the changed files and a concise summary. If asked to
  commit or push document changes, ask for explicit confirmation first.

## Response Shape

For a PR status request, prefer this compact structure and keep ordinary reports
around 8-10 lines:

```markdown
## PR Status
- PR: #123 Title
- State: open / draft / closed
- Review: approved / changes requested / review required / unknown
- Checks: passing / failing: <check names> / pending / unavailable
- Updated: YYYY-MM-DD HH:mm CST

## Latest Activity
- Commit/review/comment line, max 3 total

## Next Action
...
```

For a star report, include the text summary and show or link the generated chart
when possible.

For a roadmap update, summarize:

```markdown
## Roadmap Update
- Project: https://github.com/users/xerrors/projects/2
- Added: ...
- Updated: ...
- Skipped: ... (with reason, when relevant)
- Source issues: #123, #456
```

## Pitfalls

- GitHub data changes quickly. Always re-query for latest/current/today requests.
- `gh pr view` without a PR number depends on the current git branch. If the
  shell is not inside a Yuxi checkout, use `--repo xerrors/Yuxi` with `pr list`
  or an explicit PR number.
- Anonymous GitHub API calls are rate-limited. Prefer `gh` when possible.
- The star chart uses Beijing-day cutoffs, so "today" is a partial day until
  24:00 CST.
- Finding no matching Project or Project item is not permission to create one.
  Report the miss unless the user explicitly requested creation.
- Roadmap issues are not always labeled consistently. If a user asks to include
  issues, report which label filters were checked and which issues were skipped
  instead of silently guessing.
