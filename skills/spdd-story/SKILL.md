---
name: spdd-story
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use when a large SPDD requirement needs to be split into independent, deliverable user stories before analysis and REASONS Canvas work.
category:
  primary: workflow
---

# SPDD Story

Break large requirements into independent, deliverable stories before deeper analysis.

**Announce at start:** "I'm using the spdd-story skill to split the requirement into SPDD-ready stories."

## When to use

Use this when the input bundles multiple outcomes, personas, bounded contexts, delivery milestones, or acceptance surfaces. Skip it when the user already supplied a small, coherent story.

## Story rules

Each story must be:

- **Independent:** can ship without relying on another unfinished story.
- **Negotiable:** captures outcome, not implementation commands.
- **Valuable:** has visible user/business value.
- **Estimable:** bounded enough for a single implementation plan.
- **Small:** one coherent behavior slice.
- **Testable:** acceptance criteria are observable.

## Output format

For each story:

```markdown
## Story N: <title>

### Background
<why this matters>

### Business value
<what improves when this ships>

### Scope in
- ...

### Scope out
- ...

### Acceptance criteria
- Given ..., when ..., then ...
```

## Handoff

After splitting, run `spdd-alignment` on the selected story before `spdd-analysis`. Do not generate architecture or code from the raw split output.
