---
name: spdd-prompt-update
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use in SPDD when requirements, behavior, acceptance criteria, business rules, or safeguards change; update the REASONS Canvas before changing code.
category:
  primary: workflow
  secondary: [backpressure]
---

# SPDD Prompt Update

For behavior changes, update the prompt/spec first. Code follows the corrected intent.

**Announce at start:** "I'm using the spdd-prompt-update skill to update the REASONS Canvas before changing code."

## Use when

- A requirement changes.
- Acceptance criteria are wrong, incomplete, or newly discovered.
- A bug fix changes observable behavior.
- A data contract, validation rule, pricing rule, permission rule, or safeguard changes.
- Generated code exposed a design gap in the canvas.

Do not use this for pure refactors; use `spdd-sync` after the refactor instead.

## Update discipline

1. Identify the exact outdated canvas sections.
2. Modify only affected REASONS dimensions.
3. Preserve unrelated decisions and Operations.
4. Add the reason for the update and the evidence that forced it.
5. Re-run `spdd-abstraction-first` if Entities, Approach, Structure, or Operations changed.
6. Use `spdd-generate` for targeted code updates from the changed canvas.

## Patch note template

```markdown
## Prompt update: <date / change>

### Trigger
<requirement change, failing scenario, review finding>

### Sections changed
- R — Requirements:
- E — Entities:
- A — Approach:
- S — Structure:
- O — Operations:
- N — Norms:
- S — Safeguards:

### Compatibility impact

### Verification to rerun
```

## Gate

Do not edit code for the behavior change until the updated canvas is saved or included in the current prompt context.
