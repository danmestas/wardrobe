---
name: vault-lint
version: 0.2.0
description: >
  Health check the Obsidian wiki vault. Finds orphan pages, dead wikilinks,
  stale claims, missing cross-references, frontmatter gaps, empty sections,
  misfiled pages, and catalog gaps (pages absent from a bucket _index.md or the
  master index.md). Creates or updates Dataview dashboards. Generates canvas
  maps. Triggers on: "lint", "health check", "clean up wiki", "check the wiki",
  "wiki maintenance", "find orphans", "wiki audit".
type: skill
targets:
  - claude-code
category:
  primary: context-management
---

# wiki-lint: Wiki Health Check

Run lint after every 10-15 ingests, or weekly. Ask before auto-fixing anything. Output a lint report to `wiki/meta/lint-report-YYYY-MM-DD.md`.

---

## Lint Checks

Work through these in order:

1. **Orphan pages**. Wiki pages with no inbound wikilinks. They exist but nothing points to them.
2. **Dead links**. Wikilinks that reference a page that does not exist.
3. **Stale claims**. Assertions on older pages that newer sources have contradicted or updated.
4. **Missing pages**. Concepts or entities mentioned in multiple pages but lacking their own page.
5. **Missing cross-references**. Entities mentioned in a page but not linked.
6. **Frontmatter gaps**. Pages missing required fields (type, status, created, updated, tags).
7. **Empty sections**. Headings with no content underneath. Only flag a *leaf* heading — one with no content AND no deeper sub-heading nested under it. A heading immediately followed by its own sub-headings is a container, not an empty section (do not flag).
8. **Stale index entries**. Items in `wiki/index.md` (or any `_index.md`) pointing to renamed or deleted pages.
9. **Misfiled pages**. A page whose frontmatter `type` (or primary tag) disagrees with its folder — e.g. a `type: concept` page living in `wiki/entities/`. Also surface (don't auto-move) pages whose classification looks wrong versus their siblings — e.g. `G-AIRMET` filed as an entity when `AIRMET`/`SIGMET` are concepts. Type↔folder mismatch is mechanical; sibling-classification is a judgment call.
10. **Bucket-index gaps**. For each bucket that keeps a hand-maintained `_index.md` (currently `concepts/` and `entities/`), every page file in that folder must appear as a `[[wikilink]]` in that `_index.md`. Flag files present on disk but absent from the catalog. These indexes claim "All X pages in wiki/X/" but drift out of date after ingests — this is the most common silent rot.
11. **Master-index gaps**. Content pages absent from `wiki/index.md`. **Honor the catalog conventions before flagging:** the `## Sources` section lists each ingest's *overview* summary (one bullet per packet under a dated `####` heading), NOT every granular sub-source — so do not flag granular research sub-sources that are rolled up under a packet overview. Concepts and entities ARE listed individually, so flag those.

---

## Computing the Checks (use a script, not per-page reads)

For any non-trivial vault (>~100 pages), do NOT read every page into context to run these checks — that burns the context window. Write a small script (Python) that walks `wiki/**/*.md`, parses YAML frontmatter, and builds the link graph, then print only the derived findings. Gotchas learned in practice:

- **Exclude report/catalog files as link *sources*** when computing dead links and cross-refs: `index.md`, `log.md`, `hot.md`, and everything under `meta/` quote page names as report text and produce false positives.
- **Categorize dead links.** Source-summary pages legitimately link to their raw original as `[[<slug>-raw]]` (plus `.pdf`/`.png` embeds) — those targets live in `_sources/`/`raw/`, not `wiki/`. Separate these "archive pointers" (known pattern) from genuinely missing wiki pages.
- **Strip code fences** before scanning for wikilinks so Dataview/code blocks don't pollute the graph.
- **Bucket detection:** a bucket "has an index" if `wiki/<bucket>/_index.md` exists. Don't invent gaps for buckets without one (`sources/`, `domains/`, `comparisons/`, `questions/`).
- **Verify auto-edits are pure additions.** After a bulk wikilink/cross-ref pass, assert that stripping all `[[`/`]]` from each changed file reproduces the original — proves only brackets were added, no prose mangled.

---

## Lint Report Format

Create at `wiki/meta/lint-report-YYYY-MM-DD.md`:

```markdown
---
type: meta
title: "Lint Report YYYY-MM-DD"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [meta, lint]
status: developing
---

# Lint Report: YYYY-MM-DD

## Summary
- Pages scanned: N
- Issues found: N
- Auto-fixed: N
- Needs review: N

## Orphan Pages
- [[Page Name]]: no inbound links. Suggest: link from [[Related Page]] or delete.

## Dead Links
- [[Missing Page]]: referenced in [[Source Page]] but does not exist. Suggest: create stub or remove link.

## Missing Pages
- "concept name": mentioned in [[Page A]], [[Page B]], [[Page C]]. Suggest: create a concept page.

## Frontmatter Gaps
- [[Page Name]]: missing fields: status, tags

## Stale Claims
- [[Page Name]]: claim "X" may conflict with newer source [[Newer Source]].

## Cross-Reference Gaps
- [[Entity Name]] mentioned in [[Page A]] without a wikilink.

## Misfiled Pages
- [[Page Name]] in `entities/` but `type: concept`. Suggest: move to `concepts/` or fix the type.
- [[G-AIRMET]] filed as entity; siblings AIRMET/SIGMET are concepts. Suggest: reclassify (review).

## Catalog Gaps — Bucket Index
- `concepts/_index.md` missing N of M pages: [[Page A]], [[Page B]], ... Suggest: add under the best-fit heading.
- `entities/_index.md` missing N of M pages: [[Page C]], ...

## Catalog Gaps — Master Index
- `index.md` missing N pages: [[Page A]] (concept), [[Page B]] (entity), ... (sources rolled up under packet overviews are NOT gaps).
```

---

## Naming Conventions

Enforce these during lint:

| Element | Convention | Example |
|---------|-----------|---------|
| Filenames | Title Case with spaces | `Machine Learning.md` |
| Folders | lowercase with dashes | `wiki/data-models/` |
| Tags | lowercase, hierarchical | `#domain/architecture` |
| Wikilinks | match filename exactly | `[[Machine Learning]]` |

Filenames must be unique across the vault. Wikilinks work without paths only if filenames are unique.

---

## Writing Style Check

During lint, flag pages that violate the style guide:

- Not declarative present tense ("X basically does Y" instead of "X does Y")
- Missing source citations where claims are made
- Uncertainty not flagged with `> [!gap]`
- Contradictions not flagged with `> [!contradiction]`

---

## Dataview Dashboard

Create or update `wiki/meta/dashboard.md` with these queries:

````markdown
---
type: meta
title: "Dashboard"
updated: YYYY-MM-DD
---
# Wiki Dashboard

## Recent Activity
```dataview
TABLE type, status, updated FROM "wiki" SORT updated DESC LIMIT 15
```

## Seed Pages (Need Development)
```dataview
LIST FROM "wiki" WHERE status = "seed" SORT updated ASC
```

## Entities Missing Sources
```dataview
LIST FROM "wiki/entities" WHERE !sources OR length(sources) = 0
```

## Open Questions
```dataview
LIST FROM "wiki/questions" WHERE answer_quality = "draft" SORT created DESC
```
````

---

## Canvas Map

Create or update `wiki/meta/overview.canvas` for a visual domain map:

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "file",
      "file": "wiki/overview.md",
      "x": 0, "y": 0,
      "width": 300, "height": 140,
      "color": "1"
    }
  ],
  "edges": []
}
```

Add one node per domain page. Connect domains that have significant cross-references. Colors map to the CSS scheme: 1=blue, 2=purple, 3=yellow, 4=orange, 5=green, 6=red.

---

## Before Auto-Fixing

Always show the lint report first. Ask: "Should I fix these automatically, or do you want to review each one?"

Safe to auto-fix:
- Adding missing frontmatter fields with placeholder values
- Creating stub pages for missing entities
- Adding wikilinks for unlinked mentions
- **Catalog reconciliation** — adding pages absent from a bucket `_index.md` or the master `index.md` under the best-fit existing heading (mechanical; for large batches, fan out one subagent per bucket and verify every name lands exactly once)

Needs review before fixing:
- Deleting orphan pages (they might be intentionally isolated)
- Resolving contradictions (requires human judgment)
- Merging duplicate pages
- **Moving/reclassifying misfiled pages** — a type↔folder mismatch may be a frontmatter typo or a genuine miscategorization; confirm direction before moving files or rewriting `type`
