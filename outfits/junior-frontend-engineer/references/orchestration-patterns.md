# Orchestration Patterns (from agent-skills)

## Pattern 1: Direct Invocation
User types the skill trigger directly. Orchestrator is silent.

## Pattern 2: Single-Persona Command
A saved prompt or command that includes the orchestrator suggestion.

## Pattern 3: Parallel Fan-out
Multiple workers spawned with the same outfit; each gets the orchestrator.

## Pattern 4: Sequential User-Driven
User follows orchestrator suggestions one at a time (recommended for junior FE).

The orchestrator in this outfit supports Pattern 4 by default and Pattern 3 when workers are spawned with the outfit.
