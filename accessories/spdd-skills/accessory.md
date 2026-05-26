---
name: spdd-skills
version: 0.1.0
type: accessory
description: Structured-Prompt-Driven Development skill bundle — REASONS Canvas, alignment, analysis, generation, review, prompt-update, and sync skills without changing the session cut.
targets: [claude-code, codex, gemini, pi]
include:
  skills:
    - using-spdd
    - spdd-story
    - spdd-alignment
    - spdd-analysis
    - spdd-reasons-canvas
    - spdd-abstraction-first
    - spdd-generate
    - spdd-api-test
    - spdd-iterative-review
    - spdd-prompt-update
    - spdd-sync
  rules: []
  hooks: []
  agents: []
  commands: []
---

# SPDD Skills Accessory

Layer this accessory onto another outfit/cut when you want the SPDD skill surface available without switching the whole session into SPDD mode. The full methodology now lives in the `spdd` cut; this accessory is the lighter skill bundle.

## What it bundles

- **`using-spdd`** — session-level workflow contract as a callable skill.
- **`spdd-story`** — optional story slicing for large requirements.
- **`spdd-alignment`** — business intent, domain language, scope, acceptance criteria, and constraints.
- **`spdd-analysis`** — grounded domain/code analysis before design.
- **`spdd-reasons-canvas`** — Requirements, Entities, Approach, Structure, Operations, Norms, Safeguards.
- **`spdd-abstraction-first`** — prompt/design review before generation.
- **`spdd-generate`** — implementation strictly from the approved canvas.
- **`spdd-api-test`** — boundary-level executable scenarios.
- **`spdd-iterative-review`** — behavior-first review and feedback classification.
- **`spdd-prompt-update`** — requirements-to-prompt-to-code loop for behavior changes.
- **`spdd-sync`** — code-to-prompt sync for behavior-preserving refactors.

## Pairing

Use `--cut spdd` when you want the full methodology enforced as the session work shape. Use this accessory when another cut should remain in charge, but the SPDD skills should still be within reach.

Avoid this accessory for urgent incident recovery, disposable scripts, visual/taste exploration, or raw brainstorming where prompt governance would slow the wrong work.
