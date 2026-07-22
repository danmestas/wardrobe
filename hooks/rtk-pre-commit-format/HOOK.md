---
name: rtk-pre-commit-format
version: 1.1.0
description: >
  Auto-formats Rust code with `cargo fmt --all` and blocks the commit if
  `cargo clippy --all-targets` finds compilation errors (warnings still pass).
  Wired to PreToolUse:Bash; self-gates to `git commit` inside a Cargo project
  and is a silent no-op everywhere else. Only useful in Rust projects with
  rtk-style discipline, but harmless in any repo.
type: hook
targets:
  - claude-code
category:
  primary: workflow
license:
  upstream: Apache-2.0
  source: rtk-ai/rtk@3ba1634
  path: .claude/hooks/bash/pre-commit-format.sh
hooks:
  PreToolUse:
    matcher: Bash
    command: hooks/rtk-pre-commit-format.sh
---

# rtk-pre-commit-format

Pre-commit format-and-error-check for Rust projects, lifted from rtk's own development pre-commit hook. Before a `git commit` runs, this hook:

1. Runs `cargo fmt --all` to auto-format the working tree.
2. Runs `cargo clippy --all-targets` and greps the output for `error:`. If any clippy errors exist, the hook fails and the commit is blocked.

Clippy warnings are allowed — only hard errors block.

## Activation

The wardrobe build wires this hook to `PreToolUse:Bash` unconditionally, so it is invoked for every shell command in every repo. The script therefore gates itself and exits 0 without output unless **both** hold:

1. The command is a `git commit` — read from the hook payload, since a `PreToolUse` matcher cannot express it.
2. The working directory is inside a Cargo project — a `Cargo.toml` is found by walking up from `pwd`, the same way cargo resolves its manifest.

`cargo` missing from `PATH` is also a silent no-op rather than an error.

Without those gates the hook ran `cargo fmt --all` and `cargo clippy --all-targets` on every Bash tool call, which failed loudly in any non-Cargo repo:

```
PreToolUse:Bash hook error
Failed with non-blocking status code: `cargo metadata` exited with an error:
error: could not find `Cargo.toml` in `/path/to/some/go/repo` or any parent directory
```

It is still only *useful* in Rust repos that follow rtk's discipline (zero clippy errors, `cargo fmt` clean tree), but it is now harmless everywhere else, so excluding it from non-Rust outfits is an optimisation rather than a requirement.

Progress and failure messages go to **stderr**. `PreToolUse` stdout is a structured channel; plain text there risks being read as hook output.

## Files

- `hooks/rtk-pre-commit-format.sh` — the cargo fmt + clippy check.

## Source

Vendored from `github.com/rtk-ai/rtk` at commit `3ba1634` (`.claude/hooks/bash/pre-commit-format.sh`). Apache-2.0; see `THIRD_PARTY_LICENSES.md`.
