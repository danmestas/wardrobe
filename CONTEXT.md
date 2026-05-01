# CONTEXT

Domain vocabulary used across this repo. When introducing a new architectural
concept that future code should reference by name, add it here.

## Components (top-level dirs)

- **skill** — typed agent capability triggered by description. Lives in `skills/<name>/SKILL.md`.
- **plugin** — multi-skill bundle. Lives in `plugins/<name>/.claude-plugin/plugin.json`.
- **agent** — wshobson-sourced subagent. Lives in `agents/<name>/`.
- **hook** — event-driven script (e.g. tts-announcer, trace, recall). Lives in `hooks/<name>/`.
- **persona** / **mode** — filters that intersect a skill catalog into a smaller, focused set. Live in `personas/` and `modes/`.

## Build pipeline ([`suit`](https://github.com/danmestas/suit))

The build pipeline lives in the standalone [`suit` repo](https://github.com/danmestas/suit). agent-config invokes `suit-build <cmd>` via `npx`. Glossary of pipeline concepts:

- **manifest** — the YAML frontmatter on a component (SKILL.md, plugin.json, etc).
- **catalog** — the discovered set of components for a given harness home (e.g. `~/.claude/skills/`).
- **harness** — a downstream agent runtime: `claude-code`, `apm`, `codex`, `gemini`, `copilot`, `pi`.
- **adapter** — code that emits a component into one harness's expected layout. Lives in suit.
- **resolution** — the persona/mode-filtered view of a catalog: which skills to drop, what mode prompt to inject. Computed and persisted by suit when callers (e.g. the `suit` launcher) need both.
- **suit session** — the lifecycle of one `suit <harness> ...` invocation. Stages, in order: (1) resolveTarget, (2) persistResolution, (3) prelaunchForTarget, (4) exec. Implemented in suit.
- **prelaunch** — the harness-specific composition step that builds a temp HOME or package dir with persona-filtered skills before spawning the harness binary.
