---
name: hickey
version: 0.1.0
description: >-
  The Rich Hickey lens: pursue simple (un-braided, one role) over easy (familiar,
  near-at-hand), decomplect concerns that got tangled together, and separate
  value, identity, state, and time. Apply this whenever "easy," "convenient," or
  "it's what we already use" is doing the work of justifying a design; when state
  is braided into logic, policy into mechanism, or data into behavior; when
  object-soup would be plainer as data; and when a hard design decision is being
  made at the keyboard under time pressure instead of thought through first.
  Trigger even when Hickey isn't named — the smell is complecting, and confusing
  "easy" with "simple."
type: skill
targets:
  - claude-code
  - codex
  - gemini
  - pi
category:
  primary: backpressure
---

# The Hickey Lens

Rich Hickey's whole body of talks argues one uncomfortable point: most of our
complexity is self-inflicted, chosen because something was *easy* (familiar, close
to hand) rather than *simple* (one concept, un-braided). This skill turns that
argument into questions you can ask about a design.

The core distinction, which everything else hangs off:

- **Simple** = *un-complected* — one role, one task, one concept, not braided
  together with others. It is **objective**: you can count the things intertwined.
- **Easy** = *near-at-hand, familiar, within our current ability*. It is
  **subjective** and relative to you.

They are different axes. Something can be easy and complex (most convenient tools),
or simple and hard (worth it). We reliably choose easy and pay for it in complexity
we can no longer remove.

## Iron Law

**Choose simple over easy, every time — even when simple is harder to do today.**
The easy choice compounds: complecting is cheap to add and expensive-to-impossible
to pull apart later. Simplicity is the only thing that keeps a system changeable.

---

## The questions

### 1. Is this simple, or just easy?
The most important discrimination in the whole lens. Easy feels good because it's
familiar; that says nothing about whether it's simple.
- Ask: how many distinct concerns are braided together here? Is this close-to-hand
  (easy) or actually un-complected (simple)? Would it still be simple to someone who
  didn't already know the tool?
- Red flag: a choice defended with "it's convenient," "it's what we know," or "it's
  less typing" — all arguments about *easy*, none about *simple*.

### 2. What's complected here that could be pulled apart?
"Complect" = to braid together. Find the braids and separate the strands.
- Common braids to look for: state tangled with identity; data tangled with behavior;
  what tangled with how; policy tangled with mechanism; and time tangled with value.
- Ask: could each of these be its own thing, composed at the edges, rather than fused?

### 3. Could this be plain data instead of a bespoke construct?
Information is simple; wrapping it in classes, methods, and ceremony usually complects
it with behavior. Prefer values and generic data structures.
- Ask: does this need to be an object, or is it just information that some code cares
  about? Would a plain immutable map/record be simpler and more composable?

### 4. Have you separated value, state, identity, and time?
A value is immutable. State is the value an identity has *at a point in time*. Fusing
them (place-oriented, mutate-in-place programming) is a root source of complexity.
- Ask: are you overwriting values, or associating an identity with a succession of
  immutable values over time? Immutable values can be shared, cached, and reasoned
  about freely; mutable places cannot.

### 5. Are you judging the artifact, or the act of construction?
What matters is the running system (the artifact), not how easy it was to type. Ease
of construction is a poor proxy — often an inverse one — for quality of result.
- Ask: are we picking this because the *code we write* is short/familiar, or because
  the *system we get* is simpler to understand, change, and operate?

### 6. Did you actually think about this, or just start typing?
Hard problems deserve real thought before implementation. "Hammock-driven development":
load the problem fully, then step away and let the background mind work it.
- Ask: has this design been reasoned through, or are we typing our way to a decision?
  Tests and a REPL are guardrails and feedback — they are not a substitute for thinking.

### 7. Do you know the tradeoffs, or only the benefits?
As Hickey needles us: we tend to know the benefits of everything and the tradeoffs of
nothing. Every choice here should come with its cost stated.
- Ask: what does this approach cost, not just what does it give? If you can't name the
  tradeoff, you haven't finished evaluating the option.

---

## How to apply

**In review:** for each design choice, separate the two axes out loud — is the argument
for it about *simple* or about *easy*? Then hunt for braids (question 2) and name each
one as a concrete "separate X from Y" finding.

**In design:** before implementing anything hard, do question 6 first — think it through
away from the keyboard. Then design for question 4: values immutable, state as identity-
over-time, concerns un-braided. State the tradeoff of each choice (question 7).

**Output shape:** a list of complecting findings, each naming the two things braided
together and the simpler decomposition — plus a flag on any decision defended purely on
"easy" grounds. Prefer removing braids over adding layers.

## Anti-patterns (when NOT to over-apply)
- **Don't** confuse terse with simple. Golfing code smaller can *increase* complecting;
  that's `bellard`'s domain and it's constrained by readability there too.
- **Don't** decomplect into a sprawl of thin indirection. The goal is fewer braids, not
  more layers — `ousterhout` guards against shallow-module proliferation.
- **Don't** turn "think first" into analysis paralysis. Hammock time is for genuinely hard
  problems, not every one-liner.
- **Don't** treat immutability as free; account for its costs honestly (see `helland`).

## Complements
- `ousterhout` — complexity and deep modules; allied — Hickey owns the *simple* axis,
  Ousterhout the *interface-depth* axis
- `helland` — value/immutability at the distributed-data level
- `carmack` — state minimization at the machine level (a concrete instance of question 4)
- `bellard` — the minimal artifact
