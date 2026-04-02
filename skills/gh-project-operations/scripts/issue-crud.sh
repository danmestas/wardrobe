#!/bin/bash
# skills/gh-project-operations/scripts/issue-crud.sh

# Create a new issue
# Args: title, body, labels, assignee
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local assignee="$4"

  local cmd="gh issue create --title \"$title\" --body \"$body\""

  if [ -n "$labels" ]; then
    cmd="$cmd --label \"$labels\""
  fi

  if [ -n "$assignee" ]; then
    cmd="$cmd --assignee $assignee"
  fi

  echo "$cmd"
}

# List issues with optional filter
# Args: filter (e.g., "is:open label:bug")
list_issues() {
  local filter="$1"
  local cmd="gh issue list"

  if [ -n "$filter" ]; then
    cmd="$cmd --search \"$filter\""
  fi

  echo "$cmd"
}

# Update an issue
# Args: issue_number, title, body, labels
update_issue() {
  local issue_number="$1"
  local title="$2"
  local body="$3"
  local labels="$4"

  local cmd="gh issue edit $issue_number"

  if [ -n "$title" ]; then
    cmd="$cmd --title \"$title\""
  fi

  if [ -n "$body" ]; then
    cmd="$cmd --body \"$body\""
  fi

  if [ -n "$labels" ]; then
    cmd="$cmd --add-label \"$labels\""
  fi

  echo "$cmd"
}

# Delete an issue
# Args: issue_number
delete_issue() {
  local issue_number="$1"
  echo "gh issue delete $issue_number --yes"
}
