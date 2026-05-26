---
name: spdd-sync
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use after behavior-preserving refactors or implementation cleanup in SPDD to synchronize the REASONS Canvas back to the current code without changing business intent.
category:
  primary: workflow
  secondary: [backpressure]
---

# SPDD Sync

Keep the prompt/spec accurate after code-side refactors. This is code-to-prompt, not requirements-to-code.

**Announce at start:** "I'm using the spdd-sync skill to synchronize behavior-preserving code changes back into the canvas."

## Use when

- Names, files, modules, interfaces, constants, or internal decomposition changed.
- A refactor improved maintainability without changing observable behavior.
- Tests and boundary behavior still pass.
- The canvas now describes an older internal structure.

If behavior changed, stop and use `spdd-prompt-update` instead.

## Sync process

1. Read the current REASONS Canvas and the code diff.
2. Confirm verification proves behavior is unchanged.
3. Update only sections that describe internal implementation facts:
   - Entities if names or responsibilities changed.
   - Structure if files, modules, interfaces, or dependencies changed.
   - Operations if implementation steps are now stale for future replay.
   - Norms if a reusable convention emerged.
4. Do not rewrite Requirements to match accidental behavior.
5. Record why this was a refactor, not a logic correction.

## Output

```markdown
## SPDD sync note

### Refactor evidence
- Behavior checks run:
- Observable behavior changed: no

### Canvas sections synchronized
- E — Entities:
- S — Structure:
- O — Operations:
- N — Norms:

### Follow-up risk
```

## Completion gate

The slice is not complete until `spdd-iterative-review` reports that the canvas describes the current code.
