---
name: frontend-component-decision-trees
version: 1.0.0
type: skill
targets: [claude-code, codex, gemini, pi]
description: Use this skill whenever the user needs to choose the correct UI component for forms, notifications, errors, loading, buttons, overflow, onboarding, or design system contributions. Always start with the Main Entry Point dispatcher to select the right tree, then follow the exact branching logic. This skill prevents ad-hoc component choices by enforcing production design system decision trees.
---
# Frontend Component Decision Trees

## When to Use This Skill (Trigger Conditions)
- User asks "what component should I use for...", "which UI pattern for X", "form control recommendation", "notification vs toast vs banner", "loading state choice", "button vs link", "how to handle overflow/truncation", "onboarding pattern", or "should we add this to the design system?"
- Any frontend architecture, component library design, design review, or spec writing task involving UI element selection.
- The conversation is about making a repeatable, defensible choice rather than a one-off visual preference.

**Do NOT use** for pure visual polish, copywriting, icon selection, or non-component decisions.

## Main Entry Point — Scenario to Tree Dispatcher
**Always run this dispatcher first.** Identify the scenario, then jump to the matching reference file in references/.

| User Scenario | Primary Reference | Key Questions to Ask |
|---------------|-------------------|----------------------|
| Form inputs (radio, checkbox, dropdown, switch, toggle) | references/form-components.md | Multi-select? Short vs long labels? Filtering? |
| Notifications / feedback (toast, banner, modal, dialog, push) | references/notifications.md | System or user generated? Passive or actionable? Attention level? |
| Errors, alerts, validation, empty states | references/errors-alerts.md | Critical error or warning? Element, page, or global? |
| Loading / waiting states | references/loading.md | Duration? Predictable content? Progress trackable? |
| Buttons, CTAs, alignment, grouping | references/calls-to-action.md | Emphasis level? Alignment needs? Number of actions? |
| Truncation, overflow, "show more", scroll | references/truncation-overflow.md | Primary or secondary info? Fixed container? |
| Onboarding / feature discovery | references/onboarding.md | Interrupt, subtle show, or contextual discovery? |
| Adding new component/pattern to DS | references/design-system-contribution.md | Ready to share? Multi-product? Maintainers agree? |

**Quick Start Questions** (ask these to route):
- Form control choice? → form-components.md
- Status / error / feedback messaging? → notifications.md or errors-alerts.md
- Waiting for content? → loading.md
- Action button or link? → calls-to-action.md
- Content hidden or overflowing? → truncation-overflow.md
- Guiding user through feature? → onboarding.md
- Design system governance? → design-system-contribution.md

If multiple apply, start with the most specific primary reference.

## How to Use the References
Each file in references/ contains:
- The full decision tree with root questions and branches
- "When to Use" and "When to Use Something Else" guidance
- Accessibility rules and anti-patterns
- Concrete examples and tables from the source design systems
- Output contract for that tree

Read only the relevant reference file(s). Do not load all of them into context at once.

## Output Requirements (Every Time)
1. State the exact component chosen.
2. Quote the root question and the branch taken.
3. One-sentence rationale.
4. 1–2 rejected alternatives with the branch that would have selected them.
5. Cite the reference file used.
6. Ask at most one clarifying question if context is ambiguous.

This structure guarantees repeatable, source-backed decisions.
