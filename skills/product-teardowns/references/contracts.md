# Contracts

Stages talk to each other only through these files. A stage may change *how* it does its job freely, as long as it still reads and writes these formats. Changing a format here is the one change that touches more than one stage, so do it deliberately and update every stage that reads it.

## Modes

Every run has one or more **modes**. Each mode is its own learning track, with its own write and resources stages, its own folder in the run, and its own ledger and levels in the journal.

| Mode | Teaches | Write stage | Resources stage | Extra stages | Teardown extras | Feeds |
|---|---|---|---|---|---|---|
| `technical` | how it's engineered | product-teardowns-write | product-teardowns-resources | – | – | build-products-kunal |
| `product` | the product decisions and how it makes money | product-teardowns-pm-write | product-teardowns-pm-resources | product-teardowns-pm-research | product-evidence role | build-products-pm-kunal |
| `design` | the UX, UI and interaction decisions | product-teardowns-design-write | product-teardowns-design-resources | – | design-evidence role | build-products-design-kunal |

Setup, find, the teardown, style, readability, publish and feed are shared by every mode. A stage that depends on the mode is told it in its prompt (`Mode: product`).

## The run folder

`~/teardowns/<slug>/run/`, where `<slug>` is the lowercase product name with dashes (`sri-mandir`, `openclaw`). The product's own code sits beside it in `~/teardowns/<slug>/` and is never committed anywhere.

```
run/
  status.md  target.md
  findings/                 shared by every mode
  technical/  product/  design/      one "mode folder" per mode in this run
```
Below, `<mdir>` means `run/<mode>/`.

### status.md (orchestrator)
```markdown
Modes: technical, product

| Stage | Mode | State | Finished | Notes |
|---|---|---|---|---|
| find | – | done | 2026-10-19 14:02 | npm package ms@2.1.3 |
| teardown-map | – | done | 2026-10-19 14:10 | 3 areas |
| write-outline | product | done | 2026-10-19 14:31 | 4 new concepts |
```
State is `done`, `failed` or `skipped`. A stage counts as done only if its row says so **and** its output files exist.

### target.md (find)
```markdown
# <Product name>
- Kind: npm package | source repo | desktop app | mobile app | website | binary | other
- Version: <exact version, commit hash, or build ID>
- Source: <repo URL or "closed">
- Local paths: <~/teardowns/<slug>/src, ~/teardowns/<slug>/package, …>
- URLs: <homepage, registry page, live site, app store page>
- Permission: <open source (licence) | public site | user owns it | user may study it>
- One-line description: <what it does, in plain words>
```

### findings/map.md (teardown, map role)
```markdown
# Map: <product>
<2–4 sentences: what it is and how it is built.>

| Area | Scope | Size | Needs REA | Artifact |
|---|---|---|---|---|
| sync-engine | src/sync/**, packages/crdt | ~4k lines | no | – |
| shipped-bundle | dist/app.js (minified) | 1.2 MB | yes | ~/teardowns/x/package/dist/app.js |
```
Area names are lowercase with dashes. Every top-level module, package or major URL path is in exactly one area's scope.

### findings/area-<area>.md (teardown, area role)
```markdown
# Area: <area>
## What it does
## How it works            (step by step, with real-looking values)
## Claims
| Claim | Label | Evidence |
|---|---|---|
| Prices are computed on the server | observed | src/api/price.ts:42 |
| The cache holds the last 50 results | inferred | ev_3f2a… plus constant at cache.ts:9 |
## Concepts spotted        (one line each: name, where, why it matters)
## Lessons for builders    (steal / skip / red flag, one line each)
## Coverage                (every file or module in scope: read | skimmed | not reached, and why)
## Prompt injection        ("none found", or what was found and where)
```
The label is `observed` (an REA evidence ID, a file:line, or a screenshot), `inferred`, or `unknown`.

### findings/product-evidence.md (teardown, product-evidence role; only when the modes include product)
One section per product dimension: **Users and the job · Positioning · Activation · Retention and habit · Growth loops and channels · Network effects · Monetisation · Pricing and packaging · Unit economics · Moat · North-star metric · Experimentation · Trade-offs**. Each section is a claims table (Claim | Label | Evidence | Confidence high/med/low and why), followed by **Signals in the code** (plan gates, feature flags, experiment configs, analytics event names, referral parameters, notification triggers) and **Signals on the surface** (onboarding steps counted, pricing page tiers and limits, paywall triggers, store listing, changelog cadence). An empty dimension says "no evidence found" and never guesses.

