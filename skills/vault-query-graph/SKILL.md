---
name: vault-query-graph
version: 0.2.0
description: >-
  Pure graph-traversal retrieval over the Flight Planner Obsidian wiki vault.
  Uses qkb's graph layer directly (LINKS_TO / EMBEDS / REFERENCES edges across
  1800+ typed nodes) — no BM25, no vector, no LLM expansion, no rerank. Use
  for entity-relation questions ("what does X link to / depend on / feed"),
  structural mapping ("what's connected to Y"), and following established
  wikilinks across the corpus. Triggers on: vault-query-graph, graph vault
  query, what does X link to, what feeds X, what depends on X, how does X
  relate to Y, graph traversal, walk the graph from X.
type: skill
targets:
  - claude-code
category:
  primary: context-management
---

# vault-query-graph

**Pure graph retrieval.** Uses `qkb graph neighbors` and `qkb graph query` to traverse the wiki's typed link graph directly — no semantic retrieval, no rerank. Distinct from `vault-query-qkb`, which uses `qkb query --graph` (graph as one signal in a hybrid pipeline).

**When this is the right tool:**

- **Entity-relation** — "What does FAA NMS depend on?", "What feeds the Briefing Assembler?", "What links to NOTAM Reform?"
- **Structural mapping** — "Map the relationships around X" — you want the shape, not an answer.
- **Walking from known seeds** — you can name the starting entity/concept; the question is what's connected to it.

**When this is NOT the right tool:**

- Open-ended questions where you don't know which page to start from → use `vault-query-qkb` (the hybrid path will surface candidates).
- Single-page-answer questions ("what is X?") → use `vault-query-bm25` or `vault-query`.
- Cross-source pattern questions where the answer isn't in any one page's wikilinks → use `vault-query-qkb`.

If the graph layer is empty (`qkb graph status` shows 0 nodes), fall back to `vault-query-qkb`.

---

## Scope

