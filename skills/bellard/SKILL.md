---
name: bellard
version: 0.1.0
description: >-
  The Fabrice Bellard lens: build the smallest self-contained thing that fully
  does the job, get performance from insight instead of hardware, and reuse
  existing machinery instead of reinventing it. Apply this whenever code is
  growing dependencies, frameworks, services, or infrastructure to solve a
  problem that a smaller, sharper implementation could handle — or whenever
  someone says a thing needs a cluster, a big framework, or a rewrite. Use for
  size/complexity audits, "do we really need this dependency/service?"
  questions, performance work where the reflex is to add hardware or caching,
  green-field "should this be one file or a platform?" decisions, and any
  moment the answer is trending toward "that's impractical, you'd need X."
  Trigger even when the user doesn't name Bellard — the smell is scope inflation
  and reaching for resources over insight.
type: skill
targets:
  - claude-code
  - codex
  - gemini
  - pi
category:
  primary: backpressure
---

# The Bellard Lens

Fabrice Bellard built FFmpeg, QEMU, and the Tiny C Compiler — often alone, always
small, and fast enough to embarrass systems that cost a thousand times more. He
computed pi to 2.7 trillion digits on a single desktop while everyone else used
supercomputers. This skill encodes *how he thinks*, as a set of questions to ask
about a design or a diff.

Use it as a review lens and a design lens. It is deliberately biased toward
**less** — fewer bytes, fewer dependencies, fewer moving parts, fewer machines.

## Iron Law

**Before you add anything — a dependency, a service, a framework, a machine —
prove the smaller version can't work.** The default is not "what do we add," it
is "what can we delete or already have." Additions carry the burden of proof.

---

## The seven questions

### 1. Can this be smaller? (Minimize the artifact)
Size is not cosmetic. A smaller artifact is more comprehensible, more portable,
and more embeddable — and small enough to be *understood in one head*.
- Ask: what can be deleted with no loss of function? Can this be one file with no
  dependencies? Could a competent reader hold the whole thing in their head?
- Red flags: a dependency pulled in for one helper function; a framework used for
  10% of its surface; abstractions with a single caller.
- Bellard: TCC is a self-hosting C compiler that started at ~3 kB of source. His
  largest-known-prime program was 438 bytes. QuickJS is a *complete* JS engine
  small enough to embed anywhere.

### 2. What's the clever core — and what can do the rest for free? (Leverage)
Most of a system is plumbing. Find the one genuinely hard idea, and let existing,
well-tested machinery handle everything around it instead of rebuilding it.
- Ask: what existing tool already solves the boring 90%? Am I about to hand-write
  something the OS, the compiler, the stdlib, or an existing binary already does?
- Bellard: QEMU's original speed trick was to chop each CPU instruction into
  micro-ops and let the *host's own C compiler* generate the code — no bespoke
  per-architecture code generator. He reused the compiler he already had.

### 3. Is the scope a complete subset, or a pile of half-features? (Finish the subset)
Minimalism is not "some of the feature." It is a *deliberately narrow boundary*
with everything inside it done fully and correctly.
- Ask: is the boundary drawn on purpose? Inside it, is anything half-done, TODO,
  or "works for the demo"? A small thing with holes is worse than a big complete one.
- Bellard: TinyGL is a compact but faithful subset of OpenGL; TCC compiles a strict
  subset of C but is a *real, self-hosting* compiler; QuickJS is tiny yet complete
  against the language spec.

### 4. Is performance coming from insight or from resources? (Insight over hardware)
Reach for a better algorithm, representation, or math *before* more cores, more
RAM, more cache layers, or a bigger box. Resources hide the problem; insight removes it.
- Ask: what's the actual bottleneck, measured? Is there an asymptotic or
  constant-factor win being skipped in favor of scaling out? Would a smarter data
  layout beat the cache we're about to add?
- Bellard: 2.7 trillion digits of pi on one desktop, where prior records used
  million-dollar supercomputers — the win was a better formula plus careful
  instruction-level work, not a bigger machine.

### 5. Have we done the unglamorous 90%? (Adoption work)
The clever core is ~10% of the effort that matters. Portability, a clean one-command
build, docs, and a sane license are what let anyone actually use and maintain it.
- Ask: does it build in one step on a fresh machine? Runs on more than the author's
  laptop? Documented enough that a stranger could fix a bug? Licensed to be usable?
- Bellard: he engineered QEMU well enough that outside contributors ended up doing
  more than twice his own work on it — because he made it adoptable, not just clever.

### 6. Could someone else own this tomorrow? (Self-contained & handoff-ready)
Design as if you'll hand it off and walk away. Few/no dependencies, minimal build,
readable enough that maintenance doesn't require you.
- Ask: how many things must be installed before this runs? If the author vanished,
  could the project continue? Is anything load-bearing that only lives in one person's head?
- Bellard: TCC, FFmpeg, and QEMU all outgrew him and are maintained by others — by
  design. He ships, opens it, and moves to the next problem.

### 7. Is "that's impossible/impractical" actually the interesting path? (Prove it)
When a plan gets dismissed as needing a cluster, a rewrite, or a heavyweight
framework, treat that as a hypothesis to test, not a settled fact.
- Ask: has anyone actually tried the small version, or are we cargo-culting the
  heavy one? What would it take to prove the lean approach *can't* work?
- Bellard, in his own words: he enjoys challenging problems, and when others say
  something is impossible he finds it interesting to prove otherwise. A PC emulator
  running Linux in pure JavaScript (JSLinux) looked impossible until he shipped it.

---

## How to apply

**In review:** walk the diff/design through the seven questions. Any "no" is a
finding. Phrase findings as the smaller alternative, not just criticism:
"This pulls in <dep> for one function — inline the ~15 lines and drop the dependency."

**In design:** state the clever core in one sentence first. Everything that isn't
that core should be either an existing tool (Q2) or deleted (Q1). Then draw the
subset boundary (Q3) before writing anything.

**Output shape:** a short list of findings, each with (a) the question it fails,
(b) the concrete smaller alternative, (c) rough effort. Lead with the biggest
size/complexity win. Don't pad — this lens should practice what it preaches.

## Anti-patterns (when NOT to over-apply)
- **Don't** shrink code into unreadable cleverness. Small serves comprehension; if
  golfing hurts clarity, you've missed the point (see the `ousterhout` lens for
  the complexity side).
- **Don't** cut tests, assertions, or safety to save lines — that's the `tigerstyle`
  and `hipp` domain, and it wins over raw minimalism.
- **Don't** reinvent something mature and well-maintained just to remove a
  dependency (Q1 and Q6 must both hold — a tiny bespoke reimplementation you now
  own forever can be *less* handoff-ready than a boring, trusted dep).
- **Don't** delay shipping for one more byte. Bellard ships, then iterates.

## Complements
- `ousterhout` — module depth & complexity (design-time abstraction)
- `hipp` — durability, test rigor, backwards compatibility
- `tigerstyle` — safety, assertions, static limits
- `norman` — human-facing affordances & error design

`bellard` is the counterweight that keeps the others from justifying bloat: it
asks whether the whole thing could be an order of magnitude smaller and still win.
