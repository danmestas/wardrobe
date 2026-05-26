#!/usr/bin/env bash
# SessionStart hook for SPDD. Injects the using-spdd skill as additional context.
# Reads hook JSON from stdin, writes hook JSON to stdout, and always exits 0.

# shellcheck shell=bash
set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../_lib/fail-safe.sh
source "${SCRIPT_DIR}/../../_lib/fail-safe.sh" 2>/dev/null || {
  trap 'exit 0' ERR
}
failsafe::trap_errors 2>/dev/null || true

input="$(cat 2>/dev/null || true)"
cwd="${PWD}"
if command -v jq >/dev/null 2>&1; then
  parsed_cwd="$(printf '%s' "${input}" | jq -r '.cwd // empty' 2>/dev/null || true)"
  if [[ -n "${parsed_cwd}" ]]; then
    cwd="${parsed_cwd}"
  fi
fi

if [[ -f "${cwd}/.agent-config/spdd.disabled" ]]; then
  exit 0
fi

skill_file=""
candidates=(
  "${cwd}/.claude/skills/using-spdd/SKILL.md"
  "${SCRIPT_DIR}/../skills/using-spdd/SKILL.md"
  "${SCRIPT_DIR}/../../../skills/using-spdd/SKILL.md"
)
[[ -n "${CLAUDE_PROJECT_DIR:-}" ]] && candidates=("${CLAUDE_PROJECT_DIR}/.claude/skills/using-spdd/SKILL.md" "${candidates[@]}")
[[ -n "${CLAUDE_PLUGIN_ROOT:-}" ]] && candidates+=("${CLAUDE_PLUGIN_ROOT}/skills/using-spdd/SKILL.md")
[[ -n "${CURSOR_PLUGIN_ROOT:-}" ]] && candidates+=("${CURSOR_PLUGIN_ROOT}/skills/using-spdd/SKILL.md")

for candidate in "${candidates[@]}"; do
  if [[ -n "${candidate}" && -f "${candidate}" ]]; then
    skill_file="${candidate}"
    break
  fi
done

if [[ -z "${skill_file}" ]]; then
  exit 0
fi

skill_content="$(cat "${skill_file}" 2>/dev/null || true)"
if [[ -z "${skill_content}" ]]; then
  exit 0
fi

escape_json() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  s="${s//$'\n'/\\n}"
  s="${s//$'\r'/\\r}"
  s="${s//$'\t'/\\t}"
  printf '%s' "${s}"
}

context="$(escape_json "${skill_content}")"
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "${context}"

exit 0
