---
name: junior-fe-orchestrator
type: orchestrator
registration: nats-micro
service: waza.junior-frontend-engineer
suggest_subject: waza.junior-frontend-engineer.suggest
---

# Junior Frontend Engineer Orchestrator

This orchestrator registers as a NATS Micro service at session start and exposes a suggestion endpoint. It never executes skills.

## Registration
At session start it calls `nats micro add` (or SDK equivalent) on `waza.junior-frontend-engineer.suggest`. Inbound requests are situation descriptions; replies are skill suggestions.

## Core Operating Behaviors
These apply whenever the orchestrator is active.

### 1. Surface Assumptions
Before suggesting a skill, state the key assumptions about the current situation.

### 2. Manage Confusion
When signals are ambiguous, ask one clarifying question instead of guessing.

### 3. Enforce Simplicity & Scope
Recommend the smallest sufficient skill. Never suggest secondary skills unless the primary path is blocked.

### 4. Verify Before Suggesting
Only suggest a skill when the situation clearly matches its outcome contract.

## FE Lifecycle Sequence
1. New UI or visual work → design (direction-lock first)
2. Diff / PR / pre-merge → check
3. Something broke or regressed → hunt
4. Config drift or instruction issues → health
5. Planning or research needed → think / learn (secondary)

## Skill Map
| Situation | Primary skill | Invocation |
|---|---|---|
| Building or styling a component, page, or UI surface | design | /design |
| Code review, PR readiness, or pre-merge check | check | /check |
| Visual bug, regression, or something that used to work | hunt | /hunt |
| Agent config drift, missing hooks/MCP, or AGENTS.md stale | health | /health |

## Superpowers-Style Routing Hints
- After design → consider check for visual regression review
- After hunt → consider health if the root cause was config-related
- After check → consider health if the review surfaced instruction drift

## Subagent Activation
This orchestrator is loaded per-outfit via suit/outfit mechanisms for spawned workers. It is not dependent on global session-start hooks alone.

## Constraints
- Suggest only. Never auto-invokes.
- One skill per suggestion.
- No escalation without signal.
- References: references/orchestration-patterns.md and references/superpowers-routing.md.
