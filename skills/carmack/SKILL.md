---
name: carmack
version: 0.1.0
description: >-
  The John Carmack lens: minimize the mutable state you have to reason about, do
  the simple thing before the clever one, and treat correctness tooling — static
  analysis, warnings-as-errors, determinism — as non-negotiable. Apply this on
  sprawling mutable state, "we'll clean it up later," debugging by print-
  statement whack-a-mole, silenced compiler warnings, nondeterministic or
  non-reproducible behavior, premature abstraction, perf work that skips
  measurement, and any "what should we actually work on" prioritization call.
  Trigger even when Carmack isn't named — the smell is code whose full set of
  states you can't hold in your head, and effort that isn't ruthlessly focused.
type: skill
targets:
  - claude-code
  - codex
  - gemini
  - pi
category:
  primary: backpressure
---

# The Carmack Lens

John Carmack ships things that have to run correctly at 90 frames a second on
hardware he doesn't control. His engineering is the meeting of two habits most
people only have one of: deep empathy for the machine at the bottom, and
ruthless simplicity and focus at the top. This skill encodes both as questions.

The through-line: **you can only guarantee behavior you can reason about**, so the
whole discipline is about shrinking what you have to reason about — fewer states,
simpler code, deterministic execution — and letting tools catch the rest.

## Iron Law

**You should be able to hold the complete set of states this code can reach in
your head.** Anything that defeats that — hidden mutation, action at a distance,
nondeterminism — is not a style nit. It is the bug you haven't found yet.

---

## The questions

### 1. Can you enumerate every state this can be in?
Most bugs are the program reaching a state the author never pictured. Shrink the
state space until the whole thing is enumerable.
- Ask: how much mutable state does this touch? Could it be a pure function of its
  inputs? If you inlined the callees, could you see every state in one screen?
- Prefer pure functions and local reasoning; push mutation to the edges. When in
  doubt, make the flow of data explicit rather than hiding it in shared state.

### 2. Is this the simple version, or the clever one?
Do the straightforward thing first. Clever earns its place only against a measured,
demonstrated need — not a hypothetical one.
- Ask: is this abstraction paying for itself right now, or is it speculative? Would
  a dumb, obvious implementation be good enough and easier to verify?
- Red flags: a framework introduced for a problem you don't yet have; indirection
  whose only justification is "we might need it later."

### 3. Is the machine trying to tell you something you've silenced?
The compiler and the analyzer see failure modes review never will. Treat their
output as signal, not noise.
- Ask: are warnings treated as errors? Is static analysis actually run, aggressively,
  and its findings driven to zero? Carmack has called adopting static analysis the
  single most valuable thing he did as a programmer.
- Red flags: a wall of ignored warnings; "that warning is a false positive" without
  proof; analysis tooling installed but not enforced.

### 4. Can you reproduce it deterministically?
A bug you can reproduce on demand is nearly fixed; one you can't is a research
project. Design for determinism and replay.
- Ask: given the same inputs, does this produce the same result and the same path?
  Can you capture and replay a session to reproduce a failure exactly?
- Nondeterminism (unordered iteration, uninit reads, race-dependent output) is worth
  hunting down for its own sake, because it destroys reproducibility everywhere else.

### 5. Are you measuring, or guessing?
On anything performance-sensitive, intuition is a hypothesis, not an answer. Profile,
know the machine, let the data pick the target.
- Ask: have you profiled, or are you optimizing what *feels* slow? Do you know the
  actual cost — cache misses, allocations, syscalls — or are you guessing?
- Corollary: don't micro-optimize before you've measured, and don't optimize code
  that isn't hot. Understanding the machine is the point, not cleverness for its own sake.

### 6. Is this even the thing worth doing?
Focus is a first-class engineering skill: it is deciding what *not* to do. Being
busy is not the same as making the important thing happen.
- Ask: is this the highest-leverage thing to work on right now, or just the nearest?
  What are we doing that we could stop doing entirely?
- Applies to features, refactors, and abstractions alike — the cheapest code to
  maintain is the code you talked yourself out of writing.

### 7. Are you being precious about code that should be deleted?
Prototypes are for learning and then throwing away. Don't let sunk cost keep a
design alive past the point it's earned.
- Ask: is this being kept because it's right, or because it was expensive to write?
  Would you write it this way today knowing what you now know?

---

## How to apply

**In review:** walk the diff through the questions. The highest-value findings are
almost always #1 (unnecessary mutable state you can't fully reason about) and #3
(a correctness tool being ignored). Phrase findings as the reduction: "This shares
mutable `x` across three call paths — thread it as a parameter so each path's state
is visible," not just "too much state."

**In design:** state the simplest implementation that could work *first*. Justify
every departure from it with a measured need (perf, correctness) rather than a
predicted one. Decide explicitly what you are *not* building.

**Output shape:** findings ranked by how much they shrink the state you must reason
about, plus any silenced-tooling issues (those are near-automatic fixes). Keep it
focused — this lens is partly about not doing unnecessary work.

## Anti-patterns (when NOT to over-apply)
- **Don't** weaponize "simple" to dodge a genuinely deep abstraction that would hide
  real complexity — that's the `ousterhout` lens, and it wins there.
- **Don't** inline everything into unreadable megafunctions in the name of "seeing all
  the state." Local reasoning is the goal; readability is a constraint on it.
- **Don't** micro-optimize before profiling. #5 forbids the very thing people cite it
  to justify.
- **Don't** treat static analysis as a metric to game. It serves correctness, not a number.

## Complements
- `hickey` — simple-vs-easy at the *design* level; Carmack is the machine-and-state level
- `ousterhout` — complexity and deep modules (where "simple" should yield to abstraction)
- `tigerstyle` — assertions, limits, safety; a close ally on correctness tooling
- `bellard` — minimal *artifact*; Carmack minimizes *state you must reason about*
