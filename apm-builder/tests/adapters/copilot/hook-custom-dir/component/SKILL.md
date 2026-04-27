---
name: guard
version: 1.0.0
description: Pre-tool-use guard
type: hook
targets:
  - copilot
hooks:
  PreToolUse:
    matcher: "Bash"
    command: scripts/guard.sh
---

# Guard

Refuses dangerous Bash invocations.
