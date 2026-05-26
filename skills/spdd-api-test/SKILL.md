---
name: spdd-api-test
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use in SPDD when API or system-boundary behavior must be verified with executable scenarios covering normal, boundary, and error cases from the REASONS Canvas.
category:
  primary: workflow
  secondary: [backpressure]
---

# SPDD API Test

Generate and run boundary-level functional tests from the canvas acceptance criteria.

**Announce at start:** "I'm using the spdd-api-test skill to verify behavior at the system boundary."

## When to use

Use for HTTP APIs, CLIs, message handlers, webhooks, workers, or other externally observable contracts. Skip when the change has no runnable boundary surface; use focused unit/integration tests instead.

## Test design

Create a scenario table before code or script:

| ID | Scenario | Input | Expected output | Source AC |
| --- | --- | --- | --- | --- |
| T1 | Happy path | ... | ... | AC1 |
| T2 | Boundary | ... | ... | AC2 |
| T3 | Error | ... | ... | AC3 |

Cover:

- Normal business flow.
- Boundary values and limits named in the canvas.
- Invalid input and not-found paths.
- Backward compatibility expectations.
- Response shape or emitted side effects.

## Script rules

- Prefer existing project test harnesses over ad hoc scripts.
- If a script is necessary, make expected-vs-actual output explicit.
- Do not mock the system boundary the scenario is supposed to prove.
- Keep credentials, production endpoints, and destructive operations out of generated scripts.

## Gate

Run the scenarios. If behavior fails because the canvas intent is wrong or incomplete, use `spdd-prompt-update` before changing code. If behavior fails because code violates the canvas, fix code under `spdd-generate`.
