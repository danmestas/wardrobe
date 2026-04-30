---
name: clone-config
version: 0.1.0
description: >-
  Use when bootstrapping a fresh Mac/server, managing dotfiles, tracking shell
  configs, refreshing a Brewfile, adding ~/.zshrc to a dotfiles repo, or
  asking how to replicate a machine's config to a new device. Manages macOS
  (and Linux-compatible) machine config via chezmoi — install once, apply on
  every machine, edit source not target.
type: skill
targets:
  - claude-code
category:
  primary: tooling
---

# clone-config — chezmoi dotfile workflow

chezmoi gives dotfiles a single source of truth: one Git repo, applied to every
machine with one command. Files in the source dir are named with prefixes
(`dot_`, `private_`) that map to locations in `$HOME`. You edit the source,
apply to `$HOME`; the target is always derived, never the authority.

The patterns below reflect the actual setup in `~/projects/dotfiles`:
`.zshrc`, `.zprofile`, `.p10k.zsh`, `.tmux.conf`, Yazi config, Kaku config,
Ghostty config, a `Brewfile`, and an install script that re-runs whenever
the Brewfile hash changes.

---

## Bootstrap a fresh machine

```bash
# 1. Install Homebrew (if missing)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install chezmoi and apply the dotfiles repo
brew install chezmoi
chezmoi init --apply git@github.com:YOUR_USER/dotfiles.git
```

One `chezmoi init --apply` does everything:

1. Writes all tracked source files to `$HOME`
2. Clones externals (oh-my-zsh, fzf-tab) declared in `.chezmoiexternal.toml`
3. Runs `run_onchange_install-packages.sh` → `brew bundle`, uv tools, npm globals, yazi plugins

After that the machine is fully provisioned. No separate install scripts to
remember, no manual symlinks.

---

## Layout conventions

| Source path | Applied to `$HOME` | Notes |
|---|---|---|
| `dot_zshrc` | `~/.zshrc` | `dot_` prefix → leading `.` |
| `dot_config/yazi/` | `~/.config/yazi/` | Nested `dot_config` works recursively |
| `private_Library/` | `~/Library/` | `private_` → chmod 0700 on the dir, 0600 on files |
| `.chezmoiexternal.toml` | — | Declares upstream repos cloned on apply (oh-my-zsh, fzf-tab) |
| `.chezmoiignore` | — | Paths inside source that chezmoi skips at apply time |
| `run_onchange_<name>.sh.tmpl` | — | Re-runs whenever file content (post-template) changes |
| `run_once_<name>.sh.tmpl` | — | Runs only on the very first apply |
| `Brewfile` | — | Consumed by the install script; not applied to `$HOME` directly |

**Key convention**: `dot_` → leading dot, `private_` → restricted permissions.
Both prefixes can be combined: `private_dot_ssh/` → `~/.ssh/` (mode 0700).

---

## Daily workflow

| Task | Command | Notes |
|---|---|---|
| Preview pending changes | `chezmoi diff` | Read-only; see what would change in `$HOME` |
| Apply pending changes | `chezmoi apply` | Write source state to `$HOME` |
| Edit a tracked file | `chezmoi edit ~/.zshrc` | Opens the **source**, not the target — critical |
| Jump into source repo | `chezmoi cd` | Drops you in `~/.local/share/chezmoi` |
| Pull remote + apply | `chezmoi update` | Equivalent to `git pull` + `chezmoi apply` |
| Reconcile after target edit | `chezmoi re-add ~/.zshrc` | Rescue: pulls target back into source |
| Track a new file | `chezmoi add ~/path/to/file` | Copies file into source with correct prefix |

The source repo lives at `~/.local/share/chezmoi` by default. `chezmoi cd`
is the fastest way in; treat it like any Git repo once there.

---

## Adding a new file

```bash
# 1. Tell chezmoi to track the file (copies it into source)
chezmoi add ~/some/config

# 2. Commit from inside the source repo
chezmoi cd
git add -A && git commit -m "track some/config"
git push  # or: open a PR if the dotfiles repo enforces review
```

After `git push`, any other machine running `chezmoi update` picks up the file.

---

## The run_onchange installer pattern

This is the high-leverage part of the setup. A single templated script
orchestrates all package management and re-runs automatically whenever its
content changes — including whenever the embedded Brewfile hash changes.

Actual content of `run_onchange_install-packages.sh.tmpl`:

