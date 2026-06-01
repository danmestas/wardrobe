# Design System Contribution / New Pattern Decision Tree — Nucleus + GitHub Primer (Full)

**Nucleus Process (any change)**
1. Proposal/RFC (after exploring existing)
2. Discovery (research, testing, vanilla-first, scope, tickets)
3. Design
4. Development
5. Documentation
6. Testing (a11y, compat, visual, etc.)
7. Release (SemVer, celebrate)

**Primer New Pattern Readiness**
- Not ready (team-specific, rushed, overly complex) → internal only
- Good for sharing/piloting (multi-product, codifies pattern, explainable, no monolith deps) → pilot/on-ramp
- Ready for direct Primer (meets sharing + maintainers agree + timeline) → add (high bar, early engagement)

**Flowchart Reference**: Primer site visual summary
## Visual Decision Tree (Mermaid)

```mermaid
flowchart TD
    Nucleus[Nucleus Process] --> P1[Proposal/RFC after exploring existing]
    P1 --> P2[Discovery research testing vanilla-first]
    P2 --> P3[Design system impact]
    P3 --> P4[Development]
    P4 --> P5[Documentation]
    P5 --> P6[Testing a11y compat visual]
    P6 --> P7[Release SemVer celebrate]

    Primer[Primer New Pattern] --> R1[Not ready - internal only]
    Primer --> R2[Good for sharing/piloting - on-ramp]
    Primer --> R3[Ready for direct Primer - high bar early engagement]
```
