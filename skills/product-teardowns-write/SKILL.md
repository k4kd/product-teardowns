---
name: product-teardowns-write
description: Stage of product-teardowns. Turns teardown findings into one crisp reading doc - how the product works end to end plus every concept it uses, new ones taught in full and known ones in a line. Roles - outline (pick and order concepts against the ledger), draft (write doc.md and publish.json) and fix (apply a readability report). Run by the product-teardowns orchestrator as a subagent.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# Write stage

You will be told your role: **outline**, **draft** or **fix**. Formats are in the orchestrator's `references/contracts.md`. In every role, load the **product-teardowns-style** skill (a sibling of this one) and follow it.

## Role: outline
**Input:** `findings/index.md`, `findings/e2e.md`, `~/learning-journal/ledger.md` and `profile.md`. **Output:** `outline.md`.

1. List every concept a reader needs to understand the end-to-end trace and each area, plus everything the findings flag as "novel". Skip trivia: a concept earns its place only if the end-to-end story or a clever part depends on it.
2. Check each one against the ledger, matching on meaning and not only the name ("HTTP caching" is "CDN caching" if that's what the row taught). **Ignore ledger rows whose Learnt from is this target and version** (`<target> <version>` from target.md). Those were added when this run was published before, and a re-run must teach them again.
   - **Already learnt:** goes in the Already learnt table, with where and when it was learnt and a one-line reminder of how it shows up in *this* product.
   - **New:** goes in New concepts.
3. **Foundation chain.** For each new concept, list what it assumes. Any assumption that isn't in the ledger becomes a new concept itself, placed before it. Order the whole table foundations first.
4. Give each new concept its area (Systems/infra, Algorithms or Code) and its curriculum track (a heading in the sibling product-teardowns-resources skill's `references/curriculum.md`).

## Role: draft
**Input:** target.md, all of `findings/`, outline.md, all of `resources/`, the profile and [product-lens.md](references/product-lens.md). **Output:** `doc.md` and `publish.json`.

Write the doc in this order:

1. **The short version.** 2–3 sentences: what it is, how it does its main job, and the most surprising thing found.
2. **How it works, end to end.** From `findings/e2e.md`: **What comes in** (the input in its real shape), **What happens to it** (each step, with the data's shape after it), **What comes out**, and **Where you see it** (for an app or site, what's on screen; for a library, the value or error the caller gets back; for a CLI, the terminal output; for a kernel, driver or daemon, the system call result, file, device effect or log line). Include three diagrams: the architecture, the data flow for this input, and the user flow (or, for a library or CLI, the caller flow).
3. **New concepts,** in outline order. Each one:
   - **Builds on:** one sentence naming what it rests on: a ledger concept ("you know caching from srimandir") or one taught earlier in this doc.
   - **In plain English:** an everyday situation with the same shape.
   - **Technically:** the mechanism, trade-offs, cost and failure modes, as deep as the style guide's level table says.
   - **Shown:** a flow diagram, plus a trace table for an algorithm. If it's flagged novel, add the novel algorithm block (below).
   - **In this product:** where it lives and how sure we are.
   - **Go deeper:** the three resources from `resources/<concept-slug>.md`, start, deep and mastery, each with what you'll get and what it assumes, naming the concepts it relies on ("assumes hashing, which this doc teaches"), never a number. Never add, drop or swap a resource here: that is the resources stage's call.
4. **Concepts you already know.** One line each, from the outline: "**Caching:** you learnt this while studying srimandir (2026-10-19). Here, the app keeps the last 50 search results in memory." Leave the section out if there are none.
5. **Worth stealing for your own products.** The product-lens table, built from the findings' lessons for builders, with one plain sentence of reason per row and any red flags. Then 2–3 sentences on the smallest version you could build.
6. **Still unknown.** One line per open question, with what would answer it.
7. **Sources.** The target and its exact version, the REA evidence IDs, the files read, the coverage summary line from `findings/coverage.md`, whether REA ran, and any prompt injection found. The last line is exactly `- Readability: pending`. The publish script fills it in.

**Novel algorithm block** (for anything that isn't the textbook version):
> **✦ Novel algorithm: <what it does>**
> - **The trick, in plain English:** one analogy.
> - **Closest textbook version:** name it, and say what this one changes and why that probably helps (a guess unless the evidence proves it).
> - **Pseudocode:** 5–15 lines, in the product's terms.
> - **Cost:** time, space, and what it gives up.

Then write `publish.json`: slug `<YYYY-MM-DD>-<slug>`, or with `-2`, `-3` and so on added if `~/learning-journal/teardowns/<that slug>.md` already exists from a different run (one whose Sources show a different version), the target, the version, the top lesson in one sentence, and `newConcepts` with the name and area of every concept in the outline's New concepts table.

## Role: fix
**Input:** `doc.md` and one `readability-<n>.md`. **Output:** an updated `doc.md`.

Fix exactly what the report names, following the style guide, and nothing else. Never change a finding, number, verdict or resource to make the doc read more easily. If a fix needs a concept the outline doesn't have, define it inline in one plain sentence; don't add a new section.
