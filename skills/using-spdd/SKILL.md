---
name: using-spdd
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use when a session is working under Structured-Prompt-Driven Development (SPDD), when prompts/specs must be versioned delivery artifacts, or when logic-heavy changes need a prompt-first closed loop.
category:
  primary: workflow
  secondary: [backpressure]
---

# Using Structured-Prompt-Driven Development

Structured-Prompt-Driven Development (SPDD) treats prompts as first-class delivery artifacts: versioned, reviewed, reused, and kept in sync with code.

**Announce at start:** "I'm using the using-spdd skill to keep prompt assets and code in a closed loop."

## Fit check

Use SPDD for logic-heavy, audit-heavy, team-shared, or repeatable delivery work where intent drift is expensive. Avoid it for emergency recovery, throwaway spikes, one-off scripts, or taste-led creative work unless the user explicitly wants the governance overhead.

## Non-negotiable loop

1. **Clarify intent** with `spdd-alignment` before design or code.
2. **Analyze context** with `spdd-analysis` against only relevant code and domain artifacts.
3. **Write a REASONS Canvas** with `spdd-reasons-canvas` before implementation.
4. **Generate/modify code from the canvas** with `spdd-generate`; no scope beyond Operations, Norms, and Safeguards.
5. **Validate behavior first**, then review structure with `spdd-iterative-review`.
6. **If behavior or business logic changes:** update the prompt first with `spdd-prompt-update`, then update code.
7. **If only internal structure changes:** refactor code, prove behavior is unchanged, then sync back with `spdd-sync`.

## Artifact discipline

Default location: `docs/superpowers/spdd/YYYY-MM-DD-<slug>/`.

A complete SPDD slice has:

- `story.md` or linked requirement source.
- `analysis.md` for domain concepts, risks, scope, and strategy.
- `reasons-canvas.md` as the executable prompt/spec.
- `verification.md` or test script notes mapping behavior to acceptance criteria.

Keep artifacts current in the same branch as the code they govern. Never let chat-only instructions replace the canvas.

## Prompt/code divergence rule

When reality diverges, classify the divergence before changing anything:

- **Logic correction / requirement change / acceptance mismatch:** prompt first, code second.
- **Refactor / naming / decomposition with no observable behavior change:** code first, prompt sync second.
- **Unclear intent:** stop implementation and return to alignment.

## Required review stance

Reviewers should check the intent artifact before the diff. A code change is not ready if the code passes tests but the canvas no longer describes what the system does.
