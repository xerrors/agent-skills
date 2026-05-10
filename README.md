# Agent Skills

Private skill repository for reusable agent workflows.

This repository is intentionally empty for now. Future skills should live under
`skills/<skill-name>/` and each skill must include a `SKILL.md` file.

## Repository Layout

```text
agent-skills/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       ├── scripts/
│       ├── references/
│       ├── assets/
│       └── agents/
│           └── openai.yaml
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
