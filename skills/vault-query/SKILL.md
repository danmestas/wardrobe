---
name: vault-query
version: 0.2.2
description: >-
  Answer questions using the Obsidian wiki vault. Default skill for "what do you
  know about", "explain", "summarize", "find in wiki", "search the wiki".
  Two-mode router: when qkb is installed and not opted out, escalates from
  curated read (hot.md + index.md + page reads) to qkb's BM25 or graph
  primitives on questions the curated path can't reach. When qkb is opted out
  (QKB_DISABLED=1) or not on PATH, runs as pure curated read with honest gap
  reporting. Supports quick, standard, deep modes; files answers back as wiki
  pages so knowledge compounds. Triggers on: query:, what is, explain,
  summarize, find in wiki, search the wiki, based on the wiki, wiki query
  quick, wiki query deep.
type: skill
targets:
  - claude-code
category:
  primary: context-management
---

# vault-query

The wiki has already done the synthesis work for most questions. Read strategically, answer precisely, file good answers back so the knowledge compounds. When the curated path can't reach an answer and qkb is available, dispatch to qkb's specialized retrieval primitives; when qkb is opted out, accept lower ceiling and report gaps honestly.

---

## Two modes — qkb-augmented vs pure-curated

At session start, detect which mode you're in:

```bash
# qkb is "available" if installed AND not explicitly disabled
if [ "$QKB_DISABLED" != "1" ] && command -v qkb >/dev/null 2>&1; then
  QKB_MODE=augmented
else
  QKB_MODE=pure_curated
fi
```

**Augmented mode (default when qkb is installed):** the curated path is still the default. Reach for qkb when:
- `hot.md` or `index.md` exceeds the Read token budget (~25k tokens)
- The question's answer is on a page not enumerated in `index.md` (cold page)
- The question is relational ("what links to X", "compare X and Y") and a graph traversal is cheaper than reading + cross-referencing pages
- The question uses vocabulary the vault doesn't (vocab mismatch) and BM25 might find the canonical doc via different terms

**Pure-curated mode (qkb opted out or absent):** the curated path is *all you have*. The bench (`bench/results/skill-bench-v4-2026-05-14.html` on the qkb side) shows this mode reaches ~60% coverage on adversarial questions — lower ceiling, but workable for vaults with disciplined `hot.md` / `index.md` hygiene. Report gaps honestly when stuck rather than fabricating.

The rest of this skill is written for both modes. Sections marked with **[qkb]** assume augmented mode; if you're in pure-curated mode, skip them and rely on the curated path with explicit gap acknowledgement.

---

## Answer Discipline — Quote-or-Die

Every factual claim in the answer must be backed by a verbatim quote from a cited source. The v5 bench's top failure (FP-1, against this vault) was retrieval surfacing the canonical `concepts/Briefing Assembler.md` at 0.93 BM25 score while all three skills still answered as if the Briefing Assembler were a PDF-composition microservice over invented "NOTAM Fetcher / Chart Service" subsystems — when in fact it is the Ember Go package in `internal/assembler/` consuming `*pipeline.PipelineRun`. This rule blocks that class of failure at the answer layer rather than at retrieval.

**Rule.** Before claiming X, find a sentence in the cited source that supports X, and include the quote in the answer.

**Format.**

```
The Briefing Assembler is the document-composition step in the Ember
pipeline, not a standalone microservice.
(Source: [[Briefing Assembler]]: "Ember Go package under
internal/assembler/ that consumes *pipeline.PipelineRun and emits
*domain.BriefingDocument.")
```

**If you cannot find a verbatim sentence supporting a claim, drop the claim or rephrase to match what the source actually says.** Do not synthesize past what the corpus contains. If the question can't be answered from quotable evidence, flag the gap honestly (see Gap Handling below).

**Frontmatter is first-class.** A YAML line like `consumes: [[Pipeline Orchestrator]]` counts as a valid verbatim quote for "Briefing Assembler consumes Pipeline Orchestrator output" — quote the YAML line itself. Frontmatter quotes are usually cheaper (fewer tokens) and harder to misrepresent than prose quotes.

