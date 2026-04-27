# agent-skills

Multi-harness skills monorepo for AI coding agents. Authors write skills, agents, rules, hooks, MCP configs, and plugins once in canonical `SKILL.md` format; `apm-builder` emits per-harness artifacts for **Claude Code**, **APM**, **Codex**, **Gemini CLI**, **Copilot CLI**, and **Pi**.

> **Status (2026-04-27):** Foundation + Claude Code adapter merged. APM, Codex, Gemini, Copilot CLI, and Pi adapters are in flight (PRs forthcoming). Skill migrations to canonical frontmatter follow in a subsequent plan; today most skills predate the schema and aren't yet emitted by `apm-builder`.

## Install

### Claude Code (marketplace)

```text
/plugin marketplace add danmestas/agent-skills
/plugin install <plugin-name>@danmestas/agent-skills
```

Once Plan 7 (skill migrations) lands, individual skills will also be installable via the marketplace. Until then, prefer the per-skill manual install: clone the repo and copy the desired `skills/<name>/` directory into your `~/.claude/skills/`.

### APM

```yaml
# apm.yml
dependencies:
  apm:
    - danmestas/agent-skills
```

> APM adapter is in development; manifests are not yet emitted. Track progress in the open PR series under [Plan 2](https://github.com/danmestas/agent-skills/pulls).

### Codex / Gemini CLI / Copilot CLI / Pi

Adapters for these harnesses are pending. Each will land as its own PR (Plans 3–6). When ready, the canonical `targets:` field on a skill's frontmatter will gate emission for that harness.

## Categories

### Software design philosophy

- [`ousterhout`](skills/ousterhout) — *A Philosophy of Software Design*: deep modules, information hiding, strategic programming, minimizing cognitive load.
- [`hipp`](skills/hipp) — D. Richard Hipp's principles (SQLite, Fossil): zero-config, embedded, simplicity, built to last decades.
- [`norman`](skills/norman) — Don Norman's interaction-design principles: affordances, signifiers, mapping, feedback, error prevention.
- [`tigerstyle`](skills/tigerstyle) — TigerBeetle's NASA Power-of-Ten safety-critical discipline: assertion-heavy development, zero technical debt.

### Development tooling

- [`mgrep-code-search`](skills/mgrep-code-search) — Semantic code search for large codebases. Natural-language queries across code, text, PDFs, and images.
- [`dx-audit`](skills/dx-audit) — Workflow-based DX/UX scoring with weighted friction analysis and ranked improvements.
- [`idiomatic-go`](skills/idiomatic-go) — Go style and idioms (Bodner's *Learning Go*): error handling, slices, interfaces, concurrency.
- [`apm-builder`](skills/apm-builder) — This repo's build tool itself. Validate, build, watch, scaffold, regenerate docs.
- [`cloudflare-email`](skills/cloudflare-email) — Send outbound email from Cloudflare-hosted domains via REST API or Workers binding.

### Project & process

- [`linear-method`](skills/linear-method) — The Linear Method: plain-language issues, 4-priority system, cycles, backlog hygiene.
- [`gh-project-charter`](skills/gh-project-charter) — GitHub Projects V2 charter management: goals, scope, success criteria, change log.
- [`gh-project-setup`](skills/gh-project-setup) — Create and configure GitHub Projects V2 with template selection (kanban, bug-tracker, feature-dev, roadmap, etc.).
- [`gh-project-operations`](skills/gh-project-operations) — Daily GitHub Projects V2 operations: issue CRUD, status changes, bulk ops, CSV import/export.
- [`gh-project-shared`](skills/gh-project-shared) — Shared utilities for the `gh-project-*` skills (CLI validation, auth checks, config). Not directly invoked.
- [`knowledge-base`](skills/knowledge-base) — Long-running LLM-maintained knowledge bases as Obsidian-compatible wikis.

### Integrations & data

- [`signoz-dashboard-builder`](skills/signoz-dashboard-builder) — Build SigNoz dashboards via MCP API (metrics, logs, traces, telemetry panels).
- [`datastar-tao`](skills/datastar-tao) — *The Tao of Datastar*: hypermedia philosophy, backend-owned state, SSE, DOM morphing.
- [`datastar-patterns`](skills/datastar-patterns) — Datastar UI implementation patterns: search, inline editing, infinite scroll, file upload, validation, polling.
- [`apple-contacts`](skills/apple-contacts) — Apple Contacts CRUD via the `contactbook` CLI (macOS only).
- [`atlassian-cli-jira`](skills/atlassian-cli-jira) — Manage Jira Cloud via Atlassian CLI (`acli`): search, create, edit, transition, bulk ops, sprints.
- [`deterministic-simulation-testing`](skills/deterministic-simulation-testing) — Collapse distributed systems into single-threaded simulations: BUGGIFY fault injection, VOPR patterns.
- [`doppler`](skills/doppler) — Migrate `.env` files to Doppler secrets management; multi-environment configs.
- [`midscene-testing`](skills/midscene-testing) — Screenshot-driven browser smoke testing via Midscene's headless Puppeteer mode.

## Components

The table below is regenerated from canonical `SKILL.md` frontmatter via `npm run docs`. Until Plan 7 migrates the existing skills to the canonical schema, this table reflects only the components that already conform.

<!-- AUTO-GENERATED: COMPONENTS -->
| Name | Type | Version | Description | Targets |
|------|------|---------|-------------|---------|
<!-- /AUTO-GENERATED: COMPONENTS -->

## Building

```bash
npm install
npm run validate -- --filter <name>     # validate one component
npm run build -- --target claude-code   # build Claude Code artifacts
npm run watch -- --target claude-code   # rebuild on change
npm run docs                             # regenerate the components table above
npm run init -- my-skill --type skill    # scaffold a new component
npm test                                 # run apm-builder unit tests
```

`npm run docs` only rewrites the region between `<!-- AUTO-GENERATED: COMPONENTS -->` and `<!-- /AUTO-GENERATED: COMPONENTS -->`. Everything outside the markers — including the categorized list above — is hand-written and preserved across regenerations.

## Architecture

For the full build-tool reference, read [`skills/apm-builder/SKILL.md`](skills/apm-builder/SKILL.md).

The canonical source format is one `SKILL.md` per component with YAML frontmatter:

```yaml
---
name: my-skill
version: 1.0.0
description: Use when [describe triggering conditions in one sentence]
type: skill
targets: [claude-code, apm, codex, gemini, copilot, pi]
---

(skill body)
```

Per-harness emission honors a compatibility matrix (see [`apm-builder/lib/validate.ts`](apm-builder/lib/validate.ts) and the matrix described in [`skills/apm-builder/SKILL.md`](skills/apm-builder/SKILL.md#component-types)) — not every component type works on every harness. The validator rejects incompatible combinations and warns on best-effort ones.

Component types: `skill`, `plugin`, `hook`, `agent`, `rules`, `mcp`. See [`apm-builder/lib/types.ts`](apm-builder/lib/types.ts) for the full manifest shape.

## Contributing

- Branch from `main` and open a PR — direct pushes to `main` are not accepted.
- Run `npm test` and `npx tsc --noEmit` before pushing; both must be green.
- Keep commit messages focused and imperative (e.g., `feat(apm-builder): ...`, `docs: ...`).
- Do not include AI-tool attribution in commit messages or PR bodies.
- New skills follow the `kebab-case` directory convention under `skills/`. Plugins live under `plugins/`. See [`AGENTS.md`](AGENTS.md) for repo-level guidelines.

## License

[MIT](LICENSE).
