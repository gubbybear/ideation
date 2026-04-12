# Red Team

> Structured adversarial thinking. One person writes the attack, the other must defend or concede. Alternate roles each round.

---

## Round 1: Core Viability — 2026-04-11

**Attacker: Jordan**

> **Challenge 1:** _Why will this fail?_
> The AI matching accuracy isn't good enough. Users try it, get 3 wrong matches in their first session, lose trust, and never come back. First impressions are everything.

**Defender: Alex**

> **Response 1:**
> Fair point. We mitigate by never auto-confirming — every match needs a swipe. We show confidence scores and put low-confidence matches in a separate "review" pile. The UX should set expectations: "Here are our best guesses — confirm or fix."

---

> **Challenge 2:** _What's the weakest part of this plan?_
> The assumption that freelancers will consistently photograph receipts. Most people lose interest after week 1. The email forwarding is better but still requires effort.

> **Response 2:**
> True. We need passive capture as much as possible. Open Banking gives us transactions automatically. The receipt side is the weak link. Maybe we flip it: start from the bank feed, and only prompt for receipts when we can't identify a transaction. "We saw a £47.50 charge at WH Smith — got a receipt for this?"

---

> **Challenge 3:** _Dext already does receipt scanning with 20+ years of data. How do you compete?_
> They have massive OCR training data, accountant relationships, and brand recognition in the bookkeeping world.

> **Response 3:**
> Dext is built for accountants, not end users. Their UI is enterprise-grade awful. They don't do bank matching. We're not competing with Dext — we're competing with the shoebox of receipts. Different buyer, different positioning.

**Verdict:** The matching accuracy risk is real and we need to address it before launch — maybe a beta period with forgiving users. The receipt capture habit is our biggest behavioral challenge. The Dext comparison actually clarified our positioning.


---

<!-- Copy the round template above to start a new round. Alternate attacker/defender roles. -->

<!--
## Round 2: [Topic] — [Date]

**Attacker: [Name]**
**Defender: [Name]**

...
-->
