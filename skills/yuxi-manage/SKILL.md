---
name: yuxi-manage
description: Manage and report on the xerrors/Yuxi GitHub project. Use this skill whenever the user asks about Yuxi stars, GitHub star growth, daily Yuxi reports, the current PR, open PRs, PR review status, CI/check status, merge readiness, latest PR activity, GitHub Project roadmap updates, or what changed recently in the Yuxi repository.
---

# Yuxi Manage

Use this skill to answer operational questions about the `xerrors/Yuxi` GitHub
repository. The skill has two core areas:

- Star tracking: fetch real-time star counts, summarize growth, and generate
  the daily trend chart.
- PR tracking: inspect the current PR or open PRs and report only high-signal
  review, check, recent activity, freshness, and next-action information.
- Roadmap updates: update the maintainer-only GitHub Project roadmap from
  user-provided items and selected GitHub issues by default.

Default to Chinese output unless the user asks for another language. Treat words
like "current", "latest", "today", "now", "recent", "当前", "最新", "今天",
and "动态" as requiring live GitHub data, not memory.

## Defaults

- Default repository: `xerrors/Yuxi`.
- Default roadmap Project owner: `xerrors`.
- Default roadmap Project number: `2`.
- Default roadmap Project URL: `https://github.com/users/xerrors/projects/2`.
- Default roadmap document path: `docs/develop-guides/roadmap.md`.
- Default timezone: Beijing time / CST / UTC+8.
- Prefer authenticated `gh` commands for PR work because they include private
  auth state, current-branch context, review data, and check data.
- Use `curl` with `http://127.0.0.1:7890` as the proxy fallback for GitHub API
  calls when `gh` is unavailable or when the star script is used.
- If the user provides another repo, PR URL, or PR number, follow that explicit
  target instead of the default.

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

Before changing the Project, gather live context:

```bash
gh repo view xerrors/Yuxi --json defaultBranchRef,url
gh project list --owner xerrors --format json --limit 30
gh project item-list 2 --owner xerrors --format json --limit 100
gh issue list --repo xerrors/Yuxi --state open --label roadmap --limit 100 --json number,title,labels,updatedAt,url
gh issue list --repo xerrors/Yuxi --state open --label feat --limit 100 --json number,title,labels,updatedAt,url
```

Create missing roadmap items as GitHub Project draft issues:

```bash
gh project item-create 2 --owner xerrors --title "<item title>" --body "<item body>" --format json
```

If the user provides explicit roadmap items, treat those as authoritative. For
issue-derived items, prefer open issues labeled `roadmap`; also inspect relevant
`feat` issues when the user asks to pull from issues more broadly. Do not add
ordinary bug or question issues to the roadmap unless the user explicitly
selects them or the issue already has a roadmap signal.

Project item rules:

- Use draft items unless the user explicitly asks to create repository issues.
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
- Roadmap issues are not always labeled consistently. If a user asks to include
  issues, report which label filters were checked and which issues were skipped
  instead of silently guessing.
