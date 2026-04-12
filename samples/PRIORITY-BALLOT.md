# Priority Ballot

> Score features independently, then compare. Reveals alignment and disagreements worth discussing.
>
> **Rules:**
> 1. One person lists the features and fills their scores
> 2. Other person fills their columns **without looking at partner's scores first** (honor system — or use `git log` to verify)
> 3. Third pass: compute averages, discuss any score where you differ by 2+
>
> **Impact:** How much value does this deliver? (1 = low, 5 = game-changer)
> **Effort:** How hard is this to build? (1 = trivial, 5 = massive)
> **Score:** Impact ÷ Effort (higher = better bang for buck)

---

| Feature | [Alex] Impact | [Alex] Effort | [Jordan] Impact | [Jordan] Effort | Avg Impact | Avg Effort | Score (I/E) |
|---------|--------------------|--------------------|--------------------|--------------------|------------|------------|-------------|
| Receipt photo capture | 5 | 2 | 5 | 3 | 5.0 | 2.5 | 2.0 |
| Open Banking integration | 5 | 4 | 4 | 4 | 4.5 | 4.0 | 1.1 |
| AI transaction matching | 5 | 5 | 5 | 4 | 5.0 | 4.5 | 1.1 |
| Email receipt forwarding | 3 | 2 | 4 | 2 | 3.5 | 2.0 | 1.8 |
| Tax summary dashboard | 4 | 3 | 4 | 3 | 4.0 | 3.0 | 1.3 |
| WhatsApp bot | 3 | 3 | 2 | 4 | 2.5 | 3.5 | 0.7 |
| Accountant sharing | 2 | 2 | 4 | 2 | 3.0 | 2.0 | 1.5 |
| Multi-currency | 2 | 3 | 3 | 4 | 2.5 | 3.5 | 0.7 |
| Cash flow forecasting | 2 | 4 | 1 | 5 | 1.5 | 4.5 | 0.3 |

---

## Disagreements to Discuss

_List any feature where scores differ by 2+ and work it out here._

| Feature | Gap | [Alex] reasoning | [Jordan] reasoning | Resolution |
|---------|-----|----------------------|----------------------|------------|
| Accountant sharing | Impact: 2 vs 4 | Nice-to-have, most freelancers don't have one | Key distribution channel — accountants recommend tools | Discuss in next session |
| WhatsApp bot | Effort: 3 vs 4 | WhatsApp Business API is straightforward | Message templates are restrictive, media handling is fiddly | |
