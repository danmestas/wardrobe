---
name: spdd-reasons-canvas
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: "Use to create or review a Structured-Prompt-Driven Development REASONS Canvas before code generation: Requirements, Entities, Approach, Structure, Operations, Norms, Safeguards."
category:
  primary: workflow
  secondary: [backpressure]
---

# SPDD REASONS Canvas

Write the executable prompt/spec that governs code generation.

**Announce at start:** "I'm using the spdd-reasons-canvas skill to turn the aligned analysis into an executable prompt."

## Canvas template

```markdown
# <Change> REASONS Canvas

## R — Requirements
- Problem:
- Definition of done:
- Acceptance criteria:
- Scope out:

## E — Entities
- Domain entities / value objects:
- Relationships:
- State and lifecycle rules:
- External systems:

## A — Approach
- Strategy:
- Trade-offs accepted:
- Alternatives rejected:
- Compatibility / migration approach:

## S — Structure
- Components and files:
- Interfaces / contracts:
- Dependency direction:
- Data flow:

## O — Operations
1. <atomic, testable implementation operation>
2. ...

## N — Norms
- Naming:
- Error handling:
- Observability:
- Testing:
- Repository conventions:

## S — Safeguards
- Security:
- Data integrity:
- Performance:
- Backward compatibility:
- Non-goals the agent must not cross:
```

## Quality bar

- Requirements are traceable to aligned acceptance criteria.
- Entities and Structure are grounded in existing code where code exists.
- Operations are ordered, atomic, and testable.
- Norms encode team conventions; Safeguards encode non-negotiable boundaries.
- No placeholders, speculative APIs, or "similar to above" shortcuts.

## Review gate

Run `spdd-abstraction-first` against the canvas before `spdd-generate`. If review changes behavior or design intent, edit the canvas first and re-review the affected sections.
