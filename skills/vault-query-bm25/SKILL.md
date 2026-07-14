---
name: vault-query-bm25
version: 0.1.0
description: >-
  Fast BM25 (lexical-only) retrieval over the Flight Planner wiki via qkb.
  No LLM, no graph, no rerank — cheap and deterministic. Use for known-term
  questions (proper nouns, acronyms, exact phrases), AB-test baselines
  against the full pipeline, and quick smoke checks. Triggers on:
  vault-query-bm25, bm25 vault query, lexical vault search, fast keyword
  search the wiki, qkb bm25, search the wiki without LLM.
type: skill
targets:
  - claude-code
category:
  primary: context-management
---

# vault-query-bm25

Lexical retrieval only. Use when the answer's anchor words are likely present in the corpus verbatim — proper nouns, acronyms, exact phrases. For prosey, conceptual, or multi-hop questions, prefer `vault-query-qkb` (adds LLM query expansion, vector recall, graph expansion, and cross-encoder rerank).

## Scope

- Vault root: `/Users/dmestas/projects/<vault>-kb/wiki`
- qkb index: default (`~/.cache/qkb/index.sqlite`) — the user's machine-wide qkb DB
- qkb collection: `<vault>` (this vault's slice)

The default qkb DB hosts every collection on the machine. This skill always passes `-c <vault>` so results stay scoped to the vault. Drop or swap `-c` to reach other collections; index-wide ops (`update`, `status`) span every collection.

## Default workflow

1. **Rewrite the user question as compact keywords.** BM25 has no query expansion — prosey questions get weak hits. Strip stopwords and verbs; keep proper nouns, acronyms, technical terms, and the 2-4 most discriminative content words.

   ```text
   User: "What are the guardrails around schema drift in our aviation data sources?"
   Compact: "schema drift manifest fingerprint aviation data"

   User: "How does FAA NMS handle NOTAM updates?"
   Compact: "FAA NMS NOTAM updates"   # proper nouns dominate; keep verbatim
   ```

2. **Run BM25 search:**

   ```bash
   qkb search "$COMPACT_QUERY" --json -n 10 -c <vault>
   ```

3. **Apply result hygiene:**
   - De-duplicate by resolved file path before reading.
   - Prefer `wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/questions/`, `wiki/comparisons/` — synthesis-ready pages.
   - Demote (don't discard) `hot.md`, `index.md`, `log.md`, `wiki/meta/*`. Useful for orientation, not citation-grade evidence.
   - If top hits are empty, all duplicates, or only meta/hub pages: retry with exact proper nouns/acronyms only, then with the primary keywords plus 2-4 domain terms. If still sparse, escalate to `vault-query-qkb`.

4. **Convert qkb URIs to file paths:**

   ```text
   qkb://<vault>/wiki/entities/foo.md
   -> /Users/dmestas/projects/<vault>-kb/wiki/entities/foo.md
   ```

   Strip the `qkb://<vault>/` prefix and prepend the vault root. Filenames may contain spaces — pass them literally to `Read`.

5. **Read selected files** with the `Read` tool. 3–5 is usually plenty; if BM25 is the right tool for the question, the top few hits will dominate.

6. **Synthesize with wikilink citations**, same shape as `vault-query`:

   ```text
   (Source: [[Page Title]])
   ```

## When BM25 is the right tool

| Situation | This skill | vault-query-qkb |
|-----------|:---:|:---:|
| Answer anchors on proper nouns / acronyms / exact phrases | ✅ | |
| Smoke check ("does the vault have anything about X?") | ✅ | |
| Cheap AB-test baseline against the full pipeline | ✅ | |
| Cost-sensitive: high query volume, tight latency budget | ✅ | |
| Conceptual / prosey question, no obvious keyword anchor | | ✅ |
| Multi-hop synthesis, comparison, gap analysis | | ✅ |
| Vocabulary mismatch likely (user words ≠ vault words) | | ✅ |

Cost: BM25 is ~50ms wallclock per query, ~50 tokens of output. The full qkb pipeline is 5–30s and an order of magnitude more output.

## AB test protocol (vs `vault-query` / `vault-query-qkb`)

When the user asks for a comparison, report:

- Query text (verbatim).
- Compact keyword query actually used.
- qkb command used.
- Top hits: title, path, score.
- Files actually read.
- Wall-clock time end-to-end.
- Whether BM25 alone was sufficient or escalation was needed.

Don't tune queries mid-test. Don't edit the vault mid-test.

## Index maintenance

```bash
qkb update          # re-index changed files (spans all collections)
qkb status          # doc + embedding status
```

BM25 doesn't need embeddings — `qkb search` runs purely on the FTS5 index, which `update` keeps fresh. Do NOT run `qkb embed` from this skill; that's the vector pipeline's concern.

## Guardrails

- Treat BM25 output as retrieval hints, not citations by itself. Always `Read` the actual wiki files before making source-backed claims.
- Do not use this skill to ingest, rewrite, or save wiki pages. That's `vault-save` / `vault-ingest` territory.
- Lexical retrieval has known blind spots — paraphrase, synonyms, conceptual indirection. When user vocabulary doesn't match the vault's, escalate to `vault-query-qkb`. Don't fabricate to fill the gap.
- This skill complements the full pipeline; it does not replace it. Keep `vault-query-qkb` as the default for non-trivial questions.
