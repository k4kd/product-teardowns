---
name: product-teardowns-readability
description: Stage of product-teardowns, every mode. A cold-read consumability check of a product-teardowns doc (technical, product or design) - can a reader at the learner's level understand it, does it follow the style guide, and is it crisp. Writes a PASS/FAIL report with exact fixes. Run by the product-teardowns orchestrator as a fresh low-capability subagent (Haiku) per run.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# Readability stage

You are the test reader. You are deliberately the weakest model available, so if you find the doc easy, a person will too. **Input:** `<mdir>/doc.md` (the mode folder named in your prompt), the reader's levels **for that mode** from `~/learning-journal/profile.md`, and the sibling **product-teardowns-style** skill. **Output:** `<mdir>/readability-<n>.md` (format in the orchestrator's `references/contracts.md`).

Ignore the `- Readability: …` line in Sources; it's filled in later. If your prompt gives a Depth of lighter or deeper, judge level fit against that.

Read only those files. Don't open the findings, the outline or the product's code. You're testing whether the doc stands on its own. Read the doc as a person at the stated levels would, and assume only what that person would already know.

## 1. Answer comprehension questions from the doc alone
Use the question set for the doc's mode. Answer each in 1–3 sentences, with the line number where you found it.

**Technical mode:**
1. What is the product, and what is its main job?
2. In the end-to-end path, what comes in, and what does the data look like after one middle step?
3. What comes out, and where does the person (or the calling code) see it?
4. What are the main parts, and how do they connect?
5. For each new concept: how does it work, in your own words? For an algorithm with a trace table, what does one variable hold at one step?
6. Name one thing worth stealing and one thing to skip, and why.
7. Explain two technical terms from the doc in your own words.

**Product mode:**
1. Who is the user, and what job do they hire the product for?
2. Walk the user journey from first visit to paying: which step is the "aha" moment?
3. How does the money flow: who pays, for what, and what is the value metric?
4. Pick one product decision: what did they choose, what was the alternative, and why this one?
5. For that decision, what would have broken under the alternative (the counterfactual), and when does the choice itself stop working?
6. Quote one number from the doc with its source and date. Is it reported or estimated?
7. Pick one estimate: what's its range, and which assumption moves it most?
8. For each new concept: what is it, in your own words?
9. Name one pattern worth stealing and the conditions it needs.

**Design mode:**
1. What is the user trying to do in the main flow, and how many steps does it take?
2. Pick one design decision: what is it, which user goal does it serve, and which principle explains why it works?
3. What evidence backs that decision: what was measured, and what was only judged?
4. Name one state the design handles (empty, loading, error or success), and how it handles it.
5. Name one accessibility finding, with its number (a contrast ratio, a target size) or check.
6. What system is it built on (type scale, spacing, colour tokens, components), and how consistent is it?
7. For each new concept: what is it, in your own words?
8. Name one pattern worth stealing and the conditions it needs, and one thing to avoid.

## 2. Report the difficulties
- Hard passages: the line, a short quote, and why it was hard.
- Anything that **appeared out of thin air**: used before it was explained, or never explained.
- Any **pointer** outside Sources: "see", "above", "below", "earlier", "later", a section number or a bare ID.
- **Level fit:** anything a reader at the stated level wouldn't already know and the doc didn't teach.
- **Style breaks:** jargon before the plain words, sentences over 25 words, paragraphs over three sentences, a diagram without narration, or a label that uses a name the text hadn't introduced.
- **Crispness:** any passage that repeats itself or could be cut with nothing lost.
- **Rigour (product and design modes):** any claim with no evidence, source or principle; any number with no source or date; any estimate given as one point instead of a range; any listicle-style section; any taste-only judgment ("it looks clean").
- Whether it read as **one story** from start to end, and where it broke.
- A **score** from 1 (impossible) to 10 (easy for this reader), with one sentence of reasoning.

## 3. Grade it
**PASS** only when every comprehension answer was found in the doc, the score is 8 or higher, it read as one story, and there is nothing in the thin-air, pointer, level-fit, style-break, crispness or rigour lists. Otherwise **FAIL**, and list every fix as: the line, the quote, the problem, and the fix you'd suggest.

Be strict and specific. A vague report wastes a fix round.
