# product-teardowns

An Agent Skill for learning engineering by reverse engineering real products.

Name a product, such as an app, a binary, an Electron `.asar`, an APK, an npm package or a website. It:

1. **tears it down** with [REA](https://github.com/morluto/rea), keeping evidence and guesses separate, and keeps the code in `~/teardowns/`,
2. writes **one reading doc** that explains how the product works end to end (what comes in, how it is processed, what comes out and where you see it) and teaches every concept it uses: plain English first, then technical, with architecture, data-flow and algorithm diagrams and three top-tier resources per concept (start, deep, mastery),
3. **skips what you already know**: concepts in your ledger get one line saying which product you learnt them from,
4. checks the doc with a **readability test** (the weakest model, Haiku, must understand it cold), written in the [write-a-prd-kunal](https://github.com/k4kd/write-a-prd-kunal) style,
5. **logs** each new concept in your ledger, raises your level as concepts pile up, and pushes the doc to your private journal repo,
6. **feeds** what it learnt into [build-products-kunal](https://github.com/k4kd/build-products-kunal), so the products you build get better with every teardown.

There are no quizzes: the doc is reading material you study afterwards.

## How it's built

`product-teardowns` is an orchestrator. Each stage of the work is its own specialist skill, and the stages hand work to each other only through files in a run folder (`~/teardowns/<product>/run/`). So you can improve one stage without touching the others, and every later run picks the improvement up.

```
product-teardowns          orchestrator: runs the stages, talks to you, keeps the run folder
 ├─ product-teardowns-setup        checks the journal, profile, ledger, REA and build-products repo
 ├─ product-teardowns-find         name or link → the exact product, fetched without running it
 ├─ product-teardowns-teardown     map → one subagent per area, in parallel → merge (REA + source)
 ├─ product-teardowns-style        writing rules + depth by level (write and readability load it)
 ├─ product-teardowns-resources    one web-searching subagent per new concept → 3 checked resources
 ├─ product-teardowns-write        outline (new vs known concepts) → draft → fixes
 ├─ product-teardowns-readability  fresh Haiku reader: comprehension, level fit, crispness (max 3 runs)
 ├─ product-teardowns-publish      a script: ledger, levels, index, push to your private journal
 └─ product-teardowns-feed         lessons → build-products-kunal (public), de-duplicated
```

The file formats between stages are defined once, in `skills/product-teardowns/references/contracts.md`.

**To improve one stage:** edit only that stage's `SKILL.md`, then say "re-run <stage> on <product>". That re-runs the stage, and the stages after it, on the saved teardown, and keeps the old outputs as `.prev` so you can compare them. Change `contracts.md` only when a stage needs a new input or output.

## Install

```bash
npx github:k4kd/product-teardowns
```

Everything is set up in **your own GitHub account**. Setup asks before each step:

1. **GitHub login:** installs the [GitHub CLI](https://cli.github.com) with Homebrew if it's missing (macOS), and opens `gh auth login` if you aren't logged in. Then it continues.
2. **The skills:** installs the 10 product-teardowns skills and [write-a-prd-kunal](https://github.com/k4kd/write-a-prd-kunal) (the writing style) into the coding agents you choose, using [`skills`](https://github.com/vercel-labs/skills).
3. **REA:** clones [REA](https://github.com/morluto/rea) from GitHub into `~/.product-teardowns/`, builds it, and registers it as the `rea` MCP server in Claude Code. Every teardown then fetches REA's latest commit, builds it in a staging copy and swaps it in only if the build works, logging each attempt to `~/.product-teardowns/rea-update.log`. If GitHub is unreachable or the repo disappears, the last good local build keeps working.
4. **Your learning journal:** creates a new **private** repo in your GitHub account, cloned to `~/learning-journal/`, or clones the one you already have. Then it asks your level in systems, algorithms and code.
5. **build-products-kunal:** forks it into your account (its owner keeps the original), so every teardown adds lessons to *your* copy. It also asks whether to share your lessons with the author: if yes, each teardown opens a pull request to `k4kd/build-products-kunal`.
6. **Local files:** asks whether each product's downloaded code and findings in `~/teardowns/` are kept permanently, deleted once the doc is pushed, or asked about each time.

Your answers are saved in `~/.product-teardowns/config.json`. Re-run the setup any time to change them.

Then restart your agent and say `run product-teardowns on <product name>`.

**Requirements:** Node.js 22.19+ (for building REA) and git, with your git name and email set.

**On another device:** run the same command and choose "clone the journal repo you already have".

**Update:** `npx skills update` updates the skills. REA updates itself at the start of every teardown.

## Privacy

- Your journal is a private repo in your own GitHub account. This project never sends it anywhere else.
- Lessons go to your build-products-kunal fork, which is **public** like the original. They are written as generic patterns (for example "compute prices on the server"), never your journal, code or secrets. A pull request to the author's repo is opened only if you said yes to sharing.
- Downloaded products go to `~/teardowns/<name>/`. The skill fetches code without running it, and it asks before running or installing anything.
- Like any agent skill, everything the agent reads is processed by whichever AI model your agent uses. That includes the product being studied and your journal.

## Use

- "Run product-teardowns on openclaw" (just a name: it finds and fetches the target itself, without running it)
- "Use product-teardowns on /Applications/Linear.app. How does it sync so fast?"
- "Tear down this APK and teach me how its offline mode works."
- "Re-run resources on srimandir" (after improving the resources stage)
- "Run product-teardowns on express, deeper" ("lighter" or "deeper" changes how technical the doc goes)

## Layout

```
bin/setup.mjs                          # the npx setup (Node, no dependencies)
skills/product-teardowns/            # orchestrator + references/contracts.md
skills/product-teardowns-<stage>/SKILL.md  # one folder per stage
skills/product-teardowns-resources/references/curriculum.md
skills/product-teardowns-write/references/product-lens.md
skills/product-teardowns-publish/scripts/publish.mjs (+ publish.test.mjs)
```

## License

MIT. It builds on REA (MIT), write-a-prd-kunal and build-products-kunal (MIT).