**Exceptions.**
- Trivial restatements ("AIRAC is a cycle" when the page title is "AIRAC Cycle" and the first sentence introduces it) don't need an explicit quote — title and lead are implicit citation.
- Cross-page synthesis ("X relates to Y via Z") needs one quote from each page being synthesized, not a meta-quote of the synthesis itself. The synthesis is your claim; the quotes are the evidence each side rests on.
- Quotes can be short — one clause is fine, not the whole paragraph.

**Cost.** ~200–500 output tokens per answer (the quotes themselves), trading against ~5000+ tokens of fabricated content that would otherwise need to be unwound by the reader. The FP-1 case in particular shows this trade is dramatically in favor of quoting.

---

## Questions Cache — Step 0 for all modes

Before any curated read, list `wiki/questions/` and scan filenames for slug-similarity to the user's question. The `questions/` directory IS the answer cache for non-trivial questions previously answered well; a direct hit short-circuits the entire pipeline at ~3k tokens (one page) instead of ~50k (full retrieval + synthesis). This vault currently has 24 question pages — Step 0 is the highest-leverage cheap check available.

**Procedure.**

```bash
ls wiki/questions/ 2>/dev/null
```

Compare each filename to the user's question:

- **Direct match** (filename slug matches the question topic — e.g. user asks about Jeppesen JetPlan and `Research Jeppesen JetPlan.md` exists): Read the page. If `answer_quality: solid` and `validated:` is recent (within ~6 months), synthesize from the page contents and stop. Quote-or-die still applies — quote from the question page itself.
- **Close match** (filename mentions the key entity or concept in the question): Read as a strong hint, then verify against the underlying entity/concept pages before answering. Treat the cached answer as input, not output.
- **No match**: Fall through to the mode's normal procedure.

**Skip Step 0 when:**
- The user explicitly asks for fresh / from-scratch research.
- The question is about state that changes month-to-month (current status, recent events, in-flight work).
- The cached page has `answer_quality: stale` or `status: superseded`.

**Note:** the `ls` call is a cheap no-op (~50 tokens) even when no match is found — don't skip the check just because you expect it to miss. The miss is itself cheap and the hit is dramatically valuable.

---

## Query Modes

Three depths. Choose based on the question complexity.

| Mode | Trigger | Cost | Best for |
|---|---|--:|---|
| **Quick** | `query quick: ...`, simple factual Q | ~1.5k tok | "What is X?", date lookups, things in the hot/question cache |
| **Standard** | default (no flag) | ~3–6k tok | Most questions |
| **Deep** | `query deep: ...`, "thorough", "comprehensive" | ~10k+ tok | Synthesis, comparison, gap analysis |

---

## Quick Mode

Cache funnel. Stop as soon as you have the answer.

0. **Questions cache (Step 0 — see above).** `ls wiki/questions/` and check for a direct slug match against the 24 cached question pages. If `answer_quality: solid`, Read it and synthesize from it. Stop.
1. **Hot cache.** Read `wiki/hot.md`. If it answers, respond and stop.
2. **Question cache via index.** Skim `wiki/index.md` Questions section for cached question pages not surfaced by Step 0's filename scan (e.g. matching by description rather than slug). If a prior question matches, read that page.
3. **[qkb, augmented mode]** If `hot.md` is too large to Read in one shot, run:
   ```bash
   qkb search "$QUESTION" --json -n 5 -c <vault> \
     | jq -r '.[] | select(.file | contains("/wiki/questions/")) | .file'
   ```
   If a question page hits, fetch directly: `qkb get "<path>" --full`.
4. **Index summary.** Read `wiki/index.md` and scan descriptions. If found, respond without opening further pages.
5. **Still nothing?** Say: "Not in quick cache. Run as standard query?" — wait before escalating.

Do not open individual concept/entity pages in quick mode. That's standard mode.

---

## Standard Mode

The cohort's most successful pattern: curated read first, dispatch to qkb when needed.

### 0. Questions cache (see Step 0 section above)

