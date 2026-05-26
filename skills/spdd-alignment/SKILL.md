---
name: spdd-alignment
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use before SPDD analysis or implementation to lock business intent, domain language, scope boundaries, acceptance criteria, dependencies, and hard constraints.
category:
  primary: workflow
  secondary: [backpressure]
---

# SPDD Alignment

Lock intent before design or code. This skill turns raw input into a shared, testable problem statement.

**Announce at start:** "I'm using the spdd-alignment skill to lock intent before writing the prompt or code."

## Hard gate

Do not invoke implementation skills, edit product code, or generate a REASONS Canvas until the alignment questions below have concrete answers. If a question is answerable from repository context, answer it by inspection rather than asking the user.

## Alignment checks

### Business value

- What user/business problem is being solved?
- What outcome would prove the change mattered?
- Which behavior is explicitly out of scope?

### Domain language

- Define the key nouns and verbs in the user's language.
- Identify same-word/different-meaning risks.
- Prefer existing repository terminology unless the requirement intentionally changes it.

### Acceptance criteria

- Convert vague success statements into Given/When/Then or equivalent observable checks.
- Cover happy path, important boundaries, and invalid inputs.
- Separate business acceptance from implementation detail.

### Constraints and dependencies

- Identify upstream systems, unfinished modules, migration order, data compatibility, security, performance, compliance, and operational constraints.
- Preserve legacy behavior unless the aligned requirement explicitly changes it.

## Output

Produce an `alignment.md` section or artifact with:

1. Problem statement.
2. Business value.
3. Scope in/out.
4. Domain glossary.
5. Acceptance criteria.
6. Constraints and dependencies.
7. Open questions that are truly blocking.

If blockers remain, do not proceed to `spdd-analysis` until they are resolved or explicitly deferred by the user.
