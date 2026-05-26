---
name: spdd-workflow
version: 0.1.0
description: >
  SessionStart hook for the SPDD cut. Injects the using-spdd workflow contract
  as additional context so Claude Code sessions follow the
  Structured-Prompt-Driven Development loop from prompt artifact to code and
  back again. Opt out per project with `.agent-config/spdd.disabled`.
type: hook
targets:
  - claude-code
category:
  primary: workflow
  secondary:
    - backpressure
hooks:
  SessionStart:
    matcher: startup|clear|compact
    command: hooks/spdd-workflow-session-start.sh
---

# spdd-workflow hook

Injects `skills/using-spdd/SKILL.md` at `SessionStart` so SPDD-cut Claude Code sessions begin with the prompt-first workflow in context.

## Behavior

- Emits Claude Code `SessionStart` additional context containing the `using-spdd` skill.
- Fails open with no output if the skill file cannot be found.
- Exits silently when `.agent-config/spdd.disabled` exists in the current working directory.
- Never blocks the host session on hook errors.

## Files

- `hooks/spdd-workflow-session-start.sh` — fail-safe SessionStart implementation.

## Bundled with

Included by the `spdd` cut. The `spdd-skills` accessory leaves this hook out on purpose so the skill bundle can be layered onto other cuts without changing startup behavior.
