---
name: helland
version: 0.1.0
description: >-
  The Pat Helland lens: treat durable data as immutable, append-only facts that
  carry their own identity and version; and design across service, machine, or
  org boundaries assuming you cannot have distributed transactions — only
  idempotent, at-least-once messages that must be reconciled. Apply this on
  in-place updates and overwrites, "just UPDATE the row," two-phase commit or
  distributed transactions at scale, exactly-once delivery assumptions, shared
  mutable state across services, and any data that crosses a boundary of service,
  machine, org, or time. Trigger even when Helland isn't named — the smell is
  mutation-in-place and pretending distributed systems can be transactional.
type: skill
targets:
  - claude-code
  - codex
  - gemini
  - pi
category:
  primary: backpressure
---

# The Helland Lens

Pat Helland has spent decades writing the plain-language field guide to large data
systems — immutability, idempotence, and what you actually give up when data leaves
one machine. This skill encodes his recurring principles as questions to ask of any
system that stores or moves data.

Two ideas anchor everything:

- **Immutability changes everything.** Storage is cheap; the truth is a growing set
  of immutable facts. You append; you do not overwrite. *Accountants don't use erasers.*
- **Inside vs outside.** Data *inside* a service is private, mutable, current, and can
  be relational. Data that goes *outside* — across a service, machine, org, or time
  boundary — is immutable, versioned, and self-identifying, like a published document.
  Confusing the two is the source of a great deal of distributed-systems pain.

## Iron Law

**Durable data is append-only, and data that crosses a boundary is immutable,
versioned, and self-identifying.** You record new facts rather than destroying old
ones, and once a fact has left home you never reach back and mutate it — you publish
a new version.

---

## The questions

### 1. Are you overwriting, or appending?
An in-place update destroys history and the ability to audit, cache, replay, or
time-travel. Prefer recording a new fact over mutating an old one.
- Ask: does this `UPDATE`/overwrite throw away information someone might need later?
  Could it be an append with a version or timestamp instead?
- Payoff: append-only data can be freely shared and cached because it never changes
  under you, and the log of facts becomes a source of truth you can re-derive from.

### 2. Is this data "inside" or "outside"?
The single most useful classification in the lens. Inside data plays by database
rules; outside data plays by document rules. Don't apply one's assumptions to the other.
- **Inside**: private to one service, mutable, "now," may be normalized/relational.
- **Outside**: shared across a boundary, immutable, versioned, has identity, self-describing.
- Ask: which is this? Is something treating a piece of outside data as if it were a
  mutable inside row (or vice versa)?

### 3. Does every message survive being delivered twice?
At scale, delivery is at-least-once. Exactly-once is a comforting fiction. Receivers
must therefore be idempotent.
- Ask: if this message/operation arrives twice, is the outcome the same as once? How
  is duplicate detection done — by a stable identity/key on the message?
- Red flag: any handler that assumes it will see each message exactly once.

### 4. Are you assuming a distributed transaction you can't have?
Across independent services you generally cannot hold a transaction. The pattern is
entities plus workflow plus reconciliation — not a distributed lock.
- Ask: does correctness here depend on two systems committing atomically together? Can
  it be restructured as independent local commits plus messaging and reconciliation?
- Red flag: two-phase commit or a distributed transaction proposed as the load-bearing
  mechanism at scale.

### 5. Does this fact carry its own identity and version?
For outside data to be referenced immutably, it needs a key (identity) and a version.
That's what lets others cache it, point at a specific version, and reason about staleness.
- Ask: can this datum be named and pinned to a version? Or is it an anonymous blob whose
  meaning depends on *when* you happened to read it?

### 6. Are you locking when you should be reconciling?
At scale you act on possibly-stale memories, make guesses, and occasionally have to
apologize — i.e. compensate. That's normal business reality, not a failure of rigor.
- Ask: is strong, synchronous consistency truly required here, or is eventual +
  reconciliation (with a compensating action for the rare conflict) the honest design?
- Note: the apology/compensation path is real work — design it, don't hand-wave it.

### 7. Can you rebuild derived state from the log of facts?
If the immutable facts are the truth, everything else — indexes, aggregates, caches,
materialized views — is derived and should be re-derivable.
- Ask: if a derived view were lost, could it be rebuilt purely from the append-only
  facts? If not, some truth is hiding in a mutable place where it shouldn't be.

---

## How to apply

**In review:** first classify each piece of data as inside or outside (question 2) —
most findings fall out of that. Then flag in-place mutations of would-be facts (1),
non-idempotent message handlers (3), and any assumed distributed transaction (4).

**In design:** decide the boundaries first, because the boundary is what makes data
"outside" and therefore immutable/versioned/identified. Make cross-boundary messages
idempotent by construction. Treat the append-only fact log as truth and everything
else as a re-derivable view (7).

**Output shape:** findings grouped as (a) mutation-in-place that should be append-only,
(b) inside/outside confusions, (c) delivery/idempotence gaps, (d) impossible-transaction
assumptions — each with the concrete restructuring. Lead with whichever most threatens
correctness under retries or failures.

## Anti-patterns (when NOT to over-apply)
- **Don't** treat immutability as free. Append-only data and its indexes grow; account
  for storage and compaction honestly (the ZFS/dedup lesson — sometimes bookkeeping
  costs more than the saving).
- **Don't** force everything "outside." Inside a service, mutable current-state data is
  correct and simpler — the discipline is about *boundaries*, not banning mutation.
- **Don't** invoke eventual consistency to dodge required invariants. Some things genuinely
  need strong consistency; question 6 is about honesty, not always choosing weak.
- **Don't** confuse this with `hickey`'s value-orientation — related, but Helland's scope is
  data *architecture across boundaries*, not language-level values.

## Complements
- `hickey` — values and immutability as a language-level worldview; Helland is the
  distributed-data-architecture level of the same instinct
- `hipp` — durability, integrity, and correctness of the store itself
- `tigerstyle` — safety and limits in the systems that implement these boundaries
- `bellard` — keeping the machinery that enforces all this minimal