`ls wiki/questions/` and check for slug-match against the 24 cached question pages. If hit, Read the question page, verify freshness (`answer_quality: solid`, recent `validated:`), synthesize, and stop. On miss, proceed to step 1.

### 1. Curated read

- **Read `wiki/hot.md`** if it fits in Read budget. It may already have the answer.
- **Read `wiki/index.md`** to find the most relevant pages. Scan section headers, then descriptions.
- If `hot.md` or `index.md` exceeds the Read budget: jump to step 3 (qkb dispatch) in augmented mode, or use targeted grep on the meta-files in pure-curated mode.
- If the index points to 3–5 named pages: read them. Follow wikilinks to depth-2 for key entities only. No deeper.

### 2. If the curated path is enough, synthesize and stop

- Cite sources with wikilinks: `(Source: [[Page Name]])`.
- Offer to file the answer if synthesis is non-trivial.
- Done.

### 3. **[qkb, augmented mode]** Dispatch when curated read isn't enough

Pick the qkb primitive based on question shape:

**Proper-noun anchor or distinctive vocab** → BM25:
```bash
qkb search "$COMPACT_QUERY" --json -n 8 -c <vault>
```
Compact the query first — strip stopwords, keep proper nouns. Cheapest qkb path (~30s). Wins on Q-D-shape questions in the bench.

**Relational / cold-page / "what does X link to"** → graph:
```bash
qkb graph query "MATCH (a)-[:LINKS_TO]->(b) WHERE a.path = 'wiki/concepts/<seed>.md' RETURN b.id, b.title, b.path LIMIT 20" --json
```
Or for inbound edges, swap `a` and `b` in the MATCH. Bench Q-E (Route Server, cold page) was a graph-uniquely-wins case at 92% vs 58% for BM25.

**Batch read selected pages** → multi-get (cheaper than 3–5 separate `Read` calls):
```bash
qkb multi-get "path1, path2, path3" --md
```

**Ambiguous shape** → start with BM25, escalate to graph if top-5 are weak (all meta-pages, all scores < 0.3, off-topic).

### 4. Triage retrieval results

