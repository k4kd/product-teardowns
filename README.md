# product-teardowns

**Learn how great products are built by taking them apart.** Name any product, such as an app, a website, an npm package or an open-source repo. Your AI coding agent tears it down to the code, then writes you a short, readable study guide on how it works. You choose the angle: how it's engineered, the product decisions that make it win, or the design choices that make it usable.

It's an [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) for Claude Code (and other agents that support skills). A run looks something like this (illustrative):

```
you:   run product-teardowns on linear, product and design
agent: ✓ found Linear (linear.app, web app)          ✓ teardown: 6 areas + product and design evidence
       ✓ research: 14 public decisions, 22 numbers   ✓ 2 docs written, readability passed (9/10, 8/10)
       ✓ pushed to your journal: product/teardowns/2026-10-19-linear.md, design/teardowns/2026-10-19-linear.md
```

## Three ways to learn from one product

| Mode | You learn | The doc covers |
|---|---|---|
| **technical** | how it's engineered | what comes in, how it's processed, what comes out and where you see it (screen, return value, terminal); every engineering concept it uses, such as caching, queues, CRDTs or hashing; clever algorithms with step-by-step trace tables |
| **product** | the product decisions, and how it makes money | the user journey and the money flow; 3–6 key decisions reconstructed (the constraint, the alternatives, the evidence, the impact, what would break, when it stops working); real numbers with sources and dates; rough impact estimates as honest ranges; product decisions that are publicly known to have worked |
| **design** | the UX, UI and interaction decisions | the flow screen by screen, with screenshots; 3–6 design decisions, each tied to a principle (Fitts, Hick, Gestalt, Norman, Nielsen) and measured evidence (contrast ratios, type and spacing scales, target sizes, accessibility checks); the design system underneath |

Run one mode, any two, or all three. They share a single teardown, so adding a mode costs only the writing.

Every doc:
- **starts simple:** each idea is explained in plain English with an everyday example, then precisely, then with a diagram;
- **skips what you know:** concepts already in your ledger get one line ("you learnt this while studying Sri Mandir");
- **gives three top-tier resources per new concept** (start, deep, mastery), each checked to load and to suit what you already know. The bar is Karpathy's *Zero to Hero*, DDIA, *Inspired*, *7 Powers* and Norman's *The Design of Everyday Things*, not listicles;
- **is honest about evidence:** every claim is marked as seen in the code, our best guess, or not known, and every number has a source and a date;
- **passes a readability test:** a fresh, deliberately weak model (Haiku) must understand it cold before it's saved.

## Install

```bash
npx github:k4kd/product-teardowns
```

Setup asks before each step, and everything it creates is in your own accounts:

