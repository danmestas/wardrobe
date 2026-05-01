---
name: suit-build
version: 0.1.0
description: >
  Use when building, validating, or scaffolding skills in this monorepo.
  Triggers: "validate skills", "build suit-build", "scaffold a new skill",
  "init a hook/agent/rules/plugin", "run suit-build", or any work on the
  multi-harness skill emission pipeline (Claude Code, APM, Codex, Gemini,
  Copilot CLI, Pi targets).
category:
  primary: tooling
type: skill
targets:
  - claude-code
---

# suit-build

The build tool that compiles canonical `SKILL.md` components into
per-harness output under `dist/<target>/`. Each component is authored once,
validated against a shared schema, then emitted by adapters specific to each
harness (Claude Code, APM, Codex, Gemini, Copilot CLI, Pi).

`suit-build` ships from the standalone [`suit` repo](https://github.com/danmestas/suit) as the
`@agent-ops/suit` npm package. agent-config's npm scripts invoke it via
`npx -y -p @agent-ops/suit suit-build <cmd>` — no global install required.

## Commands

Run from the repo root:

| Command | What it does |
|---------|--------------|
| `npm run validate [-- --filter <glob>]` | Discover and validate components. Optional name glob. |
| `npm run build [-- --target <t>] [--filter <glob>]` | Emit per-target artifacts to `dist/`. `--target all` emits everything. |
| `npm run watch` | Initial build, then rebuild on changes (Claude Code target by default). |
| `npm run docs` | Regenerate the top-level `README.md` from component frontmatter. |
| `npm run init -- <name> [--type <t>]` | Scaffold a new component directory with valid frontmatter. |

The `init` subcommand defaults to `--type skill`. Other valid types: `plugin`, `hook`, `agent`, `rules`, `mcp`. Names must be kebab-case lowercase. Scaffolds into `skills/`, `plugins/`, or `rules/` based on type.

## Component types

- **skill** — A reusable AI capability with a `SKILL.md` body.
- **plugin** — A bundle of skills (Claude Code / APM only). Lists referenced components in `includes:`.
- **hook** — A lifecycle event handler keyed by event (e.g., `Stop`, `PreToolUse`).
- **agent** — A specialized persona with optional `tools`, `model`, `color`.
- **rules** — Coding guidelines with optional `before`/`after` ordering.
- **mcp** — An MCP server registration with `command`, `args`, `env`.

Type/target compatibility is enforced by the matrix in `suit-build`'s validate logic. Errors include remediation hints listing valid alternatives.

## Minimal SKILL.md

```yaml
---
name: my-skill
version: 0.1.0
description: Use when [describe triggering conditions in one sentence]
type: skill
targets:
  - claude-code
---

# my-skill

Describe what this skill does and how to use it.
```

## Where to find more

- [suit repo](https://github.com/danmestas/suit) — full source, including the Zod schema, golden test fixtures, validation rules, and per-harness adapters.
- `suit.config.yaml` — repo-level defaults applied during build (per-target `config` blocks).
