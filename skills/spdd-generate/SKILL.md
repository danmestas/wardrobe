---
name: spdd-generate
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use when implementing code from an approved SPDD REASONS Canvas, following Operations in order and staying inside the canvas Norms and Safeguards.
category:
  primary: workflow
  secondary: [context-management]
---

# SPDD Generate

Translate an approved REASONS Canvas into code and tests without improvising outside the prompt/spec.

**Announce at start:** "I'm using the spdd-generate skill to implement strictly from the approved REASONS Canvas."

## Preconditions

- `spdd-alignment`, `spdd-analysis`, and `spdd-reasons-canvas` artifacts exist or are included in the prompt.
- The canvas has passed `spdd-abstraction-first` review.
- Operations, Norms, and Safeguards are specific enough to execute.

If any precondition fails, stop and repair the prompt artifact before editing code.

## Execution rules

1. Implement Operations in canvas order unless repository dependencies force a narrower order; record any deviation in the artifact.
2. Modify only files required by Requirements and Operations.
3. Preserve existing behavior not explicitly changed by the canvas.
4. Add or update tests where the canvas says behavior must be proven.
5. If implementation reveals a behavior/design mismatch, do not patch around it. Use `spdd-prompt-update` first.
6. If implementation requires a harmless internal refactor, do it in a small step and later run `spdd-sync`.

## Verification sequence

- Run the smallest command that proves each operation's behavior.
- For API or system-boundary changes, use `spdd-api-test` or an equivalent executable scenario.
- After behavior passes, run `spdd-iterative-review` for prompt/code consistency and maintainability.

## Output

Report:

- Canvas file/version used.
- Operations completed.
- Tests or scenarios run.
- Any prompt updates or sync needed.
