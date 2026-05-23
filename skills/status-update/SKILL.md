---
name: status-update
description: Format a status update, progress report, summary of work, or explanation of how concerns are being addressed — in plain prose suitable for handoff to a non-technical stakeholder. Use whenever the user asks for a status update, an explanation of work, a summary of what's been done, or how something is being addressed. The output should read like a confident pilot-engineer wrote it, not an AI.
---

# Status-update format

Plain-language status updates that could be forwarded to a stakeholder
(client, subject expert, partner team) as-is, without rewriting.

## The shape

Pattern: **restate the concern → name the fix → describe the mechanism**. One block per concern.

```
**1. "Quoted version of the concern, in their words."**

One paragraph that validates the concern is real and restates it
plainly. Two sentences typically — just enough that the reader
knows you understood what they actually said, not a paraphrase
that drifts.

One or two more paragraphs describing the fix and how it works.
Concrete. Names the mechanism without engineering jargon. Says
what changes for the reader, not what changes in the codebase.

**2. "Next concern, in their words."**

Same pattern. Same length.

**3. "Third concern, in their words."**

Same pattern. Use a bullet list ONLY if the answer is genuinely
enumerable — for example, listing the contents of an evidence
bundle. Don't use bullets to chop prose into pieces.
```

End with a single follow-up question if there's a choice the reader
needs to make. Otherwise just stop. No "hope this helps", no
trailing summary that restates what was said.

## Voice

- **Plain prose.** Full sentences. The reader is reading, not skimming.
- **Confident, not hedging.** "Real concern" not "you make a fair point". "The fix is" not "we could potentially explore".
- **Restate concerns in their words, not yours.** If the stakeholder said "the brief is unusable", don't restate it as "the brief presents discoverability challenges". Quote them.
- **Pilot-engineer voice.** Talk like a working professional explaining a fix to a colleague, not a vendor selling a feature.

## Vocabulary to avoid

These mark the output as AI-written or eng-jargon. Replace each with the everyday equivalent.

| Avoid | Use instead |
|---|---|
| blast radius | what breaks if this goes wrong |
| seams, decoupled, monolith | boundaries, separate, single program |
| stripping enum, type-narrowing | (don't mention — implementation detail) |
| leverage | use |
| utilize | use |
| furthermore, moreover, additionally | and / also / nothing |
| in order to | to |
| robust, comprehensive, holistic | (delete — these say nothing concrete) |
| ensure that | make sure / so that |
| facilitate | help / let / make it possible |
| paradigm, modality, surface area | (almost always deletable) |

## Formatting rules

- **Numbered + bold headlines** with the concern quoted. Three-deep maximum.
- **No H2/H3 decoration.** Headers exist to organize content the reader will navigate; they don't exist to break up paragraphs. If a section only has one paragraph under it, the header is decoration — delete it.
- **Bullets earn their place.** A bullet is right when the items are parallel facts that don't connect with conjunctions. Prose is right when the items relate causally ("X, which means Y, so Z").
- **Tables for tabular data only** — when there's a clear axis of comparison (option A vs option B across columns, before vs after, tier vs feature). Not for paragraphs disguised as rows.
- **No emoji** unless the stakeholder uses them first.

## When NOT to use this format

- **Pure code review or technical-only audiences** where the conversation is about implementation details and the reader wants the jargon. Pilot-engineer voice still applies, but the concern-restate framing is overkill.
- **One-line status checks** ("CI green?" "yes, merged, branch deleted"). Don't ceremoniously concern-restate a yes/no.
- **Internal scratch notes** that aren't going to be read by anyone but you and the user. The format is for handoff-quality output; don't pay its cost when there's no handoff.

## Worked example

Stakeholder said three things:
1. "The product can't be used until the day before flight."
2. "Updates to one part break unrelated parts."
3. "I need to be able to verify every decision."

Good output:

```
**1. "If Ember needs a full flight plan, it's useless until the day before flight."**

Lou's right. Pilots don't have an ICAO flight plan until shortly
before they fly, and most dispatchers don't speak FPL fluently. If
the only way to get anything out of Ember is to hand it a complete
FPL, nobody can use it day-1.

The fix is that Ember accepts whatever context you have, not
all-or-nothing. Just give it an airport and you get categorized
NOTAMs and current weather. Add a time window and Ember filters
NOTAMs to that window. [... etc — concrete, walks through what the
user can do at each step ...]

**2. "If everything's tangled together, a NOTAM change breaks the brief."**

Real concern. The way we keep that from happening is that NOTAMs,
weather decode, classification, assembly, and rendering are
separate code modules with contracts at their boundaries. [...]

**3. "I need to be able to prove everything we build."**

This is a hard requirement, not a nice-to-have. Every brief can
ship with an evidence bundle — a directory of files sitting
alongside the brief itself:

- The exact inputs that were handed to Ember
- The raw upstream response before Ember touched anything
- [... etc — bullets earn their place here because they're parallel
  artifact descriptions ...]
```

Bad output (what NOT to do):

```
## Status Update

### Day-1 Functionality
We have addressed the day-1 functionality concern through a robust
tiered input model that leverages progressive disclosure to ensure
that users can access core functionality without requiring complete
flight plan information.

### Architectural Decoupling
To facilitate independent evolution of subsystems, we have
implemented a decoupled architecture with well-defined seams [...]
```

What's wrong with the bad version: stacked decoration headers,
"leveraged / ensure / facilitate / decoupled" jargon, doesn't quote
the concern, reads like a vendor pitch.
