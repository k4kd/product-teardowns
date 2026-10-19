---
name: product-teardowns-pm-write
description: Stage of product-teardowns, product mode. Turns the teardown's product evidence and the internet research into one crisp product-management case study - how the product works for the user and the business end to end, how it makes money, and 3-6 product decisions reconstructed (constraint, alternatives, evidence, impact with sourced numbers or estimate ranges, counterfactual, when it breaks), plus every PM concept it uses, new ones taught in full and known ones in a line. Roles - outline, draft and fix. Run by the product-teardowns orchestrator as a subagent.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# PM write stage

You will be told your role: **outline**, **draft** or **fix**. `<mdir>` is the product mode folder, `<run>/product/`. Formats are in the orchestrator's `references/contracts.md`. In every role, load the **product-teardowns-style** skill (a sibling of this one) and follow it, including its product-mode depth table and its rules for product docs.

This doc teaches **product sense**: judgment about why a product is built the way it is, and whether that would work elsewhere. It is a case study in the style of Stratechery's analyses and Reforge's case method, not a feature tour. Every claim is backed by evidence (the product itself, a sourced number, or someone on record) or labelled a guess.

## Role: outline
**Input:** target.md, `findings/index.md`, `findings/product-evidence.md`, `~/learning-journal/product/ledger.md` (missing means nothing learnt yet: treat it as empty) and `profile.md`. **Output:** `<mdir>/outline.md`.

1. **Pick the decisions** (3–6) the doc will reconstruct. Choose the ones that explain the most about why this product wins or struggles: how it gets users, how it activates and retains them, how it makes money, and what protects it. Prefer decisions with evidence in the product (a plan gate, an onboarding step, a pricing tier, an experiment flag). Write them in the outline's Decisions table (format in the contracts): what they chose, the obvious alternative, and where the evidence is.
2. **List every PM concept** a reader needs to understand those decisions and the money flow: frameworks (jobs to be done, activation, growth loops, network effects, value metric, 7 Powers…) and metrics (retention curves, LTV/CAC…). Skip trivia.
3. Check each concept against the product ledger, matching on meaning. **Ignore ledger rows whose Learnt from is this target and version** (a re-run must teach them again). Known concepts go in Already learnt, with a one-line reminder of how they show up here. The rest are new.
4. **Foundation chain:** any concept a new one assumes that isn't in the ledger becomes a new concept itself, placed first.
5. Give each new concept its area (Product sense, Growth, Business or Data) and its track (a heading in the sibling product-teardowns-pm-resources skill's `references/curriculum.md`, or `new: <name>`).

## Role: draft
**Input:** target.md, all of `findings/`, `<mdir>/outline.md`, all of `<mdir>/research/`, all of `<mdir>/resources/`, the profile, and [pm-lens.md](references/pm-lens.md). **Output:** `<mdir>/doc.md` and `<mdir>/publish.json`.

Write the doc in this order:

1. **The short version.** 2–3 sentences: who it's for, how it makes money, and the one product decision that matters most.
2. **How it works for the user and the business, end to end.**
   - **The user journey:** from first hearing about it, to signing up, to the "aha" moment (when a new user first gets the value), to the habit, to paying, to bringing others. Count the steps, and note the friction on each. Use a `flowchart LR` journey diagram.
   - **How the money flows:** who pays, for what, how often, and the value metric (what the price scales with). Who else gets paid (app stores, payment providers, partners). Use a `sequenceDiagram`. Back it with the pricing evidence and the numbers research, each number with its source and date.
3. **The product decisions,** in outline order. Each is a short case:
   - **The decision:** what they chose, in one sentence, with its evidence ("seen in the product: the paywall appears after the third project").
   - **The constraint:** the problem or goal it answered.
   - **The alternatives:** the realistic other choices (at least one), and who chose them (a competitor, or this product earlier).
   - **Why this one:** the reasoning, tied to evidence or to someone on record (quoted, with source and date).
   - **What it required:** the other choices it forced (for example, a free tier forces cheap serving and a reason to upgrade).
   - **The impact:** a reported number (with source and date) or the estimate range from `research/estimates.md`, labelled "estimate", with its biggest assumption.
   - **The counterfactual:** what would have broken under the alternative.
   - **When it breaks:** the pre-mortem. The conditions under which this decision stops working.
   - **The pattern to steal:** one sentence, with its conditions.
4. **New PM concepts,** in outline order. Each one: **Builds on** (a ledger concept or one taught earlier), **In plain English** (an everyday situation with the same shape), **Precisely** (definition, how it's measured, trade-offs and how it fails, as deep as the level table says), **Shown** (a diagram: a loop, a funnel, a curve), **In this product** (where it shows up, with evidence), and **Go deeper** (the three resources from `resources/<concept-slug>.md`, each with what you'll get and what it assumes; never add, drop or swap one).
5. **Concepts you already know.** One line each: "**Activation:** you learnt this while studying srimandir (2026-10-19). Here, the aha moment is the first saved project." Leave the section out if there are none.
6. **The numbers.** One table: metric · value · period · source · date · reported, claimed or estimate. Then the estimates, each as a range with its key assumption.
7. **What's publicly known to have worked.** From `research/decisions.md`: each decision with its outcome, who said so, and the credibility note. Then the precedents from comparable products, and what transfers and what doesn't.
8. **Worth stealing for your own products.** The PM-lens table from pm-lens.md, with one plain sentence of reason per row. Then 2–3 sentences on the smallest version of this business you could build.
9. **Still unknown.** One line per open question, with what would answer it (for example "the trial-to-paid rate, which only an earnings call or an operator interview would show").
10. **Sources.** The target and version, the evidence files, every web source with its date, whether REA ran, and any prompt injection found. The last line is exactly `- Readability: pending`.

**Never:** a listicle of features, a claim with no evidence, a number with no source and date, an estimate as a single point, praise not tied to a user goal or a metric, or "they built X" without asking "why not Y".

Then write `<mdir>/publish.json` with `"mode": "product"`: slug `<YYYY-MM-DD>-<slug>`, or with `-2`, `-3` and so on added if `~/learning-journal/product/teardowns/<that slug>.md` already exists from a different run, the target, the version, the top lesson in one sentence, and `newConcepts` with the name and area of every concept in the outline's New concepts table.

## Role: fix
**Input:** `<mdir>/doc.md` and one `<mdir>/readability-<n>.md`. **Output:** an updated `<mdir>/doc.md`.

Fix exactly what the report names, following the style guide, and nothing else. Never change a finding, number, source, estimate, verdict or resource to make the doc read more easily. If a fix needs a concept the outline doesn't have, define it inline in one plain sentence.
