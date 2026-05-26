---
name: spdd-iterative-review
version: 0.1.0
targets: [claude-code, codex, gemini, pi]
type: skill
description: Use after SPDD-generated changes to review behavior, prompt/code consistency, architecture boundaries, code quality, and whether to update prompt first or sync prompt after refactor.
category:
  primary: backpressure
  secondary: [workflow]
---

# SPDD Iterative Review

Turn generated output into a controlled loop. Behavior first, code review second, prompt/code sync always.

**Announce at start:** "I'm using the spdd-iterative-review skill to classify feedback and keep the prompt and code synchronized."

## Review order

1. **Behavior:** Does the system satisfy acceptance criteria and safeguards?
2. **Prompt/code consistency:** Does the code implement exactly what the canvas says?
3. **Architecture:** Do layers, dependencies, interfaces, and responsibilities match Structure and Approach?
4. **Code quality:** Check error handling, imports, dependency choices, magic values, long methods, duplication, and repository idioms.
5. **Test adequacy:** Do tests cover normal, boundary, and error cases that can break?

## Classify every finding

### Logic correction

Observable behavior, business rule, data contract, security rule, performance guarantee, or acceptance criterion changes.

Action: run `spdd-prompt-update` first, then update code with `spdd-generate`.

### Refactor

Internal structure changes with no observable behavior change.

Action: refactor code, prove behavior still passes, then run `spdd-sync`.

### Prompt defect

The canvas is ambiguous, incomplete, or internally inconsistent.

Action: repair the canvas and re-review before code changes continue.

### Code defect

The canvas is right, but code violates it.

Action: fix code under `spdd-generate` and rerun affected verification.

## Output

Use this format:

```markdown
## SPDD review

### Behavior evidence
- ...

### Findings
- [logic-correction|refactor|prompt-defect|code-defect] <finding> → <next skill/action>

### Prompt/code sync status
- Canvas describes current code: yes/no
- Required update: spdd-prompt-update / spdd-sync / none
```

Do not declare the slice complete while canvas and code disagree.
