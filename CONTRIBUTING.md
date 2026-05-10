# Contributing

## Add a Skill

Create one folder per skill under `skills/`:

```text
skills/<skill-name>/
└── SKILL.md
```

Use lowercase letters, digits, and hyphens for skill names.

## Required `SKILL.md` Format

```markdown
---
name: skill-name
description: Use when the user wants ... Include the trigger context and what the skill helps the agent do.
---

# Skill Name

Follow this workflow:
1. ...
2. ...
3. ...
```

The description is the main trigger surface for agents, so make it specific
about when the skill should be used.

## Optional Resources

Use these folders only when needed:

- `scripts/`: deterministic helpers or repeated operations
- `references/`: longer docs loaded only when relevant
- `assets/`: templates, images, examples, or files used in outputs
- `agents/openai.yaml`: Codex UI metadata for display name and default prompt

Keep `SKILL.md` focused. Move bulky details into `references/` and point to
them from the skill body.

## Before Publishing Changes

Check that skills are discoverable:

```bash
npx --yes skills add . --list
```

Install locally for a quick smoke test:

```bash
npx --yes skills add . -a codex --skill <skill-name> -g -y
```
