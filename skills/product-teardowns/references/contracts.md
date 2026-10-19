# Contracts

Stages talk to each other only through these files. A stage may change *how* it does its job freely, as long as it still reads and writes these formats. Changing a format here is the one change that touches more than one stage, so do it deliberately and update every stage that reads it.

## The run folder

`~/teardowns/<slug>/run/`, where `<slug>` is the lowercase product name with dashes (`sri-mandir`, `openclaw`). The product's own code sits beside it in `~/teardowns/<slug>/` and is never committed anywhere.

### status.md (orchestrator)
```markdown
| Stage | State | Finished | Notes |
|---|---|---|---|
| find | done | 2026-10-19 14:02 | npm package ms@2.1.3 |
| teardown-map | done | 2026-10-19 14:10 | 3 areas |
```
State is `done`, `failed` or `skipped`. A stage counts as done only if its row says so **and** its output files exist.

### target.md (find)
```markdown
# <Product name>
- Kind: npm package | source repo | desktop app | mobile app | website | binary | other
- Version: <exact version, commit hash, or build ID>
- Source: <repo URL or "closed">
- Local paths: <~/teardowns/<slug>/src, ~/teardowns/<slug>/package, …>
- URLs: <homepage, registry page, live site>
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
The label is `observed` (an REA evidence ID or a file:line), `inferred`, or `unknown`.

### findings/ (teardown, merge role)
- `index.md`: one section per area, conflicts between areas resolved and stated, every concept spotted (de-duplicated), and **Lessons for builders**: every steal, skip and red flag from the areas, de-duplicated and grouped under the lesson headings below.
- `e2e.md`: one real input followed end to end: **What comes in → What happens to it** (each step, with the data's shape after it) **→ What comes out → Where you see it** (the screen, the value a library returns, terminal output, or a system call result).
- `coverage.md`: the merged coverage table, plus REA's coverage result when REA ran, and a one-line honest summary ("read 212 of 240 files; the 28 generated files were skipped").

### outline.md (write, outline role)
```markdown
# Outline: <product>
## New concepts (in teaching order, foundations first)
| # | Concept | Area | Track | Builds on |
|---|---|---|---|---|
| 1 | Hashing | Algorithms | Algorithms and data structures | nothing new |
| 2 | Content-addressed IDs | Systems/infra | Databases and storage | Hashing (#1) |
## Already learnt
| Concept | Learnt from | Date | One-line reminder for this product |
|---|---|---|---|
```
Area is one of `Systems/infra`, `Algorithms`, `Code`. Track is a heading in product-teardowns-resources' curriculum.md, or `new: <name>`.

### resources/<concept-slug>.md (resources, scout role)
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

### doc.md and publish.json (write, draft role)
`doc.md` is the finished reading doc. `publish.json` is what the publish script needs:
```json
{
  "slug": "2026-10-19-ms",
  "target": "ms",
  "version": "2.1.3",
  "lesson": "one sentence: the top lesson",
  "newConcepts": [{ "name": "Hashing", "area": "Algorithms" }]
}
```

### readability-<n>.md (readability)
```markdown
# Readability run <n>
- Verdict: PASS | FAIL
- Score: <1–10>   Answers correct: <x>/<y>   One story: yes/no   Level fit: yes/no
## Fixes needed   (line, quote, the problem, the fix; empty on PASS)
```

### lessons.md (feed)
The rules added or merged into build-products-kunal this run, so the orchestrator can report them.

## The journal

`~/learning-journal/`, a private GitHub repo. Setup creates these files, write reads them, and the publish script updates them.

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
- <date>: started at Systems/infra Beginner, Algorithms Beginner, Code Beginner (setup)
```

### ledger.md
```markdown
# Ledger

Every concept learnt, one row each. A concept appears once, under the product where it was first learnt.

| Concept | Area | Learnt from | Date | Doc |
|---|---|---|---|---|
| Hashing | Algorithms | ms 2.1.3 | 2026-10-19 | [doc](teardowns/2026-10-19-ms.md) |
```

### teardowns.md
```markdown
# Teardowns

- <date> · <target> (<version>) · Lesson: <top lesson> · [doc](teardowns/<slug>.md)
```

### Lesson headings (one list, used by teardown, write and feed)
Accounts and access · Data · Payments · Errors · Cost control · Secrets · Backups and recovery · Performance and scale · Stack · Keep it minimal

### Level rule (applied by the publish script)
Count the ledger rows in each area: **Beginner** below 5, **Intermediate** at 5 or more, **Advanced** at 15 or more. A level only ever rises. Each rise adds a Level history line.

## Config

`~/.product-teardowns/config.json`, written by setup and read by the setup, feed and orchestrator stages:
```json
{
  "githubUser": "k4kd",
  "buildProductsPath": "/Users/k4kd/Downloads/build-products-kunal",
  "buildProductsUpstream": "k4kd/build-products-kunal",
  "shareLessons": false,
  "keepTeardowns": "permanent",
  "reaPath": "/Users/k4kd/.product-teardowns/rea"
}
```
- `buildProductsPath` is the user's own clone: the original repo for its owner, otherwise the user's fork.
- `shareLessons`: when true, and the user isn't the upstream owner, feed opens a pull request to `buildProductsUpstream` after each push.
- `keepTeardowns`: `permanent`, `temporary` or `ask`.
- `reaPath`: the last good local REA build (empty when REA runs from npx).

If the file is missing, use these defaults: `buildProductsPath` `~/Downloads/build-products-kunal`, `shareLessons` false, `keepTeardowns` `permanent`.
