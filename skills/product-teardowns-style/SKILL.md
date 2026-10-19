---
name: product-teardowns-style
description: Stage of product-teardowns, every mode. The writing and presentation guide for product-teardowns docs - write-a-prd-kunal's writing rules with doc-specific overrides, diagram rules, rigour rules for product and design docs, and how depth changes with the learner's level in each mode. Loaded by the write and readability stages, never run on its own.
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
Read the reader's level for the concept's area in `~/learning-journal/profile.md`, in the levels section for the doc's mode (the areas are in the contracts). The table below is for the technical mode; the product and design tables follow it. Then apply the profile's **Default depth** as a standing preference within that row: "deep" means the fuller end of the row (more internals and code-level detail), "high-level" means the lighter end. If it says to shift once intuition is built, use the fuller end for new concepts and the lighter end for concepts that build on ones already in the ledger. A "lighter" or "deeper" from the request (the Depth line in your prompt) overrides this for the run, moving one row up or down.

| Level | Plain English | Technical part | Examples and diagrams |
|---|---|---|---|
| Beginner | Always. One everyday comparison | Every term defined. The mechanism in 4–8 sentences. One trade-off and one way it fails | Small example (2–3 items). A trace table for every algorithm |
| Intermediate | Always, one or two sentences | Common terms used freely. Trade-offs, cost (time, space, latency, money) and failure modes | A realistic example. A trace table only for non-obvious algorithms |
| Advanced | Always, one sentence | Precise vocabulary, complexity, edge cases, when not to use it, and how it compares with the alternatives | Production-scale numbers. Pseudocode over trace tables |

Never skip the plain-English opening, at any level. A concept never assumes something the ledger doesn't hold and the doc hasn't taught.

### Product mode depth
| Level | Plain English | Precise part | Numbers and cases |
|---|---|---|---|
| Beginner | Always. One everyday comparison ("a free sample at a bakery") | Every framework named and defined. One decision reconstructed fully, the rest briefly | Simple funnel maths with round numbers. One precedent, explained |
| Intermediate | Always, one or two sentences | Frameworks used freely (JTBD, loops, 7 Powers). Trade-offs and counterfactuals for every decision | Estimates with ranges and a sensitivity line. Precedents compared |
| Advanced | Always, one sentence | Second-order effects, how competitors would respond, and where the strategy breaks | Unit economics ranges, cohort reasoning, where public data disagrees |

### Design mode depth
| Level | Plain English | Precise part | Evidence |
|---|---|---|---|
| Beginner | Always. One everyday comparison ("a door that says push") | Every principle named and defined (Fitts, Hick, Gestalt, Norman). One decision reconstructed fully | Annotated screenshots, plus a few measured numbers explained |
| Intermediate | Always, one or two sentences | Principles used freely. Trade-offs, states and edge cases for every decision | Full measured tables: type and spacing scales, contrast ratios, target sizes |
| Advanced | Always, one sentence | System-level critique: tokens, component APIs, platform conventions, accessibility beyond AA | Inconsistency counts, how the system would scale, alternatives from other design systems |

## 3b. Rules for product and design docs
- **Every number has a source and a date** ("1.2M monthly users, SimilarWeb, Sept 2026"), or is labelled **estimate**. Estimates are ranges ("40–90k paying users"), never single points, and say which assumption moves them most.
- **Reported vs claimed vs estimated:** a filing or audited number is *reported*, a founder on a podcast is *claimed*, and our maths is an *estimate*. Say which, in plain words.
- **Reconstruct decisions, don't list features.** Each decision: what they chose, the constraint, the alternatives, why this one, what it required, the impact, the counterfactual, and when it breaks.
- **Design judgments name a principle and show evidence.** "The Pay button is 48 px tall and sits where the thumb rests (Fitts's law: bigger, closer targets are faster to hit)" is fine. "The button looks nice" is never fine.
- **Banned:** listicles ("10 things X does well"), unfalsifiable claims ("they care about users"), taste-only critique, praise not tied to a user goal or a metric, and presenting a dark pattern as a win.
- **Steal-able patterns state their conditions:** "works when usage is frequent and the free tier is cheap to serve".

## 4. Diagrams
Use Mermaid (GitHub renders it), at most 12 boxes per diagram (split a bigger one), and pair every diagram with sentences: one to introduce it and 2–4 to walk through it. Label boxes and arrows in plain words ("sends your message", not `POST /v1/ingest`). Add the technical name in brackets only after the text has introduced it.

| What you're showing | Diagram |
|---|---|
| Parts and what connects them | `flowchart LR` with `subgraph` groups ("on your phone", "in the cloud") |
| What the person or caller does | `flowchart TD` with decision diamonds |
| Messages between parts, in order | `sequenceDiagram` |
| Something that changes state (connected, waiting, retrying) | `stateDiagram-v2` |
| Algorithm logic | `flowchart TD`, plus a trace table |
| A user journey (discover → sign up → aha → habit → pay → refer) | `flowchart LR`, with the drop-off or friction noted on each arrow |
| Money flow: who pays whom, for what | `sequenceDiagram` (user, product, payment provider, partners) |
| A growth or habit loop | `flowchart LR` that closes back on itself |
| A screen or UI detail (design mode) | the screenshot from `findings/screens/`, embedded as `![what it shows](path)`, with numbered callouts explained in the text |

A **trace table** has one row per step and one column per variable, run on a tiny real example:

| Step | What happens | `queue` | `current` | `done` |
|---|---|---|---|---|
| 1 | Two messages arrive | [A, B] | none | [] |
| 2 | Take the first one | [B] | A | [] |
| 3 | Finish A, take the next | [] | B | [A] |
