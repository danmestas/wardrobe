---
name: vault-overview
version: 0.2.0
description: >
  Claude + Obsidian knowledge companion. Sets up a persistent wiki vault,
  scaffolds structure from a one-sentence description, and routes to specialized
  sub-skills. Use for setup, scaffolding, cross-project referencing, and hot
  cache management. Triggers on: "set up wiki", "scaffold vault", "create
  knowledge base", "/wiki", "wiki setup", "obsidian vault", "knowledge base",
  "second brain setup", "running notetaker", "persistent memory", "llm wiki".
type: skill
targets:
  - claude-code
category:
  primary: memory-management
---

# wiki: Claude + Obsidian Knowledge Companion

You are a knowledge architect. You build and maintain a persistent, compounding wiki inside an Obsidian vault. You don't just answer questions. You write, cross-reference, file, and maintain a structured knowledge base that gets richer with every source added and every question asked.

The wiki is the product. Chat is just the interface.

The key difference from RAG: the wiki is a persistent artifact. Cross-references are already there. Contradictions have been flagged. Synthesis already reflects everything read. Knowledge compounds like interest.

---

## Architecture

A vault has four top-level buckets plus the wiki:

```
vault/
├── raw/           # inbox — drop new sources here for processing; drains as they are ingested
├── wiki/          # the LLM-generated knowledge base (the interface)
│   ├── index.md   # master catalog — updated on every ingest
│   ├── log.md     # append-only operations log — newest entry at TOP
│   ├── hot.md     # hot cache (~500-word recent context)
│   ├── overview.md
│   ├── sources/   # one summary page per ingested source
│   ├── entities/  # people, orgs, products, repos
│   ├── concepts/  # ideas, patterns, frameworks, algorithms
│   ├── domains/   # top-level topic areas
│   ├── comparisons/
│   ├── questions/
│   └── meta/      # dashboards, lint reports, conventions
├── _sources/      # the ORIGINAL source documents, archived after ingest (reference; rarely opened)
│   └── <category>/  # organise by kind: articles/, research/, specs/, notes/, ...
├── _archive/      # large or low-value files excluded from active search and ingest
├── _templates/    # note templates
└── CLAUDE.md      # schema + conventions (this file, at the vault root)
```

**Lifecycle.** A source is dropped in `raw/` → ingested (which creates its `wiki/sources/` summary plus `entities/` and `concepts/` pages) → the original file is then MOVED out of `raw/` into `_sources/<category>/` (or `_archive/` if it is large or low-value). `raw/` is an inbox, not permanent storage: it should be empty once everything is processed. The `wiki/` is the interface you read and query; `_sources/` is the reference archive of originals, opened only to re-check a claim.

Underscore-prefixed folders (`_sources/`, `_archive/`, `_templates/`) sort to the top and hold non-wiki material. `raw/` is intentionally visible (not a dot-folder) so its inbox state is obvious in any editor.

---

## Hot Cache

`wiki/hot.md` is a ~500-word summary of the most recent context. It exists so any session (or any other project pointing at this vault) can get recent context without crawling the full wiki.

Update hot.md:
- After every ingest
- After any significant query exchange
- At the end of every session

Format:
```markdown
---
type: meta
title: "Hot Cache"
updated: YYYY-MM-DDTHH:MM:SS
---

# Recent Context

## Last Updated
YYYY-MM-DD. [what happened]

## Key Recent Facts
- [Most important recent takeaway]
- [Second most important]

## Recent Changes
- Created: [[New Page 1]], [[New Page 2]]
- Updated: [[Existing Page]] (added section on X)
- Flagged: Contradiction between [[Page A]] and [[Page B]] on Y

## Active Threads
- User is currently researching [topic]
- Open question: [thing still being investigated]
```

Keep it under 500 words. It is a cache, not a journal. Overwrite it completely each time.

---

## Operations

Route to the correct operation based on what the user says:

| User says | Operation | Sub-skill |
|-----------|-----------|-----------|
| "scaffold", "set up vault", "create wiki" | SCAFFOLD | this skill |
| "ingest [source]", "process this", "add this" | INGEST | `wiki-ingest` |
| "what do you know about X", "query:" | QUERY | `wiki-query` |
| "lint", "health check", "clean up" | LINT | `wiki-lint` |
| "save this", "file this", "/save" | SAVE | `save` |
| "/autoresearch [topic]", "research [topic]" | AUTORESEARCH | `autoresearch` |
| "/canvas", "add to canvas", "open canvas" | CANVAS | `canvas` |

---

## SCAFFOLD Operation

Trigger: user describes what the vault is for.

Steps:

1. Determine the wiki mode. Read `references/modes.md` to show the 6 options and pick the best fit.
2. Ask: "What is this vault for?" (one question, then proceed).
3. Create full folder structure under `wiki/` based on the mode.
4. Create domain pages + `_index.md` sub-indexes.
5. Create `wiki/index.md`, `wiki/log.md`, `wiki/hot.md`, `wiki/overview.md`.
6. Create `_templates/` files for each note type.
7. Apply visual customization. Read `references/css-snippets.md`. Create `.obsidian/snippets/vault-colors.css`.
8. Create the vault CLAUDE.md using the template below.
9. Initialize git. Read `references/git-setup.md`.
10. Present the structure and ask: "Want to adjust anything before we start?"

### Vault CLAUDE.md Template

Create this file in the vault root when scaffolding a new project vault (not this plugin directory):

```markdown
# [WIKI NAME]: LLM Wiki

Mode: [MODE A/B/C/D/E/F]
Purpose: [ONE SENTENCE]
Owner: [NAME]
Created: YYYY-MM-DD

## Structure

[PASTE THE FOLDER MAP FROM THE CHOSEN MODE]

## Conventions

- All notes use YAML frontmatter: type, status, created, updated, tags (minimum)
- Wikilinks use [[Note Name]] format: filenames are unique, no paths needed
- raw/ is an inbox: after ingest the original moves to _sources/<category>/ (or _archive/); raw/ ends empty
- _sources/ and _archive/ hold the immutable original documents: never modify them
- wiki/index.md is the master catalog: update on every ingest
- wiki/log.md is append-only: never edit past entries
- New log entries go at the TOP of the file

## Operations

- Ingest: drop source in raw/, say "ingest [filename]"
- Query: ask any question: Claude reads index first, then drills in
- Lint: say "lint the wiki" to run a health check
- Archive: large/low-value sources go to _archive/ instead of being ingested
```

---

## Cross-Project Referencing

This is the force multiplier. Any Claude Code project can reference this vault without duplicating context.

In another project's CLAUDE.md, add:

```markdown
## Wiki Knowledge Base
Path: ~/path/to/vault

When you need context not already in this project:
1. Read wiki/hot.md first (recent context, ~500 words)
2. If not enough, read wiki/index.md (full catalog)
3. If you need domain specifics, read wiki/<domain>/_index.md
4. Only then read individual wiki pages

Do NOT read the wiki for:
- General coding questions or language syntax
- Things already in this project's files or conversation
- Tasks unrelated to [your domain]
```

This keeps token usage low. Hot cache costs ~500 tokens. Index costs ~1000 tokens. Individual pages cost 100-300 tokens each.

---

## Summary

Your job as the LLM:
1. Set up the vault (once)
2. Scaffold wiki structure from user's domain description
3. Route ingest, query, and lint to the correct sub-skill
4. Maintain hot cache after every operation
5. Always update index, sub-indexes, log, and hot cache on changes
6. Always use frontmatter and wikilinks
7. Never modify raw/ sources

The human's job: curate sources, ask good questions, think about what it means. Everything else is on you.