1. **GitHub login:** installs the GitHub CLI if needed (Homebrew on macOS), and opens `gh auth login` if you're not logged in.
2. **The skills:** the orchestrator plus its stage skills, and [write-a-prd-kunal](https://github.com/k4kd/write-a-prd-kunal) for the writing style.
3. **REA**, the reverse-engineering tools that do the teardown, built from [its GitHub repo](https://github.com/morluto/rea). Every run updates REA to its newest release, and if GitHub is unreachable the last good build keeps working.
4. **Your learning journal:** a new **private** repo in your GitHub account, cloned to `~/learning-journal/`. Then your level in each track (beginner, intermediate or advanced), which you can skip for tracks you won't use.
5. **The build-products skills** ([build-products-kunal](https://github.com/k4kd/build-products-kunal): software, PM and design), always on the latest version. Setup also asks whether you'd like to **contribute** what you learn to them.
6. **Local files:** whether each product's downloaded code and findings in `~/teardowns/` are kept, deleted once the doc is pushed, or asked about each time.

Then restart your agent. **Requirements:** Node.js 22.19+, git (with your name and email set) and a GitHub account. **On another device,** run the same command and choose "clone the journal repo you already have".

## Use

Just name the product, and add the angle if you like:

- `run product-teardowns on openclaw` (it asks which modes)
- `technical teardown of the ms npm package`
- `PM teardown of duolingo: how does it make money?`
- `design teardown of linear.app`
- `run product-teardowns on srimandir.com, all modes, deeper`
- `re-run pm-write on srimandir` (re-runs one stage on a saved teardown, keeping the old output as `.prev` so you can compare)

"Lighter" or "deeper" changes how technical the doc gets for that run. The agent finds the product from its name (asking if several share it), fetches it **without running any of its code**, and never logs in, buys anything or submits forms on a live site.

## What you get

```
learning-journal/              your private GitHub repo
  profile.md                   your level in each track, and how it has grown
  technical/  ledger.md  teardowns.md  teardowns/<date>-<product>.md
  product/    ledger.md  teardowns.md  teardowns/<date>-<product>.md
  design/     ledger.md  teardowns.md  teardowns/<date>-<product>.md   (+ screenshots)
```

- **The ledger** lists every concept you've learnt, and the product you learnt it from. It's how later docs skip what you know.
- **Your level** in each area rises as concepts pile up: intermediate at 5, advanced at 15. Docs then go deeper and explain less of the basics.
- **The product's code and findings** stay on your machine in `~/teardowns/<product>/` (or are deleted after publishing, if you chose that). They're never pushed anywhere.

## The build-products skills get better with every teardown

Each teardown's lessons, written as general rules with their conditions ("let people start as a guest and ask for an account after they've seen value; works when the first session can show value without personal data"), go into the matching skill:

| Mode | Feeds |
|---|---|
| technical | build-products-kunal: building software safely and minimally |
| product | build-products-pm-kunal: product decisions backed by data, precedent and estimates |
| design | build-products-design-kunal: design decisions backed by principles and measurements |

There's **one version** of these skills, in [k4kd/build-products-kunal](https://github.com/k4kd/build-products-kunal), and every user's setup keeps a read-only copy up to date. If you chose to contribute, each teardown opens a small pull request there that touches only the relevant lessons, so it's easy to review, and it's merged at the author's discretion. If you didn't, nothing leaves your machine except your own journal.

## How it's built

`product-teardowns` is an **orchestrator**. Each stage of the work is its own specialist skill, and subagents run in parallel where that helps:

```
product-teardowns                 orchestrator: picks modes, runs stages, talks to you
 ├─ setup         checks the journal, levels, REA (updates it) and build-products skills
 ├─ find          name or link → the exact product, fetched without running it
 ├─ teardown      map → one subagent per area (+ product and design evidence) → merge
 ├─ pm-research   (product) web scouts: public decisions, numbers, competitors → estimates
 ├─ write         technical doc        pm-write: product doc        design-write: design doc
 ├─ resources     technical resources  pm-resources                 design-resources
 ├─ style         writing rules and depth by level (loaded by write and readability)
 ├─ readability   a fresh Haiku reader per doc, up to 3 rounds of fixes
 ├─ publish       a tested script: journal, ledgers, levels, push
 └─ feed          lessons → the build-products skills (direct, or by pull request)
```

Stages hand work to each other **only through files** in a run folder, defined once in [`skills/product-teardowns/references/contracts.md`](skills/product-teardowns/references/contracts.md). So you can improve one stage, say how resources are chosen, by editing only that stage's `SKILL.md`. Then `re-run resources on <product>` to compare the result on an old teardown.

```
bin/setup.mjs                                  the npx setup (Node, no dependencies)
skills/product-teardowns/                      orchestrator + references/contracts.md
skills/product-teardowns-<stage>/SKILL.md      one folder per stage
skills/product-teardowns-*-resources/references/curriculum.md   a verified curriculum per track
skills/product-teardowns-publish/scripts/      publish.mjs + its self-test
skills/product-teardowns-setup/scripts/        update-rea.mjs, migrate-journal.mjs + self-tests
```

Run the self-tests with `node <script>.test.mjs`.

## Privacy and safety

- **Your journal** is a private repo in your GitHub account. Nothing else is sent anywhere by this project.
- **Contributions** (only if you opt in) are general rules, never your journal, the product's code, secrets or non-public numbers.
- **Targets are studied, never run:** packages are unpacked without install scripts, and websites are only looked at. Text inside a product (including any instructions aimed at AI agents) is treated as data, and reported as a possible prompt injection.
- **Legal and scoped:** only open-source code, public sites, or things you own or may study. No bypassing licences, DRM, paywalls or logins.
- Like any agent skill, what the agent reads is processed by whichever AI model your agent uses.

## Update

`npx skills update` updates the skills. REA and the build-products skills update themselves at the start of every run. Re-run `npx github:k4kd/product-teardowns` any time to change your answers.

## License

MIT. Built on [REA](https://github.com/morluto/rea) (MIT), [write-a-prd-kunal](https://github.com/k4kd/write-a-prd-kunal) and [build-products-kunal](https://github.com/k4kd/build-products-kunal) (MIT).
