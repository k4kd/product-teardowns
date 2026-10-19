# The reading doc

Every session produces one doc. The user reads it on their own, after the session, so it must teach without you in the room. Save it as `~/learning-journal/teardowns/<YYYY-MM-DD>-<target-slug>.md`. GitHub renders the Mermaid diagrams.

## Style: write-a-prd-kunal, with three overrides

Apply write-a-prd-kunal's **Writing rules** in full: lead with the point, specifics not adjectives, sentences under 25 words, paragraphs of three sentences or fewer, plain words before the term, the right shape (tables, numbered steps, flowcharts). Then apply these overrides, because this is a doc someone studies, not a spec:

1. **No glossary.** Define each term inline, in plain words, the first time it appears.
2. **No pointers inside the doc.** No "see", "above", "below", "earlier", "later", section numbers or bare IDs. Each section says what it needs instead of pointing. Evidence IDs appear only in Sources.
3. **No requirement IDs or "Proposed" labels.** Those are PRD-only rules.

Also:
- **Show, don't describe.** Every mechanism gets a concrete example with real-looking values ("Asha's message 'hi' becomes `{text: 'hi', from: 'asha'}`").
- **Say how sure you are, in plain words:** "seen in the code", "our best guess", "not known". Mark guessed parts of a diagram "(guess)".
- **Crisp beats complete.** Cut any sentence the reader would not miss.

## Structure, in this order

1. **The short version.** 2–3 sentences: what it is, how it does its main job, and the most surprising thing found.

2. **How it works, end to end.** One real input, followed to where its result appears:
   - **What comes in:** the input in its real shape (a tap, an HTTP request, a function call with its arguments, a file, a packet).
   - **What happens to it:** each processing step, in order, with what the data looks like after each one.
   - **What comes out:** the output in its real shape.
   - **Where you see it:** for an app or site, what appears on screen. For a library, the value or error the caller's code gets back. For a CLI, what prints in the terminal. For a kernel, driver or daemon, the system call result, file or device effect, or log line.

   Include three diagrams, each introduced by one sentence and narrated in 2–4 sentences: the **architecture** (`flowchart LR`, with `subgraph` for "on your phone", "in the cloud" and so on), the **data flow** for this input (`sequenceDiagram`), and the **user flow**, or for a library or CLI the **caller flow** (`flowchart TD`).

3. **New concepts.** Every new concept, foundations first. Each one:
   - **Builds on:** one sentence naming what it rests on, either a concept already in the ledger ("you know caching from srimandir") or one taught earlier in this doc.
   - **In plain English:** an everyday situation with the same shape ("a restaurant kitchen where orders pile up faster than the chef can cook").
   - **Technically:** the mechanism in precise terms, each term tied to the everyday version. Then the trade-offs, the cost (time, space, latency, money), how it fails, and when not to use it. Depth follows the user's level for that area.
   - **Shown:** a flow diagram of the logic. For an algorithm, add a **trace table** on a tiny real example. If the product's version is not the textbook one, add a `✦ Novel algorithm` block.
   - **In this product:** where it lives (files, functions, behaviour) and how sure we are.
   - **Go deeper:** exactly 3 resources, start, deep and mastery, each with one line on what you'll get and what it assumes (which this doc or the ledger covers). Give the exact entry point when only part fits.

4. **Concepts you already know.** One line each: "**Caching:** you learnt this while studying srimandir (2026-10-19). Here, the app keeps the last 50 search results in memory." Skip the section if there are none.

5. **Worth stealing for your own products.** The steal / skip table from product-lens.md, one plain sentence of reason per row, and any red flags. Then 2–3 sentences on the smallest version you could build.

6. **Still unknown.** One line per open question, with what would answer it.

7. **Sources.** The only reference list. The target and exact version or commit, the REA evidence IDs, the files read, whether REA ran, any prompt injection found, and the readability result as the last line.

## Diagrams

Use Mermaid, at most 12 boxes per diagram (split a bigger one), and always pair a diagram with sentences. Label boxes and arrows in plain words ("sends your message", not `POST /v1/ingest`). Add the technical name in brackets only after the text has introduced it.

| What you're showing | Diagram |
|---|---|
| Parts and what connects them | `flowchart LR` with `subgraph` groups |
| What the person or caller does | `flowchart TD` with decision diamonds |
| Messages between parts, in order | `sequenceDiagram` |
| Something that changes state (connected, waiting, retrying) | `stateDiagram-v2` |
| Algorithm logic | `flowchart TD` plus a trace table |

A **trace table** has one row per step and one column per variable:

| Step | What happens | `queue` | `current` | `done` |
|---|---|---|---|---|
| 1 | Two messages arrive | [A, B] | none | [] |
| 2 | Take the first one | [B] | A | [] |
| 3 | Finish A, take the next | [] | B | [A] |

## Novel algorithm block

Use it for anything that isn't the textbook version: a custom diff, a CRDT variant, a ranking formula, a scheduler, a clever cache key.

> **✦ Novel algorithm: <what it does>**
> - **The trick, in plain English:** one analogy.
> - **Closest textbook version:** name it, and say what this one changes and why that probably helps (a guess unless the evidence proves it).
> - **Pseudocode:** 5–15 lines, in the product's terms.
> - **Cost:** time, space, and what it gives up.
> - **Go deeper:** the paper or canonical source for the textbook version (this counts as the concept's mastery resource).

## Readability test, adapted

Run write-a-prd-kunal's readability test as written: a fresh Haiku agent (`model: "haiku"`) with no context, given only the doc, 7–10 comprehension questions, a difficulty report, and a pass at all answers correct plus a score of 8 or higher with no unexplained terms and no pointers. For this doc:
- The questions cover what the product is, the end-to-end path of the input (including what the data looks like at one step), how each new concept works (including what one variable holds at one trace-table step), one steal and one skip and why, and two terms "in your own words".
- Also ask whether the doc felt crisp or padded, and which passage could be cut.
- Don't use that skill's glossary fix. Define the term inline instead.
- Stop after 3 runs. Record the score, the answers correct, and anything still unfixed in Sources. If no sub-agent is available, write "Readability test not run" and why. Never claim it passed.

## Journal files

### profile.md
```markdown
# Learner Profile

## Levels
Systems/infra: Beginner
Algorithms: Beginner
Code: Beginner
Default depth: <answer>

## Goal
<what they want to be able to do in a year>

## Level history
- <date>: started at <levels> (setup)
```

### ledger.md
```markdown
# Ledger

Every concept learnt, one row each. A concept appears once, under the product where it was first learnt.

| Concept | Area | Learnt from | Date | Doc |
|---|---|---|---|---|
```
Area is one of: Systems/infra, Algorithms, Code. Example row: `| CDN caching | Systems/infra | srimandir.com | 2026-10-19 | [doc](teardowns/2026-10-19-srimandir.md) |`.

### teardowns.md
```markdown
# Teardowns

- <date> · <target> (<version>) · Lesson: <top lesson> · [doc](teardowns/<YYYY-MM-DD>-<target-slug>.md)
```

### Level rule
Count the ledger rows in each area. **Beginner** below 5, **Intermediate** at 5 or more, **Advanced** at 15 or more. A level only goes up, never down, and never below what the user stated at setup. When it rises, update Levels and add a Level history line: "<date>: Algorithms Beginner → Intermediate (5 concepts, latest from <target>)".