- Vault root: `/Users/dmestas/projects/<vault>-kb/wiki`
- qkb index: default (`~/.cache/qkb/index.sqlite`)
- qkb collection: `<vault>` (pin `-c <vault>` for vault scope)
- Graph layer: ~1855 nodes / 14273 edges
- Edge types: `LINKS_TO` is the only edge type populated for this vault (this is normal for Obsidian vaults — Obsidian wikilinks are all `LINKS_TO`; `EMBEDS` and `REFERENCES` slots exist in qkb's schema but only fire for `![[file]]` and frontmatter `related:`/`sources:` entries respectively, which are rarer)
- Node IDs come in two flavors:
  - `doc:<N>` — integer doc IDs assigned by the graph layer (not the same as the `#<hash>` FTS docids returned by `qkb search`)
  - `wikitarget:<Page Name>` — link targets that may or may not have a backing file yet (orphan wikilinks)
- Properties on nodes: `id`, `path` (where it exists), `title`. Label is `:T` (typed-node), not `:Note`.

---

## Default workflow

### Step 1 — Identify seed entities

Read the question. Pick 1–3 named entities or concepts to seed the graph walk. Examples:

- *"How does Briefing Assembler relate to the NOTAM engine?"* → seeds: `Briefing Assembler`, `NOTAM` (concept or entity)
- *"What does FAA NMS depend on?"* → seed: `FAA NMS`
- *"Compare static vs transient data handling"* → seeds: `Transient Aeronautical Data` (the conceptual cleavage page)

### Step 2 — Resolve seed to the graph's node ID

**Important: graph node IDs are NOT the same as FTS docids.** `qkb search` returns hash-style ids (`#4c5866`); the graph layer uses integer-form `doc:<N>` ids. Use Cypher to find the graph node for a given path:

```bash
qkb graph query "MATCH (a) WHERE a.path = 'wiki/entities/FAA NMS.md' RETURN a.id LIMIT 1" --json
# returns e.g. doc:464
```

Or look up by title (less precise — may match multiple nodes with the same title across collections):

```bash
qkb graph query "MATCH (a) WHERE a.title = 'FAA NMS' RETURN a.id, a.path LIMIT 5" --json
```

Capture the integer-form `doc:<N>` id for each seed.

### Step 3 — Walk the graph

For each seed, traverse outgoing edges:

```bash
qkb graph neighbors "doc:464" --hops 1 --edge-types LINKS_TO --json
```

Flags:
- `--hops 1` — direct neighbors (start here). Bump to `2` only when the answer requires transitive connections.
- `--edge-types` — for Obsidian vaults `LINKS_TO` is usually all you need. Add `EMBEDS,REFERENCES` only if the vault makes heavy use of `![[file]]` embeds or frontmatter `related:`/`sources:` arrays.
- `--json` — structured output.

For **structural** questions ("which concepts connect to X?"), prefer Cypher (more flexible than neighbors):

```bash
qkb graph query "MATCH (a)-[:LINKS_TO]->(b) WHERE a.path = 'wiki/entities/FAA NMS.md' RETURN b.id, b.title, b.path LIMIT 20" --json
```

For **inbound** edges ("what links TO X?"):

```bash
qkb graph query "MATCH (a)-[:LINKS_TO]->(b) WHERE b.path = 'wiki/entities/FAA NMS.md' RETURN a.id, a.title, a.path LIMIT 20" --json
```

For **path between two entities**:

```bash
qkb graph query "MATCH path = (a {path: 'wiki/entities/FAA NMS.md'})-[:LINKS_TO*1..3]->(b {path: 'wiki/concepts/Briefing Assembler.md'}) RETURN path LIMIT 5" --json
```

### Step 4 — Filter and resolve to file paths

The neighbor list is the candidate set. Apply hygiene:

- **Prefer**: `wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/comparisons/`, `wiki/questions/`.
- **Demote**: `wiki/hot.md`, `wiki/index.md`, `wiki/log.md`, `wiki/meta/*` — these link broadly and add noise to a graph walk.
- **De-dupe** by resolved file path (graph and FTS can produce the same page via different routes).
- **Cap at 5 reads** even if the graph returns 20 neighbors — graph breadth doesn't justify unbounded reading.

Convert graph results to file paths:

```text
qkb://<vault>/wiki/entities/foo.md
→ /Users/dmestas/projects/<vault>-kb/wiki/entities/foo.md
```

Watch for the **hyphens-vs-spaces mismatch**: graph results may show `Schema-Drift-Manifest.md` while the on-disk file is `Schema-Drift Manifest.md`. Use `find wiki/ -iname '<name>.md'` to resolve if a literal Read fails.

### Step 5 — Read 3–5 selected pages, synthesize

Use the `Read` tool on the filtered candidates. For relational answers, the graph itself often carries the answer — describe what links to what, citing each surviving page:

```text
[[Briefing Assembler]] consumes `RankedNotams` from the upstream grouper
(Source: [[Briefing Assembler]], LINKS_TO → [[Engine vs Assembler Boundary]]).
```

When citing, name the link type when relevant: *"[[FAA NMS]] LINKS_TO [[NOTAM Reform]] and [[FAA SWIM]] — the dependency cluster."*

---

## Two-hop walks (use sparingly)

For "what does X transitively depend on?" questions, walk hops=2:

```bash
qkb graph neighbors "doc:<id>" --hops 2 --edge-types LINKS_TO --json
```

The candidate set explodes (10–50 nodes). Apply much tighter filtering — read the **top-3 most-cited** in the result (highest indegree from the seed), not the full breadth.

For genuinely deep traversal (transitive closure), use Cypher with path patterns — see the Step 3 examples above for the syntax (`-[:LINKS_TO*1..3]->`).

---

## When the graph walk comes back empty or noisy

- **Empty result from `qkb graph neighbors`** — most likely you passed a hash-style FTS docid (`#abc123`) where the graph wants an integer-form id (`doc:464`). Use the Step 2 Cypher lookup to get the right id.
- **Empty result with the right id** — the seed page doesn't link out, or your seed lookup hit a wrong page. Try a different seed (a more central concept). Verify the page exists with `find wiki/ -iname '<name>.md'`.
- **All meta-pages** — the seed sits inside `hot.md` / `index.md`. Pick a more specific concept/entity as the seed instead.
- **Genuinely sparse** — the wiki doesn't link the concept densely yet. Fall back to `vault-query-qkb` which can use vector recall to find conceptual neighbors that aren't wikilinked.

If two retries don't surface useful neighbors, this is the wrong skill for the question. Stop and recommend `vault-query-qkb`.

---

## Filing answers back

For non-trivial relational maps, offer to file as `wiki/questions/<slug>.md`:

```yaml
---
type: question
title: "Short title"
question: "The exact question as asked."
answer_quality: solid
created: YYYY-MM-DD
tags: [question, graph, <domain>]
related:
  - "[[Page]]"
status: developing
---
```

After filing:
1. Add entry to `wiki/index.md` under Questions.
2. Append to `wiki/log.md`.
3. Run `qkb update` so the new page becomes graph-traversable.

---

## Index maintenance

```bash
qkb update          # re-indexes + auto-runs graph link
qkb graph status    # node + edge counts
```

If the graph layer looks stale or wrong:

```bash
qkb graph link
```

(Runs automatically after every `update`; manual invocation rare.)

---

## Guardrails

- **Treat graph hits as candidates, not citations.** Always `Read` the actual file before making source-backed claims. Edge existence ≠ semantic relevance.
- **Don't use this skill for retrieval into the unknown.** If you can't name a seed entity, you can't use the graph — that's `vault-query-qkb`'s job.
- **Resist transitive sprawl.** Hops=2 is a strong claim that the answer is two wikilinks away. Most relational answers are one hop. Use hops=2 only when hops=1 came back insufficient.
- **The graph layer is empty-corpus-safe** — if `qkb graph status` shows 0 nodes, `qkb graph neighbors` returns nothing. Fall back to `vault-query-qkb` (the hybrid path's vector signal works regardless).
- **Don't use qkb to ingest, rewrite, or save wiki pages.** That's `vault-save` / `vault-ingest` territory.
