---
name: junior-frontend-engineer
version: 0.2.0
type: outfit
description: Junior frontend engineer - full Waza skills + orchestrator with decision trees and core behaviors.
targets:
  - claude-code
  - codex
  - gemini
  - pi
categories:
  - workflow
  - backpressure
  - tooling
  - context-management
enable:
  mcps:
    - context-mode
include:
  hooks:
    - junior-fe-orchestrator
  agents:
    - junior-frontend-engineer
---

# Junior Frontend Engineer Outfit (v2)

Complete outfit bundling the four primary Waza skills with a full orchestrator that includes core operating behaviors, FE lifecycle decision tree, and superpowers-style routing hints.

## Orchestrator
See `orchestrator.md` for the full routing logic, NATS registration, subagent activation model, and decision trees.

## Primary Skills (Waza)
- design (UI, tokens, direction-lock, a11y, screenshot iteration)
- check (review, visual regression, release gates)
- hunt (rendering bugs, DevTools diagnosis)
- health (config drift, maintainability)

## Secondary Skills
think, learn, read, write available on request.

## Activation
- Main session: NATS Micro on `waza.junior-frontend-engineer.suggest`
- Subagents: automatic via suit/outfit when spawned with this outfit
- Cross-harness fallback: skill description + outfit context

The orchestrator is suggest-only. No auto-execution.
