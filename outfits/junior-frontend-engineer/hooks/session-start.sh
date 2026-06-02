#!/bin/bash
# junior-frontend-engineer session start hook
# Injects the orchestrator skill into every new session started with this outfit

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$(dirname "$SCRIPT_DIR")/skills"
ORCHESTRATOR_SKILL="$SKILLS_DIR/orchestrator/SKILL.md"

if ! command -v jq >/dev/null 2>&1; then
  echo '{"priority": "INFO", "message": "junior-frontend-engineer: jq is required for the session-start hook but was not found on PATH. Install jq (e.g. `brew install jq` or `apt-get install jq`) to enable orchestrator injection. The outfit is still active."}'
  exit 0
fi

if [ -f "$ORCHESTRATOR_SKILL" ]; then
  CONTENT=$(cat "$ORCHESTRATOR_SKILL")
  jq -cn \
    --arg message "junior-frontend-engineer outfit loaded. Orchestrator active:

$CONTENT" \
    '{priority: "IMPORTANT", message: $message}'
else
  echo '{"priority": "INFO", "message": "junior-frontend-engineer: orchestrator SKILL.md not found. Outfit is active but orchestrator knowledge was not injected."}'
fi
