---
name: product-teardowns-setup
description: Stage of product-teardowns. Checks that the learning journal, learner profile, ledger, REA (rebuilt from its newest GitHub release each run, with a local fallback), write-a-prd-kunal and the latest build-products skills are all in place before a teardown, and fixes what is missing. Run by the product-teardowns orchestrator, not on its own.
license: MIT
metadata:
  author: kunal
  version: "1.1.0"
---

# Setup stage

First-time setup is the `npx github:k4kd/product-teardowns` script (`bin/setup.mjs` in the repo). It logs the user into GitHub and creates everything in *their own* GitHub account. This stage runs at the start of every session, checks that everything is still in place, and updates REA. Formats, including `~/.product-teardowns/config.json`, are in the orchestrator's `references/contracts.md`.

Read `~/.product-teardowns/config.json` first (use the contract's defaults if it's missing). Then run the checks in order, and stop at the first one you can't fix:

1. **Journal repo.** `~/learning-journal/` exists, is a git repo and has an `origin` remote. Run `git -C ~/learning-journal pull --rebase --autostash --quiet`. If the pull fails, say so and continue on the local copy, and never discard local changes. If the folder is missing or has no remote, tell the user to run `npx github:k4kd/product-teardowns`, and stop.
2. **profile.md.** If it's missing, ask two questions, one at a time: what the user wants to be able to do in a year, and how deep explanations should go. Write it from the contract template with only the Goal, Default depth and Level history. The levels sections are added in step 4. Never overwrite an existing profile.
3. **Journal layout.** Run `node <this skill's folder>/scripts/migrate-journal.mjs`. It moves an old flat journal into `technical/` once and otherwise does nothing. Each mode's ledger is created by its first publish.
4. **Levels for this run's modes.** For each mode in this run whose levels section is missing from profile.md (see the contracts), ask the user's overall level in that track in one question (beginner / intermediate / advanced), and add the section with every area of the mode set to it, the same way the npx setup does. Add a Level history line. Don't ask about modes this run doesn't use.
5. **REA, latest version.** Run `node <this skill's folder>/scripts/update-rea.mjs`. It fetches `github.com/morluto/rea` into a local clone, builds its newest release (tag) in a staging copy, swaps it in only if the build works, refreshes the reverse-engineer-anything skill from the build, and logs every attempt to `~/.product-teardowns/rea-update.log`. If GitHub is unreachable or the repo is gone, it keeps the last good local build. Report its `status` in a few words:
   - `updated`: a new REA was built. The MCP server already running in this session is still the old one. It switches next session, or after `/mcp` reconnects `rea`.
   - `unchanged` or `fallback`: carry on with the current build. For `fallback`, include the detail.
   - `unavailable`: there's no local build and GitHub can't be reached. Use the registered REA if its tools work, otherwise suggest `npx rea-agents@latest setup`.

   Then check that the REA MCP tools (`mcp__rea__*`) are available. If `claude mcp list` shows `rea` still running from `npx` while a local build exists, suggest re-running the npx setup to switch it. Don't change the MCP config yourself. Without any REA tools, teardowns can continue on source alone, but only if the user agrees.
6. **write-a-prd-kunal.** The style stage loads it. If it isn't installed, suggest `npx skills add k4kd/write-a-prd-kunal -g`. Docs are still written without it, but with only the style stage's own rules.
7. **build-products skills (all three), always the latest approved version.** `buildProductsPath` from the config is a local clone of `buildProductsUpstream` (k4kd/build-products-kunal), the only version of build-products-kunal, build-products-pm-kunal and build-products-design-kunal. If it's missing, tell the user to re-run the npx setup.
   - Run `git -C <path> checkout --quiet main && git -C <path> pull --ff-only --quiet`. If it can't fast-forward (local changes on `main`), say so and leave it. A contributor's local `lessons/*` branches are fine: they stay on their branches.
   - For Claude Code, `~/.claude/skills/<name>` should be a symlink to `<path>/skills/<name>` for each of the three. Create any that are missing, but never replace a real folder: if one is in the way, say so.

Report in one line: what was fixed or updated, and anything still missing.
