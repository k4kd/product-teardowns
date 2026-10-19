---
name: product-teardowns-style
description: Stage of product-teardowns. The writing and presentation guide for product-teardowns docs - write-a-prd-kunal's writing rules with doc-specific overrides, diagram rules, and how depth changes with the learner's level. Loaded by the write and readability stages, never run on its own.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# Style guide

The writer follows this guide, and the readability check grades against it. A doc is reading material that someone studies alone, so it must teach without anyone there to explain.

## 1. Base rules: write-a-prd-kunal
Load the **write-a-prd-kunal** skill and apply its **Writing rules** section in full: lead with the point, specifics not adjectives, sentences under 25 words, paragraphs of three sentences or fewer, plain words before the term, and the right shape (tables for comparisons, numbered steps for sequences, flowcharts for branches). If that skill isn't installed, apply this list as written.

## 2. Overrides for reading docs
1. **No glossary.** Define each term inline, in plain words, the first time it appears.
2. **No pointers inside the doc.** No "see", "above", "below", "earlier", "later", section numbers or bare IDs. Each section says what it needs. Evidence IDs appear only in Sources.
3. **No requirement IDs or "Proposed" labels.** Those are PRD-only rules.
4. **Show, don't describe.** Every mechanism gets a concrete example with real-looking values ("Asha's message 'hi' becomes `{text: 'hi', from: 'asha'}`").
5. **Say how sure you are, in plain words:** "seen in the code", "our best guess", "not known". Mark guessed parts of a diagram "(guess)".
6. **Crisp beats complete.** Cut any sentence the reader wouldn't miss. Never repeat an explanation.
7. **Familiar before technical.** Start every hard idea with an everyday situation that has the same shape, then the mechanism, then the real terms tied back to the everyday version.

## 3. Depth by level
Read the reader's level for the concept's area (Systems/infra, Algorithms or Code) in `~/learning-journal/profile.md`. Then apply the profile's **Default depth** as a standing preference within that row: "deep" means the fuller end of the row (more internals and code-level detail), "high-level" means the lighter end. If it says to shift once intuition is built, use the fuller end for new concepts and the lighter end for concepts that build on ones already in the ledger. A "lighter" or "deeper" from the request (the Depth line in your prompt) overrides this for the run, moving one row up or down.

| Level | Plain English | Technical part | Examples and diagrams |
|---|---|---|---|
| Beginner | Always. One everyday comparison | Every term defined. The mechanism in 4–8 sentences. One trade-off and one way it fails | Small example (2–3 items). A trace table for every algorithm |
| Intermediate | Always, one or two sentences | Common terms used freely. Trade-offs, cost (time, space, latency, money) and failure modes | A realistic example. A trace table only for non-obvious algorithms |
| Advanced | Always, one sentence | Precise vocabulary, complexity, edge cases, when not to use it, and how it compares with the alternatives | Production-scale numbers. Pseudocode over trace tables |

Never skip the plain-English opening, at any level. A concept never assumes something the ledger doesn't hold and the doc hasn't taught.

## 4. Diagrams
Use Mermaid (GitHub renders it), at most 12 boxes per diagram (split a bigger one), and pair every diagram with sentences: one to introduce it and 2–4 to walk through it. Label boxes and arrows in plain words ("sends your message", not `POST /v1/ingest`). Add the technical name in brackets only after the text has introduced it.

| What you're showing | Diagram |
|---|---|
| Parts and what connects them | `flowchart LR` with `subgraph` groups ("on your phone", "in the cloud") |
| What the person or caller does | `flowchart TD` with decision diamonds |
| Messages between parts, in order | `sequenceDiagram` |
| Something that changes state (connected, waiting, retrying) | `stateDiagram-v2` |
| Algorithm logic | `flowchart TD`, plus a trace table |

A **trace table** has one row per step and one column per variable, run on a tiny real example:

| Step | What happens | `queue` | `current` | `done` |
|---|---|---|---|---|
| 1 | Two messages arrive | [A, B] | none | [] |
| 2 | Take the first one | [B] | A | [] |
| 3 | Finish A, take the next | [] | B | [A] |
