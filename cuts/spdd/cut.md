---
name: spdd
version: 0.1.0
type: cut
description: 'Structured-Prompt-Driven Development — align intent, analyze context, write a REASONS Canvas, generate inside the spec, and keep prompt and code synchronized.'
targets:
  - claude-code
  - codex
  - gemini
  - pi
categories:
  - workflow
  - backpressure
enable:
  plugins:
    - superpowers
    - superpowers-codex
skill_include: []
skill_exclude: []
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
  hooks:
    - spdd-workflow
  agents: []
  commands: []
---

Structured-Prompt-Driven Development. Treat prompts/specs as first-class delivery artifacts: versioned, reviewed, reused, and kept synchronized with code.

You are in SPDD cut. Work prompt-first, not diff-first. Lock intent with alignment, ground it with analysis, turn it into a REASONS Canvas, and generate only inside that boundary. Validate behavior before deep code review. When reality diverges, classify it before editing: behavior or business-rule changes go prompt first then code (`spdd-prompt-update`), while behavior-preserving refactors go code first then prompt sync (`spdd-sync`). Keep the prompt artifact, verification evidence, and code on the same branch so reviewers can check intent before they check the diff.
