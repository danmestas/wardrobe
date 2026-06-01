# Loading UX Decision Tree — Workday Canvas (Full)

**Root Questions**
1. Expected duration?
2. Content predictable or variable?
3. Progress trackable?

**< 1s**: No indicator

**> 1s**
- Predictable → Skeleton (shapes + shimmer; progressive/lazy top-to-bottom on mobile)
- Variable → Loading Dots
- Trackable → Progress Bar (with text %, contrast rules, SR announce)
- Very long → Modal with "Notify me later"

**Switch Rules and Full Accessibility**
- SR status announcement always
- Allow motion disable (5s stop)
- Contrast 3:1 graphic / 4.5:1 text
- References: Nielsen Norman response times
## Visual Decision Tree (Mermaid)

```mermaid
flowchart TD
    Q1[Duration < 1s?] -->|<1s| None[No indicator]
    Q1 -->|>1s| Q2[Predictable content?]
    Q2 -->|Yes| Skel[Skeleton shapes + shimmer<br/>Progressive/Lazy top-to-bottom mobile]
    Q2 -->|No| Dots[Loading Dots]
    Q1 --> Q3[Progress trackable?]
    Q3 -->|Yes| Bar[Progress Bar + text % + SR]
    Q3 -->|Very long| Modal[Modal + Notify later]
```
