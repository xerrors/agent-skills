# Agent Skills

Private skill repository for reusable agent workflows.

Skills live under `skills/<skill-name>/` and each skill must include a
`SKILL.md` file.

## Repository Layout

```text
agent-skills/
├── skills/
│   ├── product-launch-card-kit/
│   │   └── SKILL.md
│   ├── skill-manager/
│   │   └── SKILL.md
│   ├── xerrors-design/
│   │   ├── SKILL.md
│   │   └── agents/
│   │       └── openai.yaml
│   └── yuxi-manage/
│       └── SKILL.md
├── CONTRIBUTING.md
└── README.md
```

Only `SKILL.md` is required for a skill. The other folders are optional and
should be added only when they help the skill stay concise and reusable.

## Install Skills

List available skills:

```bash
npx --yes skills add xerrors/agent-skills --list
```

Install all skills for Codex globally:

```bash
npx --yes skills add xerrors/agent-skills -a codex --all -g
```

Install one skill:

```bash
npx --yes skills add xerrors/agent-skills -a codex --skill <skill-name> -g -y
```

Update installed skills:

```bash
npx --yes skills update -g
```

## Local Development

From a local checkout, list available skills:

```bash
npx --yes skills add . --list
```

Install a local skill while developing:

```bash
npx --yes skills add . -a codex --skill <skill-name> -g -y
```

Restart Codex after installing or updating skills.

## Current Skills

- `product-launch-card-kit`: create a publish-ready social launch workbench
  for apps, open-source projects, agent skills, plugins, and developer tools,
  including screenshot-ready cards, PNG export/download, titles, body copy, and
  tags.
- `skill-manager`: manage the local agent-skills repository and install, link,
  sync, and update its skills into Agents, Codex, and Claude Code skill
  directories.
- `xerrors-design`: Xerrors design preference router for UI/UX and frontend
  work; routes interface tasks to `ui-ux-pro-max-skill` or a taste-skill and
  records Xerrors' default taste and density preferences.
- `yuxi-manage`: manage the `xerrors/Yuxi` xhome project and roadmap, create
  PRs with delivery gates, and report star growth, PR approval/CI signals, and
  repository activity; it deliberately excludes specs, implementation, test
  design, and code-review workflows.
