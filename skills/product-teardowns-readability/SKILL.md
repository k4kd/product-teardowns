---
name: product-teardowns-readability
description: Stage of product-teardowns. A cold-read consumability check of a product-teardowns doc - can a reader at the learner's level understand it, does it follow the style guide, and is it crisp. Writes a PASS/FAIL report with exact fixes. Run by the product-teardowns orchestrator as a fresh low-capability subagent (Haiku) per run.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# Readability stage

You are the test reader. You are deliberately the weakest model available, so if you find the doc easy, a person will too. **Input:** `<run>/doc.md`, the reader's levels from `~/learning-journal/profile.md`, and the sibling **product-teardowns-style** skill. **Output:** `<run>/readability-<n>.md` (format in the orchestrator's `references/contracts.md`).

Ignore the `- Readability: …` line in Sources; it's filled in later. If your prompt gives a Depth of lighter or deeper, judge level fit against that.

Read only those files. Don't open the findings, the outline or the product's code. You're testing whether the doc stands on its own. Read the doc as a person at the stated levels would, and assume only what that person would already know.

## 1. Answer comprehension questions from the doc alone
Answer each in 1–3 sentences, with the line number where you found it:
1. What is the product, and what is its main job?
2. In the end-to-end path, what comes in, and what does the data look like after one middle step?
3. What comes out, and where does the person (or the calling code) see it?
4. What are the main parts, and how do they connect?
5. For each new concept: how does it work, in your own words? For an algorithm with a trace table, what does one variable hold at one step?
6. Name one thing worth stealing and one thing to skip, and why.
7. Explain two technical terms from the doc in your own words.

## 2. Report the difficulties
- Hard passages: the line, a short quote, and why it was hard.
- Anything that **appeared out of thin air**: used before it was explained, or never explained.
- Any **pointer** outside Sources: "see", "above", "below", "earlier", "later", a section number or a bare ID.
- **Level fit:** anything a reader at the stated level wouldn't already know and the doc didn't teach.
- **Style breaks:** jargon before the plain words, sentences over 25 words, paragraphs over three sentences, a diagram without narration, or a label that uses a name the text hadn't introduced.
- **Crispness:** any passage that repeats itself or could be cut with nothing lost.
- Whether it read as **one story** from start to end, and where it broke.
- A **score** from 1 (impossible) to 10 (easy for this reader), with one sentence of reasoning.

## 3. Grade it
**PASS** only when every comprehension answer was found in the doc, the score is 8 or higher, it read as one story, and there is nothing in the thin-air, pointer or level-fit lists. Otherwise **FAIL**, and list every fix as: the line, the quote, the problem, and the fix you'd suggest.

Be strict and specific. A vague report wastes a fix round.
