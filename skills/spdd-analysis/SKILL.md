---
name: spdd-analysis
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use after SPDD alignment to analyze requirements against relevant code, domain concepts, risks, gaps, strategy, and acceptance coverage before writing a REASONS Canvas.
category:
  primary: workflow
  secondary: [context-management]
---

# SPDD Analysis

Create the context-rich analysis that feeds the REASONS Canvas. Analyze enough to ground the prompt; do not design method-level operations yet.

**Announce at start:** "I'm using the spdd-analysis skill to ground the requirement in existing domain and code context."

## Inputs

- Aligned story or requirement.
- Existing specs, ADRs, prompts, and tests relevant to the same domain.
- Repository code discovered by domain keywords and symbols, not by blind whole-repo reading.

## Process

1. Extract domain keywords from the requirement and glossary.
2. Search for matching code, tests, schemas, APIs, docs, and prior prompt artifacts.
3. Identify existing concepts and whether they should be reused, extended, or left untouched.
4. Identify new concepts and how they relate to existing ones.
5. Surface risks, gaps, ambiguous rules, and hidden constraints.
6. Recommend the strategic direction at a high level only.

## Output sections

```markdown
# <Story> Analysis

## Requirement summary

## Domain concepts
### Existing
### New
### Relationships and business rules

## Relevant system context
- Files/symbols examined:
- Existing tests/contracts:
- External dependencies:

## Strategic direction

## Risks and gaps

## Acceptance coverage map
| Acceptance criterion | Evidence / design implication | Risk |
```

## Gate

Review the analysis for alignment before writing the REASONS Canvas. If the analysis misses a key domain term, risk, or boundary, fix the analysis first.
