#!/usr/bin/env bash
# Auto-format Rust code before commits.
# Hook: PreToolUse:Bash
#
# The matcher this hook is wired with is a blunt "Bash", so it is invoked for
# every shell command in every repo, not just `git commit` in Rust projects.
# Both gates below are load-bearing: without them the hook runs `cargo fmt` and
# `cargo clippy` on every Bash tool call, which fails loudly in any non-Cargo
# repo ("could not find `Cargo.toml` in ... or any parent directory") and is
# needlessly slow even where it succeeds.

set -uo pipefail

payload="$(cat 2>/dev/null || true)"

# Gate 1: only act on an actual `git commit`. The command has to be read out of
# the hook payload because a PreToolUse matcher cannot express it.
command_text="$(
  printf '%s' "$payload" | /usr/bin/python3 -c '
import json, sys
try:
    print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))
except Exception:
    print("")
' 2>/dev/null || true
)"

case "$command_text" in
  *"git commit"*|*"git "*" commit"*) ;;
  *) exit 0 ;;
esac

# Gate 2: only act inside a Cargo project. Walking up from the working directory
# for a Cargo.toml matches how cargo itself resolves the manifest, so the hook
# activates exactly where `cargo fmt` would have worked anyway.
dir="$(pwd -P)"
manifest=""
while [ -n "$dir" ]; do
  if [ -f "$dir/Cargo.toml" ]; then
    manifest="$dir/Cargo.toml"
    break
  fi
  [ "$dir" = "/" ] && break
  dir="$(dirname "$dir")"
done
[ -n "$manifest" ] || exit 0

command -v cargo >/dev/null 2>&1 || exit 0

# Progress and failure text go to stderr: PreToolUse stdout is a structured
# channel, and stray plain text there risks being read as hook output.
echo "Running Rust pre-commit checks..." >&2

cargo fmt --all

if cargo clippy --all-targets 2>&1 | grep -q "error:"; then
    echo "Clippy found errors. Fix them before committing." >&2
    exit 1
fi

echo "Pre-commit checks passed (warnings allowed)" >&2