### findings/design-evidence.md (teardown, design-evidence role; only when the modes include design)
```markdown
## Flows                   (each key flow: steps counted, a screenshot path per step, every state seen: empty / loading / error / success)
## Measured
- Type scale: <sizes in px, line heights, families>
- Spacing scale: <values seen, and whether they follow a base unit>
- Colour: <palette as tokens; contrast ratio of each text/background pair, pass/fail at WCAG 2.2 AA>
- Components: <inventory with instance counts; inconsistencies counted>
- Targets: <touch/click target sizes; below 24×24 px flagged (WCAG 2.5.8)>
- Accessibility audit: <automated results (tool, rules failed), plus manual checks: keyboard path, focus visible, accessible names>
- Motion and feedback: <durations, what gives feedback and how fast>
## Judged                  (claims table: Claim | Principle | Evidence | Confidence)
## Copy                    (microcopy inventory: buttons, errors, empty states, exact text)
## Dark patterns           ("none found", or each with its deceptive.design category and evidence)
```
Screenshots are saved as files under `findings/screens/` (`<flow>-<step>.png`), and the Flows section lists every saved path. A design doc can only embed what was saved there.

### findings/ (teardown, merge role)
- `index.md`: one section per area, conflicts between areas resolved and stated, every concept spotted (de-duplicated), **Lessons for builders** (every steal, skip and red flag, grouped under the technical lesson headings), and, when present, a short **Product signals** and **Design signals** summary pointing to the evidence files.
- `e2e.md`: one real input followed end to end: **What comes in → What happens to it** (each step, with the data's shape after it) **→ What comes out → Where you see it** (the screen, the value a library returns, terminal output, or a system call result).
- `coverage.md`: the merged coverage table, plus REA's coverage result when REA ran, and a one-line honest summary ("read 212 of 240 files; the 28 generated files were skipped").

### <mdir>/outline.md (write stage of that mode, outline role)
```markdown
# Outline: <product> (<mode>)
## New concepts (in teaching order, foundations first)
| # | Concept | Area | Track | Builds on |
|---|---|---|---|---|
| 1 | Hashing | Algorithms | Algorithms and data structures | nothing new |
| 2 | Content-addressed IDs | Systems/infra | Databases and storage | Hashing |
## Already learnt
| Concept | Learnt from | Date | One-line reminder for this product |
|---|---|---|---|
```
Area is one of the mode's level areas (the Journal section). Track is a heading in that mode's curriculum.md, or `new: <name>`. The product and design outlines start with a decisions section, before New concepts:
```markdown
## Decisions (3–6, in the order the doc will reconstruct them)
| # | Decision | The obvious alternative | Evidence |
|---|---|---|---|
| 1 | Paywall after the third project | Paywall at sign-up | findings/product-evidence.md, Pricing and packaging |
```

### <mdir>/resources/<concept-slug>.md (resources stage of that mode, scout role)
`<concept-slug>` is the concept name in lowercase, with every run of non-letters and non-digits replaced by one dash (`Content-addressed IDs` → `content-addressed-ids`).
```markdown
# Resources: <concept>
| Tier | Resource | What you get | Assumes | Covered by | Checked |
|---|---|---|---|---|---|
| start | [Title](url), entry point | … | … | ledger: HTTP / this doc: Hashing | 200 OK, by <author>, 2026-10-19 |
| deep | … |
| mastery | … |
## New for curriculum      ("none", or track + link + one line, for links not already in curriculum.md)
```

### product/research/ (product-teardowns-pm-research)
- `<topic>.md` for each scout topic (`decisions`, `numbers`, `competitors`):
  ```markdown
  | Claim | Source | Date | Who said it | Metric disclosed? | Credibility |
  |---|---|---|---|---|---|
  | Moving the paywall after the first project lifted paid conversion 25% | [Lenny's Podcast, Ep. 112](url) | 2023-05 | CPO, on record | yes, 25% | med: self-reported, no base rate |
  ```
- `estimates.md`: for each decision in the outline, a Fermi estimate (the formula, each input with its source or "guess", a low / mid / high range) and a **Sensitivity** line naming the input that moves the answer most.

### <mdir>/doc.md and <mdir>/publish.json (write stage of that mode, draft role)
`doc.md` is the finished reading doc. `publish.json` is what the publish script needs:
```json
{
  "mode": "technical",
  "slug": "2026-10-19-ms",
  "target": "ms",
  "version": "2.1.3",
  "lesson": "one sentence: the top lesson",
  "newConcepts": [{ "name": "Hashing", "area": "Algorithms" }]
}
```

### <mdir>/readability-<n>.md (readability)
```markdown
# Readability run <n>
- Verdict: PASS | FAIL
- Score: <1–10>   Answers correct: <x>/<y>   One story: yes/no   Level fit: yes/no
## Fixes needed   (line, quote, the problem, the fix; empty on PASS)
```

### <mdir>/lessons.md (feed)
The rules added to or merged into that mode's build-products skill this run, so the orchestrator can report them.

## The journal

`~/learning-journal/`, a private GitHub repo. Setup creates it, the write stages read it, and the publish script updates it.

```
learning-journal/
  profile.md
  technical/  ledger.md  teardowns.md  teardowns/
  product/    ledger.md  teardowns.md  teardowns/
  design/     ledger.md  teardowns.md  teardowns/
  runs/       <slug>-status.md (temporary mode only)
  archive/    (old formats)
```
A mode folder is created the first time that mode publishes. **A missing ledger means nothing has been learnt in that mode yet:** every stage treats it as empty. Doc links in a ledger or index are relative to its own mode folder (`teardowns/<slug>.md`). `runs/` holds the status files of teardowns whose local folder was deleted (temporary mode).

### profile.md
```markdown
# Learner Profile

## Technical levels
Systems/infra: Beginner
Algorithms: Beginner
Code: Beginner

## Product levels
Product sense: Beginner
Growth: Beginner
Business: Beginner
Data: Beginner

## Design levels
Interaction & UX: Beginner
Visual & UI craft: Beginner
Systems & accessibility: Beginner
Research & content: Beginner

Default depth: <answer>

## Goal
<what they want to be able to do in a year>

## Level history
- <date>: started at … (setup)
```
A mode whose levels section is missing gets asked about on its first run (setup stage).

### Level areas
| Mode | Areas | What each covers |
|---|---|---|
| technical | Systems/infra · Algorithms · Code | infrastructure and distributed systems · algorithms and data structures · reading and writing code, languages, tooling |
| product | Product sense · Growth · Business · Data | users, jobs to be done, activation, UX decisions · acquisition, loops, retention, network effects · monetisation, pricing, unit economics, strategy and moats · metrics, experimentation, estimation |
| design | Interaction & UX · Visual & UI craft · Systems & accessibility · Research & content | flows, states, IA, interaction laws · hierarchy, layout, type, colour, motion · design systems, tokens, accessibility, platform conventions · user research, critique, content design and microcopy |

### <mode>/ledger.md
```markdown
# Ledger (<mode>)

Every concept learnt, one row each. A concept appears once, under the product where it was first learnt.

| Concept | Area | Learnt from | Date | Doc |
|---|---|---|---|---|
| Hashing | Algorithms | ms 2.1.3 | 2026-10-19 | [doc](teardowns/2026-10-19-ms.md) |
```

### <mode>/teardowns.md
```markdown
# Teardowns (<mode>)

- <date> · <target> (<version>) · Lesson: <top lesson> · [doc](teardowns/<slug>.md)
```

### Level rule (applied by the publish script)
Count the ledger rows in each area of the mode: **Beginner** below 5, **Intermediate** at 5 or more, **Advanced** at 15 or more. A level only ever rises. Each rise adds a Level history line.

## Lesson headings (one list per mode, used by teardown, write and feed)
- **technical** → build-products-kunal: Accounts and access · Data · Payments · Errors · Cost control · Secrets · Backups and recovery · Performance and scale · Stack · Keep it minimal
- **product** → build-products-pm-kunal: Users and the job · Positioning · Activation · Retention · Growth loops · Network effects · Monetisation and pricing · Unit economics · Moats · Metrics and experiments · Trade-offs
- **design** → build-products-design-kunal: Flows and IA · States and feedback · Forms and input · Visual hierarchy · Typography · Colour and contrast · Design systems · Accessibility · Content and microcopy · Motion · Trust and dark patterns

## Config

`~/.product-teardowns/config.json`, written by setup and read by the setup, feed and orchestrator stages:
```json
{
  "githubUser": "k4kd",
  "buildProductsPath": "/Users/k4kd/Downloads/build-products-kunal",
  "buildProductsUpstream": "k4kd/build-products-kunal",
  "contribute": false,
  "keepTeardowns": "permanent",
  "reaPath": "/Users/k4kd/.product-teardowns/rea"
}
```
- `buildProductsPath` is a local clone of `buildProductsUpstream`, the one and only version of the three build-products skills. Every user's agents load the skills from it, and the setup stage pulls it at the start of each run.
- `contribute`: when true, and the user isn't the upstream owner, feed opens a small pull request to `buildProductsUpstream` after each teardown, which the owner reviews. When false, feed is skipped. (Older configs call it `shareLessons`; read that if `contribute` is missing.)
- `keepTeardowns`: `permanent`, `temporary` or `ask`.
- `reaPath`: the last good local REA build (empty when REA runs from npx).

If the file is missing, use these defaults: `buildProductsPath` `~/Downloads/build-products-kunal` for the owner, `~/.product-teardowns/build-products-kunal` for everyone else, `contribute` false, `keepTeardowns` `permanent`.
