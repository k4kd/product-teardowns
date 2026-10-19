# reverse-learn-kunal

An Agent Skill for learning engineering by reverse engineering real products.

Name a product, such as an app, a binary, an Electron `.asar`, an APK, an npm package or a website. It:

1. **tears it down** with [REA](https://github.com/morluto/rea), keeping evidence and guesses separate, and keeps the code in `~/teardowns/`,
2. writes **one reading doc** that explains how the product works end to end (what comes in, how it is processed, what comes out and where you see it) and teaches every concept it uses: plain English first, then technical, with architecture, data-flow and algorithm diagrams and three top-tier resources per concept (start, deep, mastery),
3. **skips what you already know**: concepts in your ledger get one line saying which product you learnt them from,
4. checks the doc with a **readability test** (the weakest model, Haiku, must understand it cold), written in the [write-a-prd-kunal](https://github.com/k4kd/write-a-prd-kunal) style,
5. **logs** each new concept in your ledger, raises your level as concepts pile up, and pushes the doc to your private journal repo,
6. **feeds** what it learnt into [build-products-kunal](https://github.com/k4kd/build-products-kunal), so the products you build get better with every teardown.

There are no quizzes: the doc is reading material you study afterwards.

## Install

```bash
npx github:k4kd/reverse-learn-kunal
```

Setup asks before each step:

1. **The skill:** installs it into the coding agents you choose (Claude Code, Codex, Cursor and others), using [`skills`](https://github.com/vercel-labs/skills).
2. **REA:** runs REA's own setup (`npx rea-agents@latest setup`), which shows every change it will make and asks before applying it. The skill needs REA for teardowns, so skip this only if REA is already set up.
3. **Your learning journal:** creates a new **private** GitHub repo cloned to `~/learning-journal/` (needs the [GitHub CLI](https://cli.github.com), logged in), or clones the one you already have. It then asks your level in systems, algorithms and code, and writes `profile.md` and an empty `ledger.md`.

Then restart your agent and say `run reverse-learn-kunal on <product name>`.

**Requirements:** Node.js 18+ and git, with your git name and email set. The GitHub CLI is needed for the journal repo.

**On another device:** run the same command and choose "clone the journal repo you already have".

**Update:** `npx skills update` updates the skill, and `npx rea-agents@latest setup` updates REA.

**Manual install** (no setup script): run `npx skills add k4kd/reverse-learn-kunal -g` and `npx rea-agents@latest setup`. Then create the journal yourself: a private repo cloned to `~/learning-journal/`. The skill asks your level on its first run.

## Privacy

- Your journal stays in `~/learning-journal/`, and your own private GitHub repo. This project never sends it anywhere else.
- Lessons go to build-products-kunal, which is a **public** repo. They are written as generic patterns (for example "compute prices on the server"), never your journal, code or secrets.
- Like any agent skill, everything the agent reads is processed by whichever AI model your agent uses. That includes the target being studied and your journal.
- Downloaded targets go to `~/teardowns/<name>/`. The skill fetches code without running it, and it asks before running or installing anything.

## Use

- "Run reverse-learn-kunal on openclaw" (just a name: it finds and fetches the target itself, without running it)
- "Use reverse-learn-kunal on /Applications/Linear.app. How does it sync so fast?"
- "Tear down this APK and teach me how its offline mode works."
- "Run reverse-learn-kunal on express, deeper" ("lighter" or "deeper" changes how technical the doc goes)

## Layout

```
bin/setup.mjs                 # the npx setup (Node, no dependencies)
skills/reverse-learn-kunal/
  SKILL.md
  references/doc.md           # the reading doc: structure, style overrides, readability test, journal templates, level rule
  references/product-lens.md  # steal / skip table
  references/curriculum.md    # tracks → start / deep / mastery resources
```

## License

MIT. It builds on REA (MIT), write-a-prd-kunal and build-products-kunal (MIT).
