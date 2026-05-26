---
name: spdd-abstraction-first
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use during SPDD design review before generation to validate entities, responsibilities, interfaces, boundaries, dependencies, and task granularity.
category:
  primary: backpressure
  secondary: [workflow]
---

# SPDD Abstraction First

Design before generation. Make the model of the solution explicit before letting an agent fill in implementation details.

**Announce at start:** "I'm using the spdd-abstraction-first skill to check the domain model and boundaries before generation."

## Review the model

### Requirement fidelity

- Requirements section captures the user story and definition of done.
- Acceptance criteria are fully represented without invented scope.
- Domain terms match the aligned glossary.

### Entity and responsibility model

- Entities, value objects, services, commands, events, and external systems reflect the real domain.
- Responsibilities have clear owners; no concept is split arbitrarily across layers.
- Relationships and lifecycle rules are explicit.

### Approach and structure

- The design strategy solves the core problem, not a nearby easier problem.
- Components fit the existing architecture and dependency direction.
- Interface contracts are named before implementation details are written.

### Operations granularity

- Tasks are independent, testable, and acceptance-ready.
- Each task has exact files/symbols where possible.
- No task says "handle edge cases" without naming the edge cases.

## Diagram rule

For non-trivial domains, add one lightweight diagram to the prompt artifact before implementation:

- Mermaid class diagram for entities and relationships.
- Sequence diagram for cross-component flows.
- Flow chart for decision logic.

## Output

Append an abstraction review to the REASONS Canvas or analysis artifact:

- Model accepted / rejected.
- Required corrections.
- Diagram, if useful.
- Risks that must become Norms or Safeguards.

If the model is rejected, return to `spdd-reasons-canvas` instead of coding around it.