- **Prefer** `wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/comparisons/`, `wiki/questions/` — synthesis-ready.
- **Demote (don't discard)** `wiki/hot.md`, `wiki/index.md`, `wiki/log.md`, `wiki/meta/*`, `site/content/*` — useful for orientation, not citation-grade.
- **De-dupe** by resolved file path. Filenames may use spaces; qkb URIs may use hyphens — convert via `find wiki/ -iname '<name>.md'` if direct Read fails.

### 5. Read 3–5 of the top candidates

Don't read more than 5 unless the question is deep mode.

### 6. Synthesize with wikilink citations

```text
The FAA NMS NOTAM update path uses OAuth2 client-credentials with 30-min bearer tokens
(Source: [[FAA NMS]], [[AIRAC Delta Polling]]).
```

### 7. Offer to file the answer back

If non-trivial: *"This seems worth keeping. Save as `wiki/questions/<slug>.md`?"*

### 8. Flag gaps honestly

If retrieval was visibly weak (qkb returned sparse hits, curated reads didn't connect): *"I don't have enough on this to answer well. Want me to escalate to deep mode or pivot to a web source?"*

---

## Deep Mode

For synthesis questions, comparisons, or "tell me everything about X" — the kind of question where you'd want broad context, not just top-K.

1. **Orientation.** Read `wiki/hot.md` and `wiki/index.md`.
2. **[qkb, augmented mode]** Broad retrieval:
   ```bash
   qkb search "$QUESTION" --json -n 15 -c <vault>   # quick lexical anchor (50ms)
   ```
   For relational deep-dives, follow up with:
   ```bash
   qkb graph neighbors "doc:<N>" --hops 2 --edge-types LINKS_TO --json
   ```
   The `doc:<N>` integer ID comes from a Cypher lookup by path.
3. **Batch-read** all relevant pages with `qkb multi-get` (cheaper than 8 separate Reads).
4. **[pure-curated mode]** Read all relevant pages via `Read` tool. Accept that you may miss cold pages.
5. **Synthesize comprehensively** with full citations.
6. **Always file deep answers back** — too valuable to lose to chat history.

---

## Question-shape decision tree (quick reference)

Use after the curated read has shown what's missing.

```
                       ┌── proper-noun in question, simple fact?
                       │     → qkb search (BM25), 30s
Question shape ────────┤── relational / "what links to X" / cold page?
                       │     → qkb graph query (Cypher), 40-60s
                       │── synthesis across many pages?
                       │     → curated read + qkb multi-get for batch fetch
                       └── ambiguous?
                             → qkb search first, escalate to graph on weak top-5
```

---

## Token Discipline

Read the minimum needed.

| Source | Cost | When to stop |
|---|---:|---|
| `hot.md` | ~500–25k tok | If it answers; if too large, grep-slice or escalate |
| `index.md` | ~500–25k tok | If you can identify 3–5 relevant pages |
| 3–5 wiki pages | ~300 tok each | When you have enough to answer |
| **[qkb]** `qkb search` | ~50 tok output + ~50ms | Fast first probe |
| **[qkb]** `qkb graph query` | ~100 tok output + ~50ms | For relational/cold lookups |
| **[qkb]** `qkb multi-get N files` | ~300 tok × N | Cheaper than N × `Read` |

In pure-curated mode, the cost story stops at the wiki-pages line — no qkb shell-out is available.

---

## Index Format Reference

The master index (`wiki/index.md`) looks like:

```markdown
## Domains
- [[Domain Name]]: description (N sources)

## Entities
- [[Entity Name]]: role (first: [[Source]])

## Concepts
- [[Concept Name]]: definition (status: developing)

## Sources
- [[Source Title]]: author, date, type

## Questions
- [[Question Title]]: answer summary
```

Scan section headers first to determine which sections to read.

---

## Filing Answers Back

Good answers compound into the wiki. Don't let insights disappear into chat history.

When filing an answer:

```yaml
---
type: question
title: "Short descriptive title"
question: "The exact query as asked."
answer_quality: solid
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [question, <domain>]
related:
  - "[[Page referenced in answer]]"
sources:
  - "[[wiki/sources/relevant-source.md]]"
status: developing
---
```

Then write the answer as the page body. Include citations. Link every mentioned concept or entity.

After filing:
1. Add an entry to `wiki/index.md` under Questions.
2. Append to `wiki/log.md`.
3. **[qkb, augmented mode]** Run `qkb update` so the new page is indexed and graph-linked for next time.

---

## Gap Handling

If the question can't be answered from the wiki:

1. Say clearly: "I don't have enough in the wiki to answer this well."
2. Identify the specific gap: "I have nothing on [subtopic]."
3. Suggest: "Want to find a source on this? I can help you search or process one."
4. Do not fabricate. Do not answer from training data if the question is about the vault's specific domain.

**[qkb, augmented mode]** If curated read returns nothing useful but qkb search returns hits: that's a *navigation* gap, not a *vault* gap — the content exists, the meta-files just don't surface it. Note the gap and consider whether `hot.md` / `index.md` need an update entry.

---

## Why a router, not a single algorithm

The qkb skill-comparison bench (`bench/results/skill-bench-v4-2026-05-14.html`) ran five retrieval paths against an adversarial question set and found no single path dominates. Different question shapes need different primitives:

- BM25 wins on proper-noun anchors and vocab-aligned questions
- Graph wins on relational questions and cold pages
- Curated read wins when meta-files fit and the answer is on a known page
- The full hybrid pipeline (vector + LLM expansion + reranker) didn't beat the cheaper paths on any question and underperformed on synthesis

This skill is the explicit router. Default to curated; dispatch when curated isn't enough; fall back gracefully when qkb is unavailable.

---

## Sibling skills

- **`vault-query-bm25`** — call directly if you know up front the question is a proper-noun lookup and want the fastest path.
- **`vault-query-graph`** — call directly if you know up front the question is relational and want pure graph traversal.

Both can be invoked through this router (sections 3 above) or directly when the question shape is obvious from the user's phrasing.