```bash
#!/usr/bin/env bash
# Re-runs whenever this file changes (including Brewfile hash below).
# Manages: homebrew, uv tools, npm globals, yazi plugins.
set -euo pipefail

# Brewfile hash: {{ include "Brewfile" | sha256sum }}

echo "==> brew bundle"
brew bundle --no-lock --file="{{ joinPath .chezmoi.sourceDir "Brewfile" }}"

echo "==> uv tools"
for tool in claude-code-telegram fb-idb specify-cli; do
    uv tool install --quiet "$tool" || true
done

echo "==> npm globals (requires an fnm-managed node on PATH)"
if command -v npm >/dev/null 2>&1; then
    npm install -g --silent \
        @cometix/ccline \
        @openai/codex \
        agent-browser \
        clawhub \
        eas-cli \
        gitnexus \
        mcporter \
        openclaw \
        pnpm || true
fi

echo "==> yazi plugins"
if command -v ya >/dev/null 2>&1; then
    ya pkg add yazi-rs/plugins:smart-enter || true
fi

echo "==> done"
```

Key mechanics:

- **Hash trigger**: the comment `{{ include "Brewfile" | sha256sum }}` is a
  chezmoi template expression. When Brewfile changes, the rendered script
  content changes → chezmoi detects a diff → re-runs the script on next
  `chezmoi apply`.
- **One orchestrator**: brew, uv, npm, and yazi plugins — all in one place.
  No separate bootstrap scripts to remember.
- **Idempotent**: every tool install uses `|| true`, so partial failures don't
  abort the whole run. `brew bundle` itself is idempotent.
- **No `.tmpl` at runtime**: chezmoi renders the template before running;
  the running script is plain bash.

---

## Brewfile refresh cycle

When you install new packages and want them tracked:

```bash
chezmoi cd
brew bundle dump --force --file=Brewfile
git add Brewfile && git commit -m "refresh Brewfile from <machine-name>"
git push
```

On the next `chezmoi apply` (or `chezmoi update`) on any machine, the
Brewfile hash in the install script changes → script re-runs → `brew bundle`
installs any new packages.

Never hand-edit the Brewfile to add packages you haven't actually installed —
`brew bundle dump --force` captures the live state of the machine, which is
the truth.

---

## Composition with other skills

**Doppler** (`skills/doppler/SKILL.md`)

The chezmoi-managed `dot_zshrc` is where the Doppler keychain bootstrap lives:

```bash
export DOPPLER_TOKEN="$(security find-generic-password -a "$USER" -s doppler-cli-token -w 2>/dev/null)"
```

This line is tracked in source and applied to every machine. The actual secret
(the Personal Token) is NOT in dotfiles — it lives in the macOS Keychain and
must be seeded manually on each machine with:

```bash
security add-generic-password -a "$USER" -s doppler-cli-token -w 'dp.pt.xxx' -U
```

That separation is intentional: dotfiles carry the bootstrap pattern, Doppler
carries the actual secrets. Never put real tokens, API keys, or passwords in
dotfiles source.

**flight-deck** (landing / takeoff)

Useful for wrapping up dotfile PRs — landing commits the Brewfile refresh or
config addition, takeoff resumes from a clean state on a new machine.

---

## Anti-patterns

| Anti-pattern | What breaks | Fix |
|---|---|---|
| Editing `~/.zshrc` directly | Source and target drift; next `chezmoi apply` overwrites your changes | `chezmoi edit ~/.zshrc` — always edit source |
| Forgetting `chezmoi apply` after editing source | Source repo and live `$HOME` diverge silently | Always run `chezmoi apply` after source edits |
| Committing real secrets to dotfiles | Secrets leak to Git history and anyone with repo access | Doppler keychain pattern: only the bootstrap line in `dot_zshrc`, token in Keychain |
| Hand-editing Brewfile | Captured state drifts from what's actually installed | `brew bundle dump --force --file=Brewfile` to capture live state |
| Per-machine `doppler login` ceremony | Breaks on OS upgrades, can silently desync | Keychain Personal Token + `DOPPLER_TOKEN` env var (see doppler skill) |
| Direct push to dotfiles' main | Bypasses review; hard to bisect regressions | Open a PR even on personal dotfiles — matches CLAUDE.md PR cadence |
| Editing target, then `chezmoi apply` | Target edits silently overwritten | Rescue: `chezmoi re-add ~/.zshrc` first to pull changes back into source |
| `run_once_` when you mean `run_onchange_` | Script never re-runs after first apply | Use `run_onchange_` for scripts that should re-run when inputs change |

---

## Quick Reference

| Task | Command |
|---|---|
| Install chezmoi | `brew install chezmoi` |
| Bootstrap fresh machine | `chezmoi init --apply git@github.com:USER/dotfiles.git` |
| Preview pending changes | `chezmoi diff` |
| Apply pending | `chezmoi apply` |
| Edit a tracked file (source) | `chezmoi edit ~/.zshrc` |
| Track a new file | `chezmoi add ~/path/to/file` |
| Pull updates from remote | `chezmoi update` |
| Reconcile after editing target | `chezmoi re-add ~/.zshrc` |
| Jump into source repo | `chezmoi cd` |
| Refresh Brewfile | `chezmoi cd && brew bundle dump --force --file=Brewfile` |
| Commit Brewfile update | `git add Brewfile && git commit -m "refresh Brewfile from <machine>"` |
