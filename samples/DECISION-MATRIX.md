# Decision Matrix

> For when you're stuck between options. One person defines criteria + weights. Other person scores independently. Compare and discuss.
>
> **Weight:** How important is this criteria? (1 = nice-to-have, 3 = critical)
> **Score:** How well does this option satisfy the criteria? (1 = poorly, 5 = perfectly)
> **Weighted Total:** Sum of (weight × score) for each option. Highest wins.

---

## Decision 1: How should users capture receipts in MVP?

**Context:** We need to decide the primary receipt capture method for MVP. Can't build everything at once.

**Options:**
- **Option A:** Mobile app with camera (photo capture)
- **Option B:** Email forwarding (unique alias per user)
- **Option C:** WhatsApp bot (send photos via chat)

| Criteria | Weight | Option A: Camera App | Option B: Email | Option C: WhatsApp |
|----------|--------|----------|----------|----------|
| User friction (lower = better) | 3 | 3/5 | 4/5 | 5/5 |
| Development effort | 2 | 2/5 | 4/5 | 3/5 |
| Image quality | 3 | 5/5 | 2/5 | 3/5 |
| Works for physical receipts | 3 | 5/5 | 1/5 | 4/5 |
| Works for digital receipts | 2 | 2/5 | 5/5 | 3/5 |
| **Weighted Total** | | **45** | **38** | **47** |

**Result:** WhatsApp scores highest but only by 2 points vs camera app. Camera gives us the best image quality which directly impacts AI accuracy. **Decision: Build camera app as primary, add email forwarding as secondary. Revisit WhatsApp for v1.1.**

**Moved to DECISIONS.md as:** _(pending — need Jordan's input on WhatsApp scoring)_

---

<!-- Copy the template above for additional decisions. -->

<!--
## Decision 2: [What are we deciding?]
...
-->
