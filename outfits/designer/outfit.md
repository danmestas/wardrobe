---
name: designer
version: 1.0.0
type: outfit
description: Product / interface designer using the 7 Layers framework + rich design skills (cuellarfr) + UI component decision trees for the surface layer.
targets:
  - claude-code
  - codex
  - gemini
  - pi
categories:
  - tooling
  - workflow
  - evolution
enable:
  mcps:
    - context-mode
skill_include:
  - frontend-component-decision-trees
  - writing-plans
  - brainstorming
  - subagent-driven-development
  - systematic-debugging
  - norman
  - obsidian-markdown
  - status-update
skill_exclude:
  - golang-patterns
  - datastar-tao
  - datastar-patterns
  - datastar
  - shadcn-forms
include:
  hooks:
    - rtk-suggest
    - rtk-rewrite
  agents:
    - architect-review
---
# Designer Outfit

For product and interface designers working across the 7 Layers of product design + established design methodologies.

**Install the skill packages (one-time):**
- Layers framework: `npx skills add jamiemill/layers-skills`
- Design skills (cuellarfr): `npx skills add cuellarfr/design-skills`

**Core wardrobe skill**:
- `frontend-component-decision-trees` — the UI component decision trees (form, notifications, errors, loading, CTAs, overflow, onboarding, DS contribution) with Mermaid visuals, validated against the original Smashing Magazine + Workday/Lyft/Primer sources. Especially powerful at **Layer 7 (Surface)**.

**Key cuellarfr/design-skills** (highly recommended for designers):
- design-critique
- design-systems
- interaction-design
- accessibility-audit
- journey-mapping
- ux-writing
- design-elevation
- design-ops
- ux-strategy (if available)

These skills follow the same high-quality architecture (SKILL.md + references/ + templates/ + examples/) and are grounded in established design frameworks (Nielsen, Cooper, Tufte, etc.).

**Layers framework** (jamiemill):
The 7 layers (Observed behaviour → Domain → User needs → Product strategy → Conceptual model → Interaction flow → Surface) + orient diagnostic and intro. Use the decision-trees skill especially at the Surface layer for component choice, vocabulary, hierarchy, and accessibility.

**When to use this outfit**:
- Product strategy, conceptual modeling, interaction design, or surface/UI decisions.
- Design critiques, accessibility audits, journey mapping, design system work, or UX writing.
- Any work involving the 7 Layers framework + concrete component choices or design methodology.
- Design reviews, spec writing, or onboarding new designers.

Excludes frontend-specific Datastar/shadcn skills (use the `frontend` outfit for implementation work).
